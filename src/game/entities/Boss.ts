import { StatusEffectManager, StatusEffectType } from '../systems/StatusEffect';
import { Player, PLAYER_NAME } from './Player';
import { calculateAttackResult } from '../utils/CombatUtils';

export enum ActionType {
    Attack = 'attack',
    StatusAttack = 'status-attack',
    RestraintAttack = 'restraint-attack',
    EatAttack = 'eat-attack',
    DevourAttack = 'devour-attack',
    Skip = 'skip'
}

export interface BossAction {
    type: ActionType;
    name: string;
    description: string;
    messageFirst?: string; // Optional message, will attach boss name before it
    messageSecond?: string; // Optional message
    damage?: number;
    statusEffect?: StatusEffectType;
    statusDuration?: number;
    weight: number; // Probability weight for AI selection
    canUse?: (boss: Boss, player: Player, turn: number) => boolean;
    hitRate?: number; // Attack hit rate (default: 95%)
    criticalRate?: number; // Critical hit rate (default: 5%)
    statusChance?: number; // Status effect application chance (default: 100%)
    playerStateCondition?: 'normal' | 'ko' | 'restrained' | 'eaten'; // Required player state
    healRatio?: number; // HP absorption ratio from damage dealt (0.0 = no healing, 1.0 = 100% healing)
    damageVarianceMin?: number; // Minimum damage variance percentage (default: -20)
    damageVarianceMax?: number; // Maximum damage variance percentage (default: +20)
}

export interface BossData {
    id: string;
    name: string;
    displayName: string;
    description: string;
    maxHp: number;
    attackPower: number;
    actions: BossAction[];
    personality?: string[];
    aiStrategy?: (boss: Boss, player: Player, turn: number) => BossAction;
    getDialogue?: (situation: 'battle-start' | 'player-restrained' | 'player-eaten' | 'player-escapes' | 'low-hp' | 'victory') => string;
    specialDialogues?: Map<string, string>;
}

export class Boss {
    public id: string;
    public name: string;
    public displayName: string;
    public description: string;
    public maxHp: number;
    public hp: number;
    public attackPower: number;
    public statusEffects: StatusEffectManager = new StatusEffectManager();
    public actions: BossAction[];
    public personality: string[];
    public aiStrategy?: (boss: Boss, player: Player, turn: number) => BossAction;
    public specialDialogues: Map<string, string> = new Map();
    public stunTurnsRemaining: number = 0; // For restraint break stun
    
    constructor(data: BossData) {
        this.id = data.id;
        this.name = data.name;
        this.displayName = data.displayName;
        this.description = data.description;
        this.maxHp = data.maxHp;
        this.hp = data.maxHp;
        this.attackPower = data.attackPower;
        this.actions = data.actions;
        this.personality = data.personality || [];
        this.aiStrategy = data.aiStrategy;
        this.specialDialogues = data.specialDialogues || new Map();
    }
    
    takeDamage(amount: number): number {
        if (amount <= 0) return 0;
        
        const actualDamage = Math.max(0, amount);
        this.hp = Math.max(0, this.hp - actualDamage);
        
        return actualDamage;
    }
    
