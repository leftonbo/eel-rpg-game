import { StatusEffectManager, StatusEffectType } from '../systems/StatusEffect';
import { Player } from './Player';
import { calculateAttackResult } from '../utils/CombatUtils';
import { Actor } from './Actor';
import { MessageData } from '../scenes/components/BattleMessageComponent';

// Message formatter utility
export function formatMessage(template: string, nameUser: string, nameTarget: string): string {
    return template
        .replace(/{boss}/g, nameUser)
        .replace(/{player}/g, nameTarget)
}

export enum ActionType {
    Attack = 'attack',
    StatusAttack = 'status-attack',
    RestraintAttack = 'restraint-attack',
    CocoonAttack = 'cocoon-attack',
    CocoonAction = 'cocoon-action',
    EatAttack = 'eat-attack',
    DevourAttack = 'devour-attack',
    PostDefeatedAttack = 'post-defeated-attack',
    FinishingMove = 'finishing-move', // Custom finishing move
    Skip = 'skip'
}

export interface BossAction {
    id: string; // Unique identifier for the action within the boss, used for action identification, logging, and debugging
    type: ActionType;
    name: string;
    description: string;
    messages?: string[]; // Optional messages with format specifiers: {boss}, {player}
    damageFormula?: (user: Boss) => number; // Function to calculate damage based on actor's stats
    statusEffect?: StatusEffectType;
    statusDuration?: number;
    weight: number; // Probability weight for AI selection
    canUse?: (boss: Boss, player: Player, turn: number) => boolean;
    onPreUse?: (action: BossAction, boss: Boss, player: Player, turn: number) => BossAction | null; // Pre-use callback to modify action before execution
    onUse?: (boss: Boss, player: Player, turn: number) => string[]; // Custom action callback
    hitRate?: number; // Attack hit rate (default: 95%)
    criticalRate?: number; // Critical hit rate (default: 5%)
    statusChance?: number; // Status effect application chance (default: 1.0, range: 0.0-1.0)
    playerStateCondition?: 'normal' | 'ko' | 'restrained' | 'cocoon' | 'eaten' | 'defeated'; // Required player state
    healRatio?: number; // HP absorption ratio from damage dealt (0.0 = no healing, 1.0 = 100% healing)
    damageVarianceMin?: number; // Minimum damage variance percentage (default: -20)
    damageVarianceMax?: number; // Maximum damage variance percentage (default: +20)
}

/**
 * 記念品テンプレート定義
 * 各ボスの勝利・敗北時記念品の内部データ
 */
export interface TrophyData {
    /** 記念品名 */
    name: string;
    /** 記念品の説明 */
    description: string;
}

export interface BossData {
    /** ボスの一意な識別子 */
    id: string;
    /** @deprecated 現在は使用していません - 表示名は displayName を使用してください */
    name: string;
    /** ボスの表示名 */
    displayName: string;
    /** ボスのアイコン */
    icon: string;
    /** ボスの短文説明 */
    description: string;
    /** ボス外観説明文 */
    appearanceNote?: string;
    /** ボス選択時のクエスト風テキスト表示 */
    questNote: string;
    /** ボスの最大HP */
    maxHp: number;
    /** ボスの基礎攻撃力 */
    attackPower: number;
    /** ボスの行動リスト */
    actions: BossAction[];
    /** ボスの性格や特徴 */
    personality?: string[];
    /** AI戦略関数 */
    aiStrategy?: (boss: Boss, player: Player, turn: number) => BossAction;
    /** @deprecated 現在は使用していません - 行動メッセージや battleStartMessages を使用してください */
    getDialogue?: (situation: 'battle-start' | 'player-restrained' | 'player-eaten' | 'player-escapes' | 'low-hp' | 'victory') => string;
    /** 自動とどめ攻撃のメッセージ */
    finishingMove?: () => string[];
    /** 自動とどめ攻撃を抑制し、AI戦略でカスタムとどめ攻撃を処理 */
    suppressAutoFinishingMove?: boolean;
    /** ゲストキャラクター情報（制作者名、元キャラ名など） */
    guestCharacterInfo?: BossGuestCharacterInfo;
    /** 戦闘開始時のメッセージ進行 */
    battleStartMessages?: MessageData[];
    /** 戦闘勝利時のメッセージ進行 */
    victoryMessages?: MessageData[];
    /**
     * ボス固有のカスタム変数
     * AI戦略で使用する状態管理や行動制御のための変数を定義
     * @example
     * {
     *   fireBreathCooldown: 0,    // 火のブレス攻撃のクールダウン
     *   aggressionLevel: 1,       // 攻撃性レベル（1-3）
     *   enrageThreshold: 30,      // 怒り状態発動のHP閾値
     *   specialMoveUsed: false    // 特殊技使用フラグ
     * }
     */
    customVariables?: Record<string, any>;
    /**
     * エクスプローラーアビリティで解禁されるレベル
     * 未指定の場合は 0 として扱われ、最初から利用可能
     */
    explorerLevelRequired?: number;
    /**
     * 勝利時記念品テンプレート
     * 「外側から採れるもの」の設定
     */
    victoryTrophy?: TrophyData;
    /**
     * 敗北時記念品テンプレート  
     * 「内側（体内）から採れるもの」の設定
     */
    defeatTrophy?: TrophyData;
}

