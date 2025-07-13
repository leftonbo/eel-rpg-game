export enum StatusEffectType {
    Dead = 'dead',
    Doomed = 'doomed',
    KnockedOut = 'knocked-out',
    Exhausted = 'exhausted',
    Restrained = 'restrained',
    Eaten = 'eaten',
    Defending = 'defending',
    Stunned = 'stunned',
    Fire = 'fire',
    Charm = 'charm',
    Slow = 'slow',
    Poison = 'poison',
    Invincible = 'invincible',
    Energized = 'energized',
    Slimed = 'slimed',
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
        [StatusEffectType.Dead, {
            type: StatusEffectType.Dead,
            name: '再起不能',
            description: 'これ以上抵抗できない',
            duration: -1 // Considered received finishing move
        }],
        [StatusEffectType.Doomed, {
            type: StatusEffectType.Doomed,
            name: '再起不能',
            description: 'これ以上抵抗できない',
            duration: -1 // Permanent until finishing move
        }],
        [StatusEffectType.KnockedOut, {
            type: StatusEffectType.KnockedOut,
            name: '行動不能',
            description: '5ターンの間行動できない',
            duration: 5
        }],
        [StatusEffectType.Exhausted, {
            type: StatusEffectType.Exhausted,
            name: '疲れ果て',
            description: 'スキル使用不可、攻撃力半減、受けるダメージ1.5倍',
            duration: 4
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
            description: '最大HPが毎ターン減少、MP回復阻止',
            duration: -1, // Until escaped or game over
        }],
        [StatusEffectType.Defending, {
            type: StatusEffectType.Defending,
            name: '防御',
            description: '次のターンのダメージを半減',
            duration: 1
        }],
        [StatusEffectType.Stunned, {
            type: StatusEffectType.Stunned,
            name: '気絶',
            description: '行動できない',
            duration: 2
        }],
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
        [StatusEffectType.Invincible, {
            type: StatusEffectType.Invincible,
            name: '無敵',
            description: 'すべての攻撃を回避する',
            duration: 3
        }],
        [StatusEffectType.Energized, {
            type: StatusEffectType.Energized,
            name: '元気満々',
            description: 'MPが常に満タン',
            duration: 3,
            onTick: (target: any, _effect: StatusEffect) => {
                target.mp = target.maxMp;
            }
        }],
        [StatusEffectType.Slimed, {
            type: StatusEffectType.Slimed,
            name: '粘液まみれ',
            description: '拘束解除の成功率が半減',
            duration: 3
        }]
    ]);
    
    static getEffectName(type: StatusEffectType): string {
        const config = StatusEffectManager.configs.get(type);
        return config ? config.name : '不明な状態異常';
    }
    
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
    
    // Apply status effect damages/effects at turn start
    applyEffects(target: any): string[] {
        const messages: string[] = [];
        
        for (const [type, effect] of this.effects) {
            const config = StatusEffectManager.configs.get(type);
            
            // Apply tick effect
            if (config?.onTick) {
                const oldHp = target.hp;
                config.onTick(target, effect);
                const damage = oldHp - target.hp;
                
                if (damage > 0) {
                    messages.push(`${effect.name}によって${damage}のダメージ！`);
                }
            }
        }
        
        return messages;
    }
    
    // Decrease durations and remove expired effects at turn end
    decreaseDurations(target: any): string[] {
        const messages: string[] = [];
        const effectsToRemove: StatusEffectType[] = [];
        
        for (const [type, effect] of this.effects) {
            // Decrease duration for time-based effects
            if (effect.duration > 0) {
                effect.duration--;
                if (effect.duration <= 0) {
                    effectsToRemove.push(type);
                    messages.push(`${effect.name}が解除された`);
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
    tickEffects(target: any): void {
        this.applyEffects(target);
        this.decreaseDurations(target);
    }
    
    getAttackModifier(): number {
        let modifier = 1.0;
        
        if (this.hasEffect(StatusEffectType.Slow)) {
            modifier *= 0.5; // Half attack power
        }
        
        if (this.hasEffect(StatusEffectType.Exhausted)) {
            modifier *= 0.5; // Half attack power when exhausted
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
        
        if (this.hasEffect(StatusEffectType.Exhausted)) {
            modifier *= 1.5; // 1.5x damage taken when exhausted
        }
        
        return modifier;
    }
    
    getStruggleModifier(): number {
        let modifier = 1.0;
        
        if (this.hasEffect(StatusEffectType.Charm)) {
            modifier *= 0.3; // Much lower success rate when charmed
        }
        
        if (this.hasEffect(StatusEffectType.Slimed)) {
            modifier *= 0.5; // Half success rate when slimed
        }
        
        return modifier;
    }
    
    canAct(): boolean {
        return !this.hasEffect(StatusEffectType.Dead) &&
               !this.hasEffect(StatusEffectType.Doomed) &&
               !this.hasEffect(StatusEffectType.KnockedOut) &&
               !this.hasEffect(StatusEffectType.Restrained) &&
               !this.hasEffect(StatusEffectType.Eaten) &&
               !this.hasEffect(StatusEffectType.Stunned);
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
    
    isEnergized(): boolean {
        return this.hasEffect(StatusEffectType.Energized);
    }
    
    isSlimed(): boolean {
        return this.hasEffect(StatusEffectType.Slimed);
    }
}