    heal(amount: number): number {
        if (amount <= 0) return 0;
        
        const oldHp = this.hp;
        this.hp = Math.min(this.maxHp, this.hp + amount);
        
        return this.hp - oldHp;
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
     * Increase both max HP and current HP (for devour absorption)
     */
    gainMaxHp(amount: number): number {
        if (amount <= 0) return 0;
        
        const oldMaxHp = this.maxHp;
        this.maxHp += amount;
        this.hp += amount; // Increase current HP by the same amount
        
        return this.maxHp - oldMaxHp;
    }
    
    canAct(): boolean {
        return this.stunTurnsRemaining <= 0 && this.hp > 0;
    }
    
    selectAction(player: Player, turn: number): BossAction | null {
        if (!this.canAct()) {
            return {
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
    
    public getPlayerState(player: Player): 'normal' | 'ko' | 'restrained' | 'eaten' {
        if (player.isEaten()) return 'eaten';
        if (player.isRestrained()) return 'restrained';
        if (player.isKnockedOut()) return 'ko';
        return 'normal';
    }
    
    executeAction(action: BossAction, player: Player): string[] {
        let messages = [];
        
        // message for action
        let messageFirst = action.messageFirst
            ? `${this.displayName}${action.messageFirst.replace('<PLAYER_NAME>', PLAYER_NAME)}`
            : `${this.displayName}の${action.name}！`;
        messages.push(messageFirst);
        
        // message for action second part
        if (action.messageSecond) {
            const messageSecond = action.messageSecond.replace('<PLAYER_NAME>', PLAYER_NAME);
            messages.push(messageSecond);
        }

        // Check for invincible status first
        if (player.statusEffects.hasEffect(StatusEffectType.Invincible)) {
            messages.push(`${PLAYER_NAME}は攻撃を華麗に回避した！`);
            return messages;
        }
        
        switch (action.type) {
            case ActionType.Attack:
                {
                    const baseDamage = action.damage || this.attackPower;
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
                            messages.push(`痛恨の一撃！ ${PLAYER_NAME}に${actualDamage}のダメージ！`);
                        } else {
                            messages.push(`${PLAYER_NAME}に${actualDamage}のダメージ！`);
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
                    if (action.damage && action.damage > 0) {
                        const attackResult = calculateAttackResult(
                            action.damage, 
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
                                messages.push(`痛恨の一撃！ ${PLAYER_NAME}に${actualDamage}のダメージ！`);
                            } else {
                                messages.push(`${PLAYER_NAME}に${actualDamage}のダメージ！`);
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
                        const statusChance = action.statusChance !== undefined ? action.statusChance / 100 : 1.0;
                        if (Math.random() < statusChance) {
                            player.statusEffects.addEffect(action.statusEffect);
                            messages.push(`${PLAYER_NAME}が${this.getStatusEffectName(action.statusEffect)}状態になった！`);
                        }
                        else if (!action.damage)
                        {
                            // If it's a status-only attack and the status didn't apply
                            // we still want to show a message
                            messages.push(`${PLAYER_NAME}は${this.getStatusEffectName(action.statusEffect)}状態にならなかった。`);
                        }
                    }
                }
                break;
                
            case ActionType.RestraintAttack:
                player.statusEffects.addEffect(StatusEffectType.Restrained);
                player.struggleAttempts = 0; // Reset struggle attempts
                messages.push(`${PLAYER_NAME}が拘束された！`);
                break;
                
            case ActionType.EatAttack:
                if (player.isRestrained()) {
                    // Transform restrained state to eaten state
                    player.statusEffects.removeEffect(StatusEffectType.Restrained);
                }
                player.statusEffects.addEffect(StatusEffectType.Eaten);
                messages.push(`${PLAYER_NAME}が食べられてしまった！`);
                break;
                
            case ActionType.DevourAttack:
                if (player.statusEffects.isEaten()) {
                    // Apply variance to absorption amount
                    const baseAbsorption = action.damage || this.attackPower;
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
                    messages.push(`${this.displayName}は${PLAYER_NAME}の最大ヘルスを${hpAbsorbed}吸収した！`);
                    
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
                        messages.push(`${this.displayName}は${PLAYER_NAME}のMPを${mpDrained}吸収した！`);
                    }
                }
                break;
                
            case ActionType.Skip:
                // Skip action, just return a message
                messages.push(action.description || `${this.displayName}は行動できない...`);
                break;
        }
        
        return messages;
    }
    
    private getStatusEffectName(type: StatusEffectType): string {
        const names: Record<StatusEffectType, string> = {
            [StatusEffectType.Dead]: '再起不能',
            [StatusEffectType.Doomed]: '再起不能',
            [StatusEffectType.KnockedOut]: '行動不能',
            [StatusEffectType.Restrained]: '拘束',
            [StatusEffectType.Eaten]: '食べられ',
            [StatusEffectType.Defending]: '防御',
            [StatusEffectType.Stunned]: '気絶',
            [StatusEffectType.Fire]: '火だるま',
            [StatusEffectType.Charm]: '魅了',
            [StatusEffectType.Slow]: '鈍足',
            [StatusEffectType.Poison]: '毒',
            [StatusEffectType.Invincible]: '無敵',
            [StatusEffectType.Exhausted]: '疲れ果て',
            [StatusEffectType.Energized]: '元気満々'
        };
        
        return names[type] || '未知の状態';
    }
    
    onRestraintBroken(): void {
        // Boss gets stunned for 3 turns when restraint is broken (including the turn it was broken)
        this.stunTurnsRemaining = 3;
    }
    
    startTurn(): void {
        // Reduce stun duration
        if (this.stunTurnsRemaining > 0) {
            this.stunTurnsRemaining--;
        }
    }
    
    // Process all status effects at round end
    processRoundEnd(): string[] {
        const messages: string[] = [];
        
        // Apply status effect damages/effects
        const effectMessages = this.statusEffects.applyEffects(this);
        effectMessages.forEach(message => {
            messages.push(`${this.displayName}の${message}`);
        });
        
        // Decrease durations and remove expired effects
        const durationMessages = this.statusEffects.decreaseDurations(this);
        durationMessages.forEach(message => {
            messages.push(`${this.displayName}の${message}`);
        });
        
        return messages;
    }
    
    getHpPercentage(): number {
        return this.maxHp > 0 ? (this.hp / this.maxHp) * 100 : 0;
    }
    
    isDead(): boolean {
        return this.hp <= 0;
    }
    
    isStunned(): boolean {
        return this.stunTurnsRemaining > 0;
    }
    
    getDialogue(situation: 'battle-start' | 'player-restrained' | 'player-eaten' | 'player-escapes' | 'low-hp' | 'victory'): string {
        // Default dialogue, can be overridden by specific boss implementations
        const dialogues: Record<string, string[]> = {
            'battle-start': ['戦闘開始だ！'],
            'player-restrained': ['捕まえた！'],
            'player-eaten': ['美味しそうだ...'],
            'player-escapes': ['逃げられた！'],
            'low-hp': ['まだ諦めない！'],
            'victory': ['勝利した...'  ]
        };
        
        const options = dialogues[situation] || dialogues['battle-start'];
        return options[Math.floor(Math.random() * options.length)];
    }
    
    getSpecialDialogue(actionName: string): string | null {
        return this.specialDialogues.get(actionName) || null;
    }
}