/**
 * ゲストキャラクター情報
 */
export interface BossGuestCharacterInfo {
    /** 制作者名 */
    creator: string;
    /** 元となったキャラクター名 */
    characterName?: string;
}

// Constants for Boss class
const BOSS_UNLIMITED_MP = 999999;
const DEFAULT_MAX_HP_ABSORPTION_RATIO = 0.1;
const DEFAULT_MP_DRAIN_RATIO = 0.5;
const DEFAULT_STATUS_CHANCE = 1.0;
const RESTRAINT_STUN_DURATION = 3;

export class Boss extends Actor {
    public data: BossData;
    public id: string;
    public name: string;
    public description: string;
    public questNote: string;
    public actions: BossAction[];
    public personality: string[];
    public aiStrategy?: (boss: Boss, player: Player, turn: number) => BossAction;
    public specialDialogues: Map<string, string> = new Map();
    public finishingMove?: () => string[];
    public battleStartMessages?: MessageData[];
    public victoryMessages?: MessageData[];
    public suppressAutoFinishingMove: boolean;
    public icon: string;
    public guestCharacterInfo?: BossGuestCharacterInfo;
    
    /**
     * 一度でも使用したスキル名
     * プレイヤーのエクスプローラー経験値計算で使用する
     */
    public usedSkillNames: Set<string> = new Set();
    
    /**
     * ボス固有のカスタム変数
     * AI戦略での状態管理、クールダウン管理、行動制御などに使用
     * ボスデータの初期値をコピーして初期化される
     */
    private customVariables: Record<string, any> = {};
    
    constructor(data: BossData) {
        super(data.displayName);
        this.data = data;
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.questNote = data.questNote;
        this.actions = data.actions;
        this.personality = data.personality || [];
        this.aiStrategy = data.aiStrategy;
        this.finishingMove = data.finishingMove;
        this.battleStartMessages = data.battleStartMessages;
        this.victoryMessages = data.victoryMessages;
        this.suppressAutoFinishingMove = data.suppressAutoFinishingMove || false;
        this.icon = data.icon || '👹';
        this.guestCharacterInfo = data.guestCharacterInfo;
        this.customVariables = data.customVariables ? { ...data.customVariables } : {};
        
        // Safety stats recalculation
        this.resetBattleState();
    }

    /**
     * Apply localized boss data without resetting battle state.
     */
    applyLocalizedData(data: BossData): void {
        this.data = data;
        this.displayName = data.displayName;
        this.name = data.name;
        this.description = data.description;
        this.questNote = data.questNote;
        this.actions = data.actions;
        this.personality = data.personality || [];
        this.aiStrategy = data.aiStrategy;
        this.finishingMove = data.finishingMove;
        this.battleStartMessages = data.battleStartMessages;
        this.victoryMessages = data.victoryMessages;
        this.suppressAutoFinishingMove = data.suppressAutoFinishingMove || false;
        this.icon = data.icon || '👹';
        this.guestCharacterInfo = data.guestCharacterInfo;
    }

