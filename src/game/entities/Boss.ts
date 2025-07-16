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
        .replace(/<SKILL>/g, action.name)
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
    Skip = 'skip'
}

export interface BossAction {
    type: ActionType;
    name: string;
    description: string;
    messages?: string[]; // Optional messages with format specifiers: <USER>, <TARGET>, <SKILL>
    damage?: number;
    statusEffect?: StatusEffectType;
    statusDuration?: number;
    weight: number; // Probability weight for AI selection
    canUse?: (boss: Boss, player: Player, turn: number) => boolean;
    hitRate?: number; // Attack hit rate (default: 95%)
    criticalRate?: number; // Critical hit rate (default: 5%)
    statusChance?: number; // Status effect application chance (default: 100%)
    playerStateCondition?: 'normal' | 'ko' | 'restrained' | 'cocoon' | 'eaten' | 'defeated'; // Required player state
    healRatio?: number; // HP absorption ratio from damage dealt (0.0 = no healing, 1.0 = 100% healing)
    damageVarianceMin?: number; // Minimum damage variance percentage (default: -20)
    damageVarianceMax?: number; // Maximum damage variance percentage (default: +20)
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
    
    public getPlayerState(player: Player): 'normal' | 'ko' | 'restrained' | 'cocoon' | 'eaten' | 'defeated' {
        if (player.isDefeated()) return 'defeated';
        if (player.isEaten()) return 'eaten';
        if (player.statusEffects.isCocoon()) return 'cocoon';
        if (player.isRestrained()) return 'restrained';
        if (player.isKnockedOut()) return 'ko';
        return 'normal';
    }
    
    executeAction(action: BossAction, player: Player): string[] {
        const messages = [];
        
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
                        const statusChance = action.statusChance !== undefined ? action.statusChance / 100 : 1.0;
                        if (Math.random() < statusChance) {
                            player.statusEffects.addEffect(action.statusEffect);
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
                    const baseDamage = action.damage || 0;
                    const maxHpReduction = action.damage || Math.floor(player.maxHp * 0.1); // Default 10% max HP reduction
                    
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
                    if (baseDamage > 0) {
                        const actualDamage = player.takeDamage(baseDamage);
                        messages.push(`${player.name}に${actualDamage}のダメージ！`);
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
                        const statusChance = action.statusChance !== undefined ? action.statusChance / 100 : 1.0;
                        if (Math.random() < statusChance) {
                            player.statusEffects.addEffect(action.statusEffect);
                            messages.push(`${player.name}が${this.getStatusEffectName(action.statusEffect)}状態になった！`);
                        }
                    }
                }
                break;
                
            case ActionType.PostDefeatedAttack:
                // Post-defeat actions (status effects only, no HP/MP changes)
                if (action.statusEffect) {
                    player.statusEffects.addEffect(action.statusEffect);
                    messages.push(`${player.name}が${this.getStatusEffectName(action.statusEffect)}状態になった！`);
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