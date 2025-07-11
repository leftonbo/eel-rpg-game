export enum StatusEffectType {
    Fire = 'fire',
    Charm = 'charm',
    Slow = 'slow',
    Poison = 'poison',
    Restrained = 'restrained',
    Eaten = 'eaten',
    Stunned = 'stunned',
    Invincible = 'invincible',
    Defending = 'defending',
    KnockedOut = 'knocked-out'
}

export interface StatusEffect {
    type: StatusEffectType;
    duration: number;
    name: string;
    description: string;
    stackable?: boolean;
}

export interface StatusEffectConfig {
    type: StatusEffectType;
    name: string;
    description: string;
    duration: number;
    onApply?: (target: any) => void;
    onTick?: (target: any, effect: StatusEffect) => void;
    onRemove?: (target: any) => void;
    stackable?: boolean;
}

export class StatusEffectManager {
    private effects: Map<StatusEffectType, StatusEffect> = new Map();
    
    // Status effect configurations
    private static configs: Map<StatusEffectType, StatusEffectConfig> = new Map<StatusEffectType, StatusEffectConfig>([
        [StatusEffectType.Fire, {
            type: StatusEffectType.Fire,
            name: '火だるま',
            description: '毎ターンHPが8減少',
            duration: 2,
            onTick: (target: any, _effect: StatusEffect) => {
                target.takeDamage(8);
            }
        }],
        [StatusEffectType.Charm, {
            type: StatusEffectType.Charm,
            name: '魅了',
            description: 'もがくの成功率が大幅低下',
            duration: 5
        }],
        [StatusEffectType.Slow, {
            type: StatusEffectType.Slow,
            name: '鈍足',
            description: '攻撃力が半減',
            duration: 2
        }],
        [StatusEffectType.Poison, {
            type: StatusEffectType.Poison,
            name: '毒',
            description: '毎ターンHPが3減少',
            duration: 3,
            onTick: (target: any, _effect: StatusEffect) => {
                target.takeDamage(3);
            }
        }],
        [StatusEffectType.Restrained, {
            type: StatusEffectType.Restrained,
            name: '拘束',
            description: '行動が制限される',
            duration: -1 // Duration managed by struggle system
        }],
        [StatusEffectType.Eaten, {
            type: StatusEffectType.Eaten,
            name: '食べられ',
            description: '最大HPが毎ターン減少',
            duration: -1 // Until escaped or game over
        }],
        [StatusEffectType.Stunned, {
            type: StatusEffectType.Stunned,
            name: '気絶',
            description: '行動できない',
            duration: 2
        }],
        [StatusEffectType.Invincible, {
            type: StatusEffectType.Invincible,
            name: '無敵',
            description: 'すべてのダメージを無効化',
            duration: 1
        }],
        [StatusEffectType.Defending, {
            type: StatusEffectType.Defending,
            name: '防御',
            description: '次のターンのダメージを半減',
            duration: 1
        }],
        [StatusEffectType.KnockedOut, {
            type: StatusEffectType.KnockedOut,
            name: '行動不能',
            description: '5ターンの間行動できない',
            duration: 5
        }]
    ]);
    
    addEffect(type: StatusEffectType): boolean {
        const config = StatusEffectManager.configs.get(type);
        if (!config) return false;
        
        const existingEffect = this.effects.get(type);
        
        if (existingEffect && !config.stackable) {
            // Refresh duration for non-stackable effects
            existingEffect.duration = config.duration;
            return false;
        }
        
        const newEffect: StatusEffect = {
            type: config.type,
            duration: config.duration,
            name: config.name,
            description: config.description,
            stackable: config.stackable
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
    
    tickEffects(target: any): void {
        const effectsToRemove: StatusEffectType[] = [];
        
        for (const [type, effect] of this.effects) {
            const config = StatusEffectManager.configs.get(type);
            
            // Apply tick effect
            if (config?.onTick) {
                config.onTick(target, effect);
            }
            
            // Decrease duration for time-based effects
            if (effect.duration > 0) {
                effect.duration--;
                if (effect.duration <= 0) {
                    effectsToRemove.push(type);
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
    }
    
    getAttackModifier(): number {
        let modifier = 1.0;
        
        if (this.hasEffect(StatusEffectType.Slow)) {
            modifier *= 0.5; // Half attack power
        }
        
        return modifier;
    }
    
    getDamageModifier(): number {
        let modifier = 1.0;
        
        if (this.hasEffect(StatusEffectType.Defending)) {
            modifier *= 0.5; // Half damage taken
        }
        
        if (this.hasEffect(StatusEffectType.Invincible)) {
            modifier = 0; // No damage taken
        }
        
        return modifier;
    }
    
    getStruggleModifier(): number {
        let modifier = 1.0;
        
        if (this.hasEffect(StatusEffectType.Charm)) {
            modifier *= 0.3; // Much lower success rate when charmed
        }
        
        return modifier;
    }
    
    canAct(): boolean {
        return !this.hasEffect(StatusEffectType.Stunned) && 
               !this.hasEffect(StatusEffectType.KnockedOut) &&
               !this.hasEffect(StatusEffectType.Restrained) &&
               !this.hasEffect(StatusEffectType.Eaten);
    }
    
    isRestrained(): boolean {
        return this.hasEffect(StatusEffectType.Restrained);
    }
    
    isEaten(): boolean {
        return this.hasEffect(StatusEffectType.Eaten);
    }
    
    isKnockedOut(): boolean {
        return this.hasEffect(StatusEffectType.KnockedOut);
    }
}