    /**
     * Recalculate stats based on boss data
     */
    recalculateStats(): void {
        this.maxHp = this.data.maxHp;
        this.maxMp = BOSS_UNLIMITED_MP; // Unlimited MP
        this.attackPower = this.data.attackPower;
    }

    /**
     * Boss has unlimited MP - override to always return true
     */
    consumeMp(_amount: number): boolean {
        // Boss MP is unlimited, so consumption always succeeds
        return true;
    }

    /**
     * Boss has unlimited MP - override to do nothing
     */
    recoverMp(_amount: number): number {
        // Boss MP is unlimited, no recovery needed
        return 0;
    }

    /**
     * Heal HP based on damage dealt with a ratio
     */
    healFromDamage(damage: number, ratio: number): number {
        if (ratio <= 0 || damage <= 0) return 0;
        
        const healAmount = Math.floor(damage * ratio);
        return this.heal(healAmount);
    }

    /**
     * カスタム変数を取得する
     */
    getCustomVariable<T = any>(key: string, defaultValue?: T): T {
        const value = this.customVariables[key];
        if (value === undefined) {
            return defaultValue as T;
        }
        return value as T;
    }

    /**
     * カスタム変数を設定する
     */
    setCustomVariable<T = any>(key: string, value: T): void {
        this.customVariables[key] = value;
    }

    /**
     * カスタム変数が存在するかチェック
     */
    hasCustomVariable(key: string): boolean {
        return key in this.customVariables;
    }

    /**
     * カスタム変数を削除する
     */
    removeCustomVariable(key: string): void {
        delete this.customVariables[key];
    }

    /**
     * 数値型カスタム変数を増減する
     * 既存の値が数値でない場合はTypeErrorを投げる
     * 変数が存在しない場合は0として扱う
     * @param key 変数名
     * @param delta 増減値
     * @returns 変更後の値
     * @throws {TypeError} 既存の値が数値型でない場合
     */
    modifyCustomVariable(key: string, delta: number): number {
        const currentValue = this.getCustomVariable(key);
        
        // 変数が存在する場合は型チェック
        if (currentValue !== undefined && typeof currentValue !== 'number') {
            throw new TypeError(`Cannot modify custom variable '${key}': existing value is not a number (current type: ${typeof currentValue})`);
        }
        
        const numericValue = currentValue ?? 0;
        const newValue = numericValue + delta;
        this.setCustomVariable(key, newValue);
        return newValue;
    }

    /**
     * 全てのカスタム変数を取得
     */
    getAllCustomVariables(): Record<string, any> {
        return { ...this.customVariables };
    }

    /**
     * カスタム変数をリセット
     */
    resetCustomVariables(): void {
        this.customVariables = {};
    }
    
    /**
     * 使用したスキル名を記録
     */
    addUsedSkill(skillName: string): void {
        this.usedSkillNames.add(skillName);
    }
    
    /**
     * 使用したスキル名一覧を取得
     */
    getUsedSkillNames(): string[] {
        return Array.from(this.usedSkillNames);
    }
    
    /**
     * 使用したスキル名をリセット
     */
    resetUsedSkillNames(): void {
        this.usedSkillNames.clear();
    }
    
    
    
    selectAction(player: Player, turn: number): BossAction | null {
        if (!this.canAct()) {
            return {
                id: 'stunned-skip',
                type: ActionType.Skip,
                name: '行動不能',
                description: '反動で動けない',
                messages: [
                    '{boss}は反動で動けない...'
                ],
                weight: 1
            };
        }
        
        // Use custom AI strategy if available
        if (this.aiStrategy) {
            return this.aiStrategy(this, player, turn);
        }
        
        // Default AI: weighted random selection
        const availableActions = this.actions.filter(action => {
            // Check player state condition
            if (action.playerStateCondition) {
                const currentPlayerState = this.getPlayerState(player);
                if (action.playerStateCondition !== currentPlayerState) {
                    return false;
                }
            }
            
            if (action.canUse) {
                return action.canUse(this, player, turn);
            }
            return true;
        });
        
        if (availableActions.length === 0) {
            return null;
        }
        
        // Calculate total weight
        const totalWeight = availableActions.reduce((sum, action) => sum + action.weight, 0);
        
        // Random selection based on weights
        let random = Math.random() * totalWeight;
        
        for (const action of availableActions) {
            random -= action.weight;
            if (random <= 0) {
                return action;
            }
        }
        
        return availableActions[0]; // Fallback
    }
    
