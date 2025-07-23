import { StatusEffectManager, StatusEffectType } from '../systems/StatusEffect';
import { Player } from './Player';
import { calculateAttackResult } from '../utils/CombatUtils';
import { Actor } from './Actor';

// Message formatter utility
export function formatMessage(template: string, nameUser: string, nameTarget: string): string {
    return template
        .replace(/<USER>/g, nameUser)
        .replace(/<TARGET>/g, nameTarget)
}

// Message formatter utility
export function formatMessageSkill(template: string, boss: Boss, player: Player, action: BossAction): string {
    return template
        .replace(/<USER>/g, boss.displayName)
        .replace(/<TARGET>/g, player.name)
        .replace(/<ACTION>/g, action.name)
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
    messages?: string[]; // Optional messages with format specifiers: <USER>, <TARGET>, <ACTION>
    damage?: number;  // [Deprecated] Fixed damage value (use damageFormula instead)
    damageFormula?: (user: Boss) => number; // Function to calculate damage based on actor's stats
    statusEffect?: StatusEffectType;
    statusDuration?: number;
    weight: number; // Probability weight for AI selection
    canUse?: (boss: Boss, player: Player, turn: number) => boolean;
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
    id: string;
    name: string;
    displayName: string;
    description: string;
    questNote: string;
    maxHp: number;
    attackPower: number;
    actions: BossAction[];
    personality?: string[];
    aiStrategy?: (boss: Boss, player: Player, turn: number) => BossAction;
    getDialogue?: (situation: 'battle-start' | 'player-restrained' | 'player-eaten' | 'player-escapes' | 'low-hp' | 'victory') => string;
    finishingMove?: () => string[];
    suppressAutoFinishingMove?: boolean; // 自動とどめ攻撃を抑制し、AI戦略でカスタムとどめ攻撃を処理
    icon?: string;
    guestCharacterInfo?: {
        creator: string;
        source?: string;
    };
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

export class Boss extends Actor {
    public id: string;
    public name: string;
    public description: string;
    public questNote: string;
    public actions: BossAction[];
    public personality: string[];
    public aiStrategy?: (boss: Boss, player: Player, turn: number) => BossAction;
    public specialDialogues: Map<string, string> = new Map();
    public finishingMove?: () => string[];
    public suppressAutoFinishingMove: boolean;
    public icon: string;
    public guestCharacterInfo?: {
        creator: string;
        source?: string;
    };
    
    /**
     * 一度でも使用したスキル名
     * プレイヤーのエクスプローラー経験値計算で使用する
     */
    public usedSkillNames: string[] = [];
    
    /**
     * ボス固有のカスタム変数
     * AI戦略での状態管理、クールダウン管理、行動制御などに使用
     * ボスデータの初期値をコピーして初期化される
     */
    private customVariables: Record<string, any> = {};
    
    constructor(data: BossData) {
        // Boss has unlimited MP (無尽蔵) - set to a high value
        super(data.displayName, data.maxHp, data.attackPower, 999999);
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.questNote = data.questNote;
        this.actions = data.actions;
        this.personality = data.personality || [];
        this.aiStrategy = data.aiStrategy;
        this.finishingMove = data.finishingMove;
        this.suppressAutoFinishingMove = data.suppressAutoFinishingMove || false;
        this.icon = data.icon || '👹';
        this.guestCharacterInfo = data.guestCharacterInfo;
        this.customVariables = data.customVariables ? { ...data.customVariables } : {};
    }

    /**
     * Recalculate stats based on boss data
     */
    recalculateStats(): void {
        // Boss stats are fixed by BossData, no additional calculations needed
        // MP remains unlimited
        this.mp = this.maxMp;
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
        if (!this.usedSkillNames.includes(skillName)) {
            this.usedSkillNames.push(skillName);
        }
    }
    
    /**
     * 使用したスキル名一覧を取得
     */
    getUsedSkillNames(): string[] {
        return [...this.usedSkillNames];
    }
    
    /**
     * 使用したスキル名をリセット
     */
    resetUsedSkillNames(): void {
        this.usedSkillNames = [];
    }
    
    
    
    selectAction(player: Player, turn: number): BossAction | null {
        if (!this.canAct()) {
            return {
                id: 'stunned-skip',
                type: ActionType.Skip,
                name: '行動不能',
                description: '反動で動けない...',
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
        
        if (action.damage) {
            return action.damage; // Use fixed damage if provided [deprecated]
        }
        
        return undefined; // No damage defined
    }
    
    executeAction(action: BossAction, player: Player, turn: number = 0): string[] {
        const messages = [];
        
        // Record skill usage for Explorer experience calculation
        this.addUsedSkill(action.name);
        
        // Process custom messages if provided
        if (action.messages && action.messages.length > 0) {
            action.messages.forEach(messageTemplate => {
                const formattedMessage = formatMessageSkill(messageTemplate, this, player, action);
                messages.push(formattedMessage);
            });
        } else {
            // Default message if no custom messages provided
            messages.push(`${this.displayName}の${action.name}！`);
        }

        // Check for invincible status first
        if (player.statusEffects.hasEffect(StatusEffectType.Invincible)) {
            messages.push(`${player.name}は攻撃を華麗に回避した！`);
            return messages;
        }
        
        switch (action.type) {
            case ActionType.Attack:
                {
                    const baseDamage = this.calculateActionDamage(action) || this.attackPower;
                    const attackResult = calculateAttackResult(
                        baseDamage, 
                        player.isKnockedOut(), 
                        action.hitRate, 
                        action.criticalRate,
                        action.damageVarianceMin,
                        action.damageVarianceMax
                    );
                    
                    if (attackResult.message) {
                        messages.push(attackResult.message);
                    }
                    
                    if (attackResult.isMiss) {
                        messages.push(`しかし、攻撃は外れた！`);
                    } else {
                        const actualDamage = player.takeDamage(attackResult.damage);
                        if (attackResult.isCritical) {
                            messages.push(`痛恨の一撃！ ${player.name}に${actualDamage}のダメージ！`);
                        } else {
                            messages.push(`${player.name}に${actualDamage}のダメージ！`);
                        }
                        
                        // Check for HP absorption
                        if (action.healRatio && action.healRatio > 0 && actualDamage > 0) {
                            const healedAmount = this.healFromDamage(actualDamage, action.healRatio);
                            if (healedAmount > 0) {
                                messages.push(` ${this.displayName}は${healedAmount}HP回復した！`);
                            }
                        }
                    }
                }
                break;
                
            case ActionType.StatusAttack:
                // Check for invincible status first
                {
                    let isMiss = false;
                    const baseDamage = this.calculateActionDamage(action);
                    if (baseDamage && baseDamage > 0) {
                        const attackResult = calculateAttackResult(
                            baseDamage, 
                            player.isKnockedOut(), 
                            action.hitRate, 
                            action.criticalRate,
                            action.damageVarianceMin,
                            action.damageVarianceMax
                        );

                        if (attackResult.isMiss) {
                            isMiss = true;
                            messages.push(`しかし、攻撃は外れた！`);
                        } else {
                            const actualDamage = player.takeDamage(attackResult.damage);
                            if (attackResult.isCritical) {
                                messages.push(`痛恨の一撃！ ${player.name}に${actualDamage}のダメージ！`);
                            } else {
                                messages.push(`${player.name}に${actualDamage}のダメージ！`);
                            }

                            // Check for HP absorption
                            if (action.healRatio && action.healRatio > 0 && actualDamage > 0) {
                                const healedAmount = this.healFromDamage(actualDamage, action.healRatio);
                                if (healedAmount > 0) {
                                    messages.push(` ${this.displayName}は${healedAmount}HP回復した！`);
                                }
                            }
                        }
                    }
                    
                    if (!isMiss && action.statusEffect) {
                        const statusChance = action.statusChance !== undefined ? action.statusChance : 1.0;
                        if (Math.random() < statusChance) {
                            player.statusEffects.addEffect(action.statusEffect, action.statusDuration);
                            messages.push(`${player.name}が${this.getStatusEffectName(action.statusEffect)}状態になった！`);
                        }
                        else if (!action.damage)
                        {
                            // If it's a status-only attack and the status didn't apply
                            // we still want to show a message
                            messages.push(`${player.name}は${this.getStatusEffectName(action.statusEffect)}状態にならなかった。`);
                        }
                    }
                }
                break;
                
            case ActionType.RestraintAttack:
                player.statusEffects.addEffect(StatusEffectType.Restrained);
                player.struggleAttempts = 0; // Reset struggle attempts
                messages.push(`${player.name}が拘束された！`);
                break;
                
            case ActionType.CocoonAttack:
                // Transform restrained state to cocoon state
                if (player.isRestrained()) {
                    player.statusEffects.removeEffect(StatusEffectType.Restrained);
                }
                player.statusEffects.addEffect(StatusEffectType.Cocoon);
                player.struggleAttempts = 0; // Reset struggle attempts
                messages.push(`${player.name}が繭状態になった！`);
                break;
                
            case ActionType.CocoonAction:
                if (player.statusEffects.isCocoon()) {
                    const actionDamage = this.calculateActionDamage(action);
                    const maxHpReduction = actionDamage || Math.floor(player.maxHp * 0.1); // Default 10% max HP reduction
                    
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
                        const statusChance = action.statusChance !== undefined ? action.statusChance : 1.0;
                        if (Math.random() < statusChance) {
                            player.statusEffects.addEffect(action.statusEffect, action.statusDuration);
                            messages.push(`${player.name}が${this.getStatusEffectName(action.statusEffect)}状態になった！`);
                        }
                    }
                }
                break;
                
            case ActionType.EatAttack:
                if (player.isRestrained()) {
                    // Transform restrained state to eaten state
                    player.statusEffects.removeEffect(StatusEffectType.Restrained);
                }
                player.statusEffects.addEffect(StatusEffectType.Eaten);
                messages.push(`${player.name}が食べられてしまった！`);
                break;
                
            case ActionType.DevourAttack:
                {
                    // Apply variance to absorption amount
                    const baseAbsorption = this.calculateActionDamage(action) || Math.floor(player.maxHp * 0.1); // Default 10% max HP absorption
                    const statusAttackResult = calculateAttackResult(
                        baseAbsorption, 
                        player.isKnockedOut(), 
                        action.hitRate, 
                        action.criticalRate,
                        action.damageVarianceMin,
                        action.damageVarianceMax
                    );
                    const hpAbsorbed = statusAttackResult.damage;
                    
                    player.loseMaxHp(hpAbsorbed);
                    messages.push(`${player.name}の最大ヘルスが${hpAbsorbed}奪われた！`);
                    
                    // Boss gains the absorbed max HP
                    this.gainMaxHp(hpAbsorbed);
                    
                    // Absorb MP (also with variance)
                    const baseMpDrain = Math.floor(baseAbsorption / 2);
                    const statusMpDrainResult = calculateAttackResult(
                        baseMpDrain, 
                        player.isKnockedOut(), 
                        1.0, 
                        0.0,
                        action.damageVarianceMin,
                        action.damageVarianceMax
                    );
                    const mpDrainAmount = statusMpDrainResult.damage;
                    
                    const mpDrained = Math.min(player.mp, mpDrainAmount);
                    if (mpDrained > 0) {
                        player.loseMp(mpDrained);
                        messages.push(`${player.name}のMPが${mpDrained}奪われた！`);
                    }

                    if (action.statusEffect) {
                        const statusChance = action.statusChance !== undefined ? action.statusChance : 1.0;
                        if (Math.random() < statusChance) {
                            player.statusEffects.addEffect(action.statusEffect, action.statusDuration);
                            messages.push(`${player.name}が${this.getStatusEffectName(action.statusEffect)}状態になった！`);
                        }
                    }
                }
                break;

            case ActionType.FinishingMove:
                // Custom finishing move logic
                if (action.statusEffect) {
                    player.statusEffects.addEffect(action.statusEffect, action.statusDuration);
                    messages.push(`${player.name}が${this.getStatusEffectName(action.statusEffect)}状態になった！`);
                }
                break;
            
            case ActionType.PostDefeatedAttack:
                // Post-defeat actions (status effects only, no HP/MP changes)
                if (action.statusEffect) {
                    player.statusEffects.addEffect(action.statusEffect, action.statusDuration);
                    messages.push(`${player.name}が${this.getStatusEffectName(action.statusEffect)}状態になった！`);
                }
                break;
                
            case ActionType.Skip:
                // Skip action, just return a message
                messages.push(action.description || `${this.displayName}は行動できない...`);
                break;
        }
        
        // Execute custom onUse callback if provided
        if (action.onUse) {
            const customMessages = action.onUse(this, player, turn);
            if (customMessages && customMessages.length > 0) {
                // Format custom messages with actor names
                const formattedMessages = customMessages.map(msg => formatMessage(msg, this.displayName, player.name));
                messages.push(...formattedMessages);
            }
        }
        
        return messages;
    }
    
    private getStatusEffectName(type: StatusEffectType): string {
        return StatusEffectManager.getEffectName(type);
    }
    
    onRestraintBroken(): void {
        // Boss gets stunned for 3 turns when restraint is broken (including the turn it was broken)
        this.statusEffects.addEffect(StatusEffectType.Stunned);
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