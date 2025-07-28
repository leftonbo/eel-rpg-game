export { StatusEffectType, ActionPriority } from './StatusEffectTypes';
export type { StatusEffect, StatusEffectConfig } from './StatusEffectTypes';

import { Actor } from '../entities/Actor';
import { Player } from '../entities/Player';
import { createStatusEffectConfigs } from './status-effects';
import { StatusEffectType, StatusEffect, StatusEffectConfig, ActionPriority } from './StatusEffectTypes';

export class StatusEffectManager {
    private effects: Map<StatusEffectType, StatusEffect> = new Map();
    
    // Status effect configurations
    private static configs: Map<StatusEffectType, StatusEffectConfig> = createStatusEffectConfigs();
    
    static getEffectName(type: StatusEffectType): string {
        const config = StatusEffectManager.configs.get(type);
        return config ? config.name : '不明な状態異常';
    }

    /**
     * Adds a status effect to the actor.
     * If the effect already exists and is not stackable, it refreshes the duration.
     * @param type The type of status effect to add.
     * @param durationOverride [optional] Custom duration for the effect. If not provided, uses the default duration from the config.
     * @param potencyOverride [optional] Custom potency for the effect. If not provided, uses the default potency from the config.
     * @returns {boolean} True if the effect was added, false if it was refreshed (not stackable) or invalid.
     */
    addEffect(type: StatusEffectType, durationOverride?: number, potencyOverride?: number): boolean {
        const config = StatusEffectManager.configs.get(type);
        if (!config) return false;
        
        const existingEffect = this.effects.get(type);
        const duration = durationOverride ? durationOverride : config.duration;
        const potency = potencyOverride !== undefined ? potencyOverride : config.potency;
        
        if (existingEffect && !config.stackable) {
            // Refresh duration for non-stackable effects
            existingEffect.duration = duration;
            if (potency !== undefined) {
                existingEffect.potency = potency;
            }
            return false;
        }
        
        const newEffect: StatusEffect = {
            type: config.type,
            duration: duration,
            name: config.name,
            description: config.description,
            stackable: config.stackable,
            potency: potency
        };
        
        this.effects.set(type, newEffect);
        return true;
    }
    
    removeEffect(type: StatusEffectType): boolean {
        return this.effects.delete(type);
    }
    
    hasEffect(type: StatusEffectType): boolean {
        return this.effects.has(type);
    }
    
    getEffect(type: StatusEffectType): StatusEffect | undefined {
        return this.effects.get(type);
    }
    
    getAllEffects(): StatusEffect[] {
        return Array.from(this.effects.values());
    }
    
    clearAllEffects(): void {
        this.effects.clear();
    }
    
    // Apply status effect damages/effects at turn start
    applyEffects(target: Actor): string[] {
        const messages: string[] = [];
        
        for (const [type, effect] of this.effects) {
            const config = StatusEffectManager.configs.get(type);
            
            // Apply tick effect
            if (config?.onTick) {
                const oldHp = target.hp;
                config.onTick(target, effect);
                const damage = oldHp - target.hp;
                
                if (damage > 0) {
                    const message = this.generateTickMessage(target, effect, damage, config);
                    if (message) {
                        messages.push(message);
                    }
                }
            }
        }
        
        return messages;
    }
    
    // Decrease durations and remove expired effects at turn end
    decreaseDurations(target: Actor): string[] {
        const messages: string[] = [];
        const effectsToRemove: StatusEffectType[] = [];
        
        for (const [type, effect] of this.effects) {
            // Decrease duration for time-based effects
            if (effect.duration > 0) {
                effect.duration--;
                if (effect.duration <= 0) {
                    effectsToRemove.push(type);
                    const config = StatusEffectManager.configs.get(type);
                    if (config) {
                        const message = this.generateRemoveMessage(target, effect, config);
                        if (message) {
                            messages.push(message);
                        }
                    }
                }
            }
        }
        
        // Remove expired effects
        effectsToRemove.forEach(type => {
            const config = StatusEffectManager.configs.get(type);
            if (config?.onRemove) {
                config.onRemove(target);
            }
            this.removeEffect(type);
        });
        
        return messages;
    }
    
    // Legacy method for backward compatibility
    tickEffects(target: Actor): void {
        this.applyEffects(target);
        this.decreaseDurations(target);
    }
    
    getAttackModifier(): number {
        let modifier = 1.0;
        
        for (const [type, _effect] of this.effects) {
            const config = StatusEffectManager.configs.get(type);
            if (config?.modifiers?.attackPower !== undefined) {
                modifier *= config.modifiers.attackPower;
            }
        }
        
        return modifier;
    }
    
    getDamageModifier(): number {
        let modifier = 1.0;
        
        for (const [type, _effect] of this.effects) {
            const config = StatusEffectManager.configs.get(type);
            if (config?.modifiers?.damageReceived !== undefined) {
                modifier *= config.modifiers.damageReceived;
            }
        }
        
        return modifier;
    }
    
    getStruggleModifier(): number {
        let modifier = 1.0;
        
        for (const [type, _effect] of this.effects) {
            const config = StatusEffectManager.configs.get(type);
            if (config?.modifiers?.struggleRate !== undefined) {
                modifier *= config.modifiers.struggleRate;
            }
        }
        
        return modifier;
    }
    
    getAccuracyModifier(): number {
        let modifier = 1.0;
        
        for (const [type, _effect] of this.effects) {
            const config = StatusEffectManager.configs.get(type);
            if (config?.modifiers?.accuracy !== undefined) {
                modifier *= config.modifiers.accuracy;
            }
        }
        
        return modifier;
    }
    