    public getPlayerState(player: Player): 'normal' | 'ko' | 'restrained' | 'cocoon' | 'eaten' | 'defeated' {
        if (player.isDefeated()) return 'defeated';
        if (player.isEaten()) return 'eaten';
        if (player.statusEffects.isCocoon()) return 'cocoon';
        if (player.isRestrained()) return 'restrained';
        if (player.isKnockedOut()) return 'ko';
        return 'normal';
    }
    
    private calculateActionDamage(action: BossAction): number | undefined {
        if (action.damageFormula) {
            return action.damageFormula(this); // Use damage formula if provided
        }
        
        return undefined; // No damage defined
    }
    
    executeAction(action: BossAction, player: Player, turn: number = 0): string[] {
        // Modify action before execution if onPreUse callback is provided
        if (action.onPreUse) {
            // use instance of BossAction to prevent mutation of original action
            const modifiedAction = action.onPreUse({ ...action }, this, player, turn);
            // If the action was modified, use the new action
            // returning null means the action was not modified
            if (modifiedAction) {
                action = modifiedAction; // Use the modified action
            }
        }
        
        const messages = this.processActionStart(action, player);
        
        // Check for invincible status first
        if (player.statusEffects.hasEffect(StatusEffectType.Invincible)) {
            messages.push(`${player.name}は攻撃を華麗に回避した！`);
            return messages;
        }
        
        // Execute action based on type
        const actionMessages = this.executeActionByType(action, player, turn);
        messages.push(...actionMessages);
        
        // Execute custom onUse callback if provided
        const customMessages = this.executeCustomCallback(action, player, turn);
        messages.push(...customMessages);
        
        return messages;
    }
    
    private processActionStart(action: BossAction, player: Player): string[] {
        const messages: string[] = [];
        
        // Record skill usage for Explorer experience calculation
        this.addUsedSkill(action.name);
        
        // Process custom messages if provided
        if (action.messages && action.messages.length > 0) {
            action.messages.forEach(messageTemplate => {
                const formattedMessage = formatMessage(messageTemplate, this.displayName, player.displayName);
                messages.push(formattedMessage);
            });
        } else {
            // Default message if no custom messages provided
            messages.push(`${this.displayName}の${action.name}！`);
        }
        
        return messages;
    }
    
    private executeActionByType(action: BossAction, player: Player, _turn: number): string[] {
        switch (action.type) {
            case ActionType.Attack:
                return this.executeAttackAction(action, player);
            case ActionType.StatusAttack:
                return this.executeStatusAttackAction(action, player);
            case ActionType.RestraintAttack:
                return this.executeRestraintAttackAction(action, player);
            case ActionType.CocoonAttack:
                return this.executeCocoonAttackAction(action, player);
            case ActionType.CocoonAction:
                return this.executeCocoonAction(action, player);
            case ActionType.EatAttack:
                return this.executeEatAttackAction(action, player);
            case ActionType.DevourAttack:
                return this.executeDevourAttackAction(action, player);
            case ActionType.FinishingMove:
                return this.executeFinishingMoveAction(action, player);
            case ActionType.PostDefeatedAttack:
                return this.executePostDefeatedAttackAction(action, player);
            case ActionType.Skip:
                return this.executeSkipAction(action);
            default:
                console.warn(`Unknown action type: ${action.type}`);
                return [`${this.displayName}の行動が理解できない...`];
        }
    }
    
    private executeCustomCallback(action: BossAction, player: Player, turn: number): string[] {
        if (!action.onUse) {
            return [];
        }
        
        const customMessages = action.onUse(this, player, turn);
        if (!customMessages || customMessages.length === 0) {
            return [];
        }
        
        // Format custom messages with actor names
        return customMessages.map(msg => formatMessage(msg, this.displayName, player.name));
    }
    
