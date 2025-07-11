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
    damage?: number;
    statusEffect?: StatusEffectType;
    statusDuration?: number;
    weight: number; // Probability weight for AI selection
    canUse?: (boss: Boss, player: Player, turn: number) => boolean;
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
    
    executeAction(action: BossAction, player: Player): string {
        let message = `${this.displayName}の${action.name}！`;
        
        switch (action.type) {
            case ActionType.Attack:
                const baseDamage = action.damage || this.attackPower;
                const attackResult = calculateAttackResult(baseDamage, player.isKnockedOut());
                
                if (attackResult.isMiss) {
                    message += ` ${attackResult.message} 攻撃は外れた！`;
                } else {
                    const actualDamage = player.takeDamage(attackResult.damage);
                    if (attackResult.isCritical) {
                        message += ` ${attackResult.message} ${PLAYER_NAME}に${actualDamage}のダメージ！`;
                    } else {
                        message += ` ${PLAYER_NAME}に${actualDamage}のダメージ！`;
                    }
                }
                break;
                
            case ActionType.StatusAttack:
                if (action.statusEffect) {
                    player.statusEffects.addEffect(action.statusEffect);
                    message += ` ${PLAYER_NAME}が${this.getStatusEffectName(action.statusEffect)}状態になった！`;
                }
                
                if (action.damage && action.damage > 0) {
                    const statusAttackResult = calculateAttackResult(action.damage, player.isKnockedOut());
                    if (statusAttackResult.isMiss) {
                        message += ` ${statusAttackResult.message}`;
                    } else {
                        const statusDamage = player.takeDamage(statusAttackResult.damage);
                        if (statusAttackResult.isCritical) {
                            message += ` ${statusAttackResult.message} ${statusDamage}のダメージ！`;
                        } else {
                            message += ` ${statusDamage}のダメージ！`;
                        }
                    }
                }
                break;
                
            case ActionType.RestraintAttack:
                player.statusEffects.addEffect(StatusEffectType.Restrained);
                player.struggleAttempts = 0; // Reset struggle attempts
                message += ` ${PLAYER_NAME}が拘束された！`;
                break;
                
            case ActionType.EatAttack:
                if (player.isRestrained()) {
                    // Transform restrained state to eaten state
                    player.statusEffects.removeEffect(StatusEffectType.Restrained);
                    player.statusEffects.addEffect(StatusEffectType.Eaten);
                    message += ` ${PLAYER_NAME}が食べられてしまった！`;
                } else {
                    // Direct eating for knocked out player
                    player.statusEffects.addEffect(StatusEffectType.Eaten);
                    message += ` ${PLAYER_NAME}が食べられてしまった！`;
                }
                break;
                
            case ActionType.DevourAttack:
                if (player.statusEffects.isEaten()) {
                    // Absorb max HP based on boss attack power
                    player.loseMaxHp(this.attackPower);
                    message += ` ${PLAYER_NAME}の最大ヘルスが${this.attackPower}減少した！（残り最大ヘルス: ${player.maxHp}）`;
                    
                    if (player.maxHp <= 0) {
                        message += ` ${PLAYER_NAME}は完全に消化されてしまった...`;
                    }
                } else {
                    message += ` しかし、${PLAYER_NAME}を捕まえていない！`;
                }
                break;
                
            case ActionType.Skip:
                message = action.description || `${this.displayName}は動けない...`;
                break;
        }
        
        return message;
    }
    
    private getStatusEffectName(type: StatusEffectType): string {
        const names: Record<StatusEffectType, string> = {
            [StatusEffectType.Fire]: '火だるま',
            [StatusEffectType.Charm]: '魅了',
            [StatusEffectType.Slow]: '鈍足',
            [StatusEffectType.Poison]: '毒',
            [StatusEffectType.Restrained]: '拘束',
            [StatusEffectType.Eaten]: '食べられ',
            [StatusEffectType.Stunned]: '気絶',
            [StatusEffectType.Invincible]: '無敵',
            [StatusEffectType.Defending]: '防御',
            [StatusEffectType.KnockedOut]: '行動不能'
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
}