    getHpRegenerateModifier(): number {
        let modifier = 1.0;
        
        for (const [type, _effect] of this.effects) {
            const config = StatusEffectManager.configs.get(type);
            if (config?.modifiers?.hpRegenerateRate !== undefined) {
                modifier *= config.modifiers.hpRegenerateRate;
            }
        }
        
        return modifier;
    }
    
    getMpRegenerateModifier(): number {
        let modifier = 1.0;
        
        for (const [type, _effect] of this.effects) {
            const config = StatusEffectManager.configs.get(type);
            if (config?.modifiers?.mpRegenerateRate !== undefined) {
                modifier *= config.modifiers.mpRegenerateRate;
            }
        }
        
        return modifier;
    }
    
    canAct(): boolean {
        for (const [type, _effect] of this.effects) {
            const config = StatusEffectManager.configs.get(type);
            if (config?.modifiers?.canAct === false) {
                return false;
            }
        }
        return true;
    }

    isDead(): boolean {
        return this.hasEffect(StatusEffectType.Dead);
    }

    isDoomed(): boolean {
        return this.hasEffect(StatusEffectType.Doomed);
    }

    isKnockedOut(): boolean {
        return this.hasEffect(StatusEffectType.KnockedOut);
    }

    isExhausted(): boolean {
        return this.hasEffect(StatusEffectType.Exhausted);
    }
    
    isRestrained(): boolean {
        return this.hasEffect(StatusEffectType.Restrained);
    }
    
    isEaten(): boolean {
        return this.hasEffect(StatusEffectType.Eaten);
    }
    
    isCocoon(): boolean {
        return this.hasEffect(StatusEffectType.Cocoon);
    }
    
    isSleeping(): boolean {
        return this.hasEffect(StatusEffectType.Sleep);
    }
    
    // Helper method to calculate debuff level for Dream Demon's sleep trigger
    getDebuffLevel(): number {
        let level = 0;
        const effects = this.getAllEffects();
        
        for (const effect of effects) {
            const config = StatusEffectManager.configs.get(effect.type);
            if (config?.isDebuff) {
                level += 1;
            }
        }
        
        return level;
    }
    
    // New methods for debuff management
    getDebuffEffects(): StatusEffect[] {
        return this.getAllEffects().filter(effect => {
            const config = StatusEffectManager.configs.get(effect.type);
            return config?.isDebuff === true;
        });
    }
    
    removeDebuffs(): StatusEffectType[] {
        const removedTypes: StatusEffectType[] = [];
        const debuffEffects = this.getDebuffEffects();
        
        for (const effect of debuffEffects) {
            if (this.removeEffect(effect.type)) {
                removedTypes.push(effect.type);
            }
        }
        
        return removedTypes;
    }
    
    removeSpecificDebuffs(debuffTypes: StatusEffectType[]): StatusEffectType[] {
        const removedTypes: StatusEffectType[] = [];
        
        for (const type of debuffTypes) {
            if (this.hasEffect(type) && this.removeEffect(type)) {
                removedTypes.push(type);
            }
        }
        
        return removedTypes;
    }
    
    canUseSkills(): boolean {
        for (const [type, _effect] of this.effects) {
            const config = StatusEffectManager.configs.get(type);
            if (config?.modifiers?.canUseSkills === false) {
                return false;
            }
        }
        return true;
    }
    
    getActionPriority(): ActionPriority {
        let highestPriority = ActionPriority.NormalAction;
        
        for (const [type, _effect] of this.effects) {
            const config = StatusEffectManager.configs.get(type);
            const priority = config?.modifiers?.actionPriority;
            
            if (priority === ActionPriority.CannotAct) {
                return ActionPriority.CannotAct;
            } else if (priority === ActionPriority.StruggleAction && highestPriority === ActionPriority.NormalAction) {
                highestPriority = ActionPriority.StruggleAction;
            }
        }
        
        return highestPriority;
    }
    
    // Helper method for Actor type detection
    private static isPlayerActor(target: Actor): boolean {
        // Check if the target is an instance of Player
        return target instanceof Player;
    }
    
    // Message generation helper methods
    private generateTickMessage(target: Actor, effect: StatusEffect, damage: number, config: StatusEffectConfig): string | null {
        const isPlayer = StatusEffectManager.isPlayerActor(target);
        const messages = config.messages;
        
        if (messages) {
            const template = isPlayer ? messages.onTickPlayer : messages.onTickBoss;
            if (template === "") return null; // Empty string means hide message
            if (template) {
                return this.formatMessageTemplate(template, target, damage);
            }
        }
        
        // Default message if no custom template
        return `${effect.name}によって${damage}のダメージ！`;
    }
    
    private generateRemoveMessage(target: Actor, effect: StatusEffect, config: StatusEffectConfig): string | null {
        const isPlayer = StatusEffectManager.isPlayerActor(target);
        const messages = config?.messages;
        
        if (messages) {
            const template = isPlayer ? messages.onRemovePlayer : messages.onRemoveBoss;
            if (template === "") return null; // Empty string means hide message
            if (template) {
                return this.formatMessageTemplate(template, target);
            }
        }
        
        // Default message if no custom template
        return `${effect.name}が解除された`;
    }
    
    private formatMessageTemplate(template: string, target: Actor, damage?: number): string {
        return template.replace(/{(\w+)}/g, (_match, variable) => {
            switch (variable) {
                case 'name':
                    return target.displayName;
                case 'damage':
                    return damage?.toString() || '0';
                default:
                    console.warn(`Unknown template variable: {${variable}}`);
                    return `{${variable}}`; // Keep original if unknown
            }
        });
    }
}