    private executeAttackAction(action: BossAction, player: Player): string[] {
        const messages: string[] = [];

        const baseDamage = this.calculateActionDamage(action);
        const accuracyModifier = this.statusEffects.getAccuracyModifier();
        const attackResult = calculateAttackResult(
            baseDamage ?? 0,
            player.isKnockedOut(),
            action.hitRate,
            action.criticalRate,
            action.damageVarianceMin,
            action.damageVarianceMax,
            accuracyModifier
        );

        if (attackResult.isMiss) {
            messages.push(`しかし、攻撃は外れた！`);
        } else {
            if (baseDamage) {
                const actualDamage = player.takeDamage(attackResult.damage);
                if (attackResult.isCritical) {
                    messages.push(`痛恨の一撃！ ${player.name}に${actualDamage}のダメージ！`);
                } else {
                    messages.push(`${player.name}に${actualDamage}のダメージ！`);
                }

                // Check for HP absorption
                const healMessages = this.processHpAbsorption(action, actualDamage);
                messages.push(...healMessages);
            }

            if (action.statusEffect) {
                const statusMessages = this.processStatusEffect(action, player);
                messages.push(...statusMessages);
            }
        }

        return messages;
    }
    
    private executeStatusAttackAction(action: BossAction, player: Player): string[] {
        const messages: string[] = [];

        const baseDamage = this.calculateActionDamage(action);
        const accuracyModifier = this.statusEffects.getAccuracyModifier();
        const attackResult = calculateAttackResult(
            baseDamage ?? 0,
            player.isKnockedOut(),
            action.hitRate,
            action.criticalRate,
            action.damageVarianceMin,
            action.damageVarianceMax,
            accuracyModifier
        );

        if (attackResult.isMiss) {
            messages.push(`しかし、攻撃は外れた！`);
        } else {
            if (baseDamage) {
                const actualDamage = player.takeDamage(attackResult.damage);
                if (attackResult.isCritical) {
                    messages.push(`痛恨の一撃！ ${player.name}に${actualDamage}のダメージ！`);
                } else {
                    messages.push(`${player.name}に${actualDamage}のダメージ！`);
                }

                // Check for HP absorption
                const healMessages = this.processHpAbsorption(action, actualDamage);
                messages.push(...healMessages);
            }

            if (action.statusEffect) {
                const statusMessages = this.processStatusEffect(action, player);
                messages.push(...statusMessages);
            }
        }

        return messages;
    }
    
    private executeRestraintAttackAction(action: BossAction, player: Player): string[] {
        const messages: string[] = [];

        const baseDamage = this.calculateActionDamage(action);
        const accuracyModifier = this.statusEffects.getAccuracyModifier();
        const attackResult = calculateAttackResult(
            baseDamage ?? 0,
            player.isKnockedOut(),
            action.hitRate,
            action.criticalRate,
            action.damageVarianceMin,
            action.damageVarianceMax,
            accuracyModifier
        );

        if (attackResult.isMiss) {
            messages.push(`しかし、攻撃は外れた！`);
        } else {
            if (baseDamage) {
                const actualDamage = player.takeDamage(attackResult.damage);
                if (attackResult.isCritical) {
                    messages.push(`痛恨の一撃！ ${player.name}に${actualDamage}のダメージ！`);
                } else {
                    messages.push(`${player.name}に${actualDamage}のダメージ！`);
                }

                // Check for HP absorption
                const healMessages = this.processHpAbsorption(action, actualDamage);
                messages.push(...healMessages);
            }

            if (action.statusEffect) {
                const statusMessages = this.processStatusEffect(action, player);
                messages.push(...statusMessages);
            }

            if (!player.isRestrained()) {
                // Apply restraint effect
                player.statusEffects.addEffect(StatusEffectType.Restrained);
                player.struggleAttempts = 0; // Reset struggle attempts
                messages.push(`${player.name}は拘束された！`);
            }
        }

        return messages;
    }
    
    private executeCocoonAttackAction(_action: BossAction, player: Player): string[] {
        // Transform restrained state to cocoon state
        if (player.isRestrained()) {
            player.statusEffects.removeEffect(StatusEffectType.Restrained);
        }
        player.statusEffects.addEffect(StatusEffectType.Cocoon);
        player.struggleAttempts = 0; // Reset struggle attempts
        return [`${player.name}が繭状態になった！`];
    }
    
    private executeCocoonAction(action: BossAction, player: Player): string[] {
        const messages: string[] = [];
        
        if (!player.statusEffects.isCocoon()) {
            return messages;
        }
        
        const actionDamage = this.calculateActionDamage(action);
        const maxHpReduction = actionDamage ? Math.floor(actionDamage) : Math.floor(player.maxHp * DEFAULT_MAX_HP_ABSORPTION_RATIO);
        
        if (maxHpReduction > 0) {
            player.loseMaxHp(maxHpReduction);
            messages.push(`${player.name}の最大HPが${maxHpReduction}減少した！`);
            
            // Check for HP absorption for boss healing/growth
            if (action.healRatio && action.healRatio > 0) {
                const healedAmount = this.healFromDamage(maxHpReduction, action.healRatio);
                if (healedAmount > 0) {
                    messages.push(`${this.displayName}は${healedAmount}HP回復した！`);
                }
                
                // Boss can also gain max HP (for certain actions like "circulation")
                const maxHpGain = Math.floor(maxHpReduction * (action.healRatio || 0));
                if (maxHpGain > 0) {
                    this.gainMaxHp(maxHpGain);
                    messages.push(`${this.displayName}の最大HPが${maxHpGain}増加した！`);
                }
            }
        }
        
        // Apply direct damage if specified
        if (actionDamage && actionDamage > 0) {
            const actualDamage = player.takeDamage(actionDamage);
            messages.push(`${player.name}に${actualDamage}のダメージ！`);
        }
        
        // Apply status effect if specified
        if (action.statusEffect) {
            const statusMessages = this.processStatusEffect(action, player);
            messages.push(...statusMessages);
        }
        
        return messages;
    }
    
    private executeEatAttackAction(_action: BossAction, player: Player): string[] {
        if (player.isRestrained()) {
            // Transform restrained state to eaten state
            player.statusEffects.removeEffect(StatusEffectType.Restrained);
        }
        player.statusEffects.addEffect(StatusEffectType.Eaten);
        return [`${player.name}が食べられてしまった！`];
    }
    
    private executeDevourAttackAction(action: BossAction, player: Player): string[] {
        const messages: string[] = [];
        
        // Apply variance to absorption amount
        const baseAbsorption = this.calculateActionDamage(action) ?? Math.floor(player.maxHp * DEFAULT_MAX_HP_ABSORPTION_RATIO);
        const accuracyModifier = this.statusEffects.getAccuracyModifier();
        const statusAttackResult = calculateAttackResult(
            baseAbsorption, 
            player.isKnockedOut(), 
            action.hitRate, 
            action.criticalRate,
            action.damageVarianceMin,
            action.damageVarianceMax,
            accuracyModifier
        );
        const hpAbsorbed = statusAttackResult.damage;
        
        if (hpAbsorbed > 0) {
            player.loseMaxHp(hpAbsorbed);
            messages.push(`${player.name}の最大ヘルスが${hpAbsorbed}奪われた！`);

            // Boss gains the absorbed max HP
            this.gainMaxHp(hpAbsorbed);
        }
        
        // Absorb MP (also with variance)
        const baseMpDrain = Math.floor(baseAbsorption * DEFAULT_MP_DRAIN_RATIO);
        const statusMpDrainResult = calculateAttackResult(
            baseMpDrain, 
            player.isKnockedOut(), 
            1.0, 
            0.0,
            action.damageVarianceMin,
            action.damageVarianceMax,
            accuracyModifier
        );
        const mpDrainAmount = statusMpDrainResult.damage;
        
        const mpDrained = Math.min(player.mp, mpDrainAmount);
        if (mpDrained > 0) {
            player.loseMp(mpDrained);
            messages.push(`${player.name}のMPが${mpDrained}奪われた！`);
        }

        if (action.statusEffect) {
            const statusMessages = this.processStatusEffect(action, player);
            messages.push(...statusMessages);
        }
        
        return messages;
    }
    
    private executeFinishingMoveAction(action: BossAction, player: Player): string[] {
        const messages: string[] = [];
        
        // Custom finishing move logic
        if (action.statusEffect) {
            player.statusEffects.addEffect(action.statusEffect, action.statusDuration);
            const applyMessage = StatusEffectManager.generateApplyMessage(player, action.statusEffect);
            if (applyMessage) {
                messages.push(applyMessage);
            }
        }
        
        return messages;
    }
    
    private executePostDefeatedAttackAction(action: BossAction, player: Player): string[] {
        const messages: string[] = [];
        
        // Post-defeat actions (status effects only, no HP/MP changes)
        if (action.statusEffect) {
            player.statusEffects.addEffect(action.statusEffect, action.statusDuration);
            const applyMessage = StatusEffectManager.generateApplyMessage(player, action.statusEffect);
            if (applyMessage) {
                messages.push(applyMessage);
            }
        }
        
        return messages;
    }
    
    private executeSkipAction(_action: BossAction): string[] {
        // Skip action. No messages.
        return [];
    }
    
    private processHpAbsorption(action: BossAction, actualDamage: number): string[] {
        const messages: string[] = [];
        
        if (action.healRatio && action.healRatio > 0 && actualDamage > 0) {
            const healedAmount = this.healFromDamage(actualDamage, action.healRatio);
            if (healedAmount > 0) {
                messages.push(` ${this.displayName}は${healedAmount}HP回復した！`);
            }
        }
        
        return messages;
    }
    
    private processStatusEffect(action: BossAction, player: Player): string[] {
        const messages: string[] = [];
        
        if (!action.statusEffect) {
            return messages;
        }
        
        let statusChance = action.statusChance !== undefined ? action.statusChance : DEFAULT_STATUS_CHANCE;
        
        // Apply debuff chance modifier only if the status chance is not guaranteed (1.0)
        if (statusChance < 1.0) {
            const debuffModifier = player.statusEffects.getDebuffChanceModifier();
            statusChance = statusChance * debuffModifier;
            // Clamp the final chance to valid range [0.0, 1.0]
            statusChance = Math.max(0.0, Math.min(1.0, statusChance));
        }
        
        if (Math.random() < statusChance) {
            player.statusEffects.addEffect(action.statusEffect, action.statusDuration);
            const applyMessage = StatusEffectManager.generateApplyMessage(player, action.statusEffect);
            if (applyMessage) {
                messages.push(applyMessage);
            }
        } else if (!action.damageFormula) {
            // If it's a status-only attack and the status didn't apply
            // we still want to show a message
            messages.push(`${player.name}は${StatusEffectManager.getEffectName(action.statusEffect)}状態にならなかった。`);
        }
        
        return messages;
    }
    
    
    onRestraintBroken(): void {
        // Boss gets stunned for 3 turns when restraint is broken (including the turn it was broken)
        this.statusEffects.addEffect(StatusEffectType.Stunned, RESTRAINT_STUN_DURATION);
    }
    
    startTurn(): void {
        // Boss MP is unlimited, so we override to avoid MP recovery
        // Status effects are now managed by StatusEffectManager
        // Duration reduction happens in processRoundEnd()
    }
    
    // Process all status effects at round end
    processRoundEnd(): string[] {
        const messages: string[] = [];
        
        // Call parent processRoundEnd for status effect processing
        const parentMessages = super.processRoundEnd();
        parentMessages.forEach(message => {
            messages.push(`${this.displayName}の${message}`);
        });
        
        return messages;
    }
    
    
    
    
    getDialogue(situation: 'battle-start' | 'victory' | 'defeat'): string {
        // Default dialogue, can be overridden by specific boss implementations
        const dialogues: Record<string, string[]> = {
            'battle-start': ['戦闘開始だ！'],
            'victory': ['勝利した...'],
            'defeat': ['敗北した...']
        };
        
        const options = dialogues[situation] || dialogues['battle-start'];
        return options[Math.floor(Math.random() * options.length)];
    }
}
