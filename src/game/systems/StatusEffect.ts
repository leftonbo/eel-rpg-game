export enum StatusEffectType {
    Dead = 'dead',
    Doomed = 'doomed',
    KnockedOut = 'knocked-out',
    Exhausted = 'exhausted',
    Restrained = 'restrained',
    Cocoon = 'cocoon',
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
    // New status effects for Dream Demon
    Paralysis = 'paralysis',
    AphrodisiacPoison = 'aphrodisiac-poison',
    Drowsiness = 'drowsiness',
    Weakness = 'weakness',
    Infatuation = 'infatuation',
    Confusion = 'confusion',
    Arousal = 'arousal',
    Seduction = 'seduction',
    MagicSeal = 'magic-seal',
    PleasureFall = 'pleasure-fall',
    Lewdness = 'lewdness',
    Hypnosis = 'hypnosis',
    Brainwash = 'brainwash',
    Sweet = 'sweet',
    Sleep = 'sleep',
    DreamControl = 'dream-control',
    // Additional sweet/charming debuffs
    Melting = 'melting',
    Euphoria = 'euphoria',
    Fascination = 'fascination',
    Bliss = 'bliss',
    Enchantment = 'enchantment'
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
    
    // New properties for better organization
    category: 'buff' | 'debuff' | 'neutral';
    isDebuff: boolean;
    modifiers?: {
        attackPower?: number; // Multiplier for attack power (default: 1.0)
        damageReceived?: number; // Multiplier for damage received (default: 1.0)
        struggleRate?: number; // Multiplier for struggle success rate (default: 1.0)
        canAct?: boolean; // Whether the entity can act (default: true)
        canUseSkills?: boolean; // Whether skills can be used (default: true)
    };
}

export class StatusEffectManager {
    private effects: Map<StatusEffectType, StatusEffect> = new Map();
    
    // Status effect configurations
    private static configs: Map<StatusEffectType, StatusEffectConfig> = new Map<StatusEffectType, StatusEffectConfig>([
        [StatusEffectType.Dead, {
            type: StatusEffectType.Dead,
            name: '再起不能',
            description: 'これ以上抵抗できない',
            duration: -1, // Considered received finishing move
            category: 'neutral',
            isDebuff: false,
            modifiers: {
                canAct: false
            }
        }],
        [StatusEffectType.Doomed, {
            type: StatusEffectType.Doomed,
            name: '再起不能',
            description: 'これ以上抵抗できない',
            duration: -1, // Permanent until finishing move
            category: 'neutral',
            isDebuff: false,
            modifiers: {
                canAct: false
            }
        }],
        [StatusEffectType.KnockedOut, {
            type: StatusEffectType.KnockedOut,
            name: '行動不能',
            description: '5ターンの間行動できない',
            duration: 5,
            category: 'debuff',
            isDebuff: true,
            modifiers: {
                canAct: false
            }
        }],
        [StatusEffectType.Exhausted, {
            type: StatusEffectType.Exhausted,
            name: '疲れ果て',
            description: 'スキル使用不可、攻撃力半減、受けるダメージ1.5倍',
            duration: 4,
            category: 'debuff',
            isDebuff: true,
            modifiers: {
                attackPower: 0.5,
                damageReceived: 1.5,
                canUseSkills: false
            }
        }],
        [StatusEffectType.Restrained, {
            type: StatusEffectType.Restrained,
            name: '拘束',
            description: '行動が制限される',
            duration: -1, // Duration managed by struggle system
            category: 'debuff',
            isDebuff: true,
            modifiers: {
                canAct: false
            }
        }],
        [StatusEffectType.Cocoon, {
            type: StatusEffectType.Cocoon,
            name: '繭状態',
            description: '合成糸で包まれ縮小液によって体が縮小されている',
            duration: -1, // Duration managed by struggle system like restraint
            category: 'debuff',
            isDebuff: true,
            modifiers: {
                canAct: false
            },
            onTick: (target: any, _effect: StatusEffect) => {
                // Reduce max HP each turn to represent shrinking
                const maxHpReduction = Math.floor(target.maxHp * 0.05); // 5% per turn
                if (maxHpReduction > 0) {
                    target.loseMaxHp(maxHpReduction);
                }
            }
        }],
        [StatusEffectType.Eaten, {
            type: StatusEffectType.Eaten,
            name: '食べられ',
            description: '最大HPが毎ターン減少、MP回復阻止',
            duration: -1, // Until escaped or game over
            category: 'debuff',
            isDebuff: true,
            modifiers: {
                canAct: false
            }
        }],
        [StatusEffectType.Defending, {
            type: StatusEffectType.Defending,
            name: '防御',
            description: '次のターンのダメージを半減',
            duration: 1,
            category: 'buff',
            isDebuff: false,
            modifiers: {
                damageReceived: 0.5
            }
        }],
        [StatusEffectType.Stunned, {
            type: StatusEffectType.Stunned,
            name: '気絶',
            description: '行動できない',
            duration: 3,
            category: 'debuff',
            isDebuff: true,
            modifiers: {
                canAct: false
            }
        }],
        [StatusEffectType.Fire, {
            type: StatusEffectType.Fire,
            name: '火だるま',
            description: '毎ターンHPが8減少',
            duration: 2,
            category: 'debuff',
            isDebuff: true,
            onTick: (target: any, _effect: StatusEffect) => {
                target.takeDamage(8);
            }
        }],
        [StatusEffectType.Charm, {
            type: StatusEffectType.Charm,
            name: '魅了',
            description: 'もがくの成功率が大幅低下、MP減少',
            duration: 20,
            category: 'debuff',
            isDebuff: true,
            modifiers: {
                struggleRate: 0.3
            },
            onTick: (target: any, _effect: StatusEffect) => {
                const mpLoss = Math.min(target.mp, 1);
                if (mpLoss > 0) {
                    target.loseMp(mpLoss);
                }
            }
        }],
        [StatusEffectType.Slow, {
            type: StatusEffectType.Slow,
            name: '鈍足',
            description: '攻撃力が半減',
            duration: 2,
            category: 'debuff',
            isDebuff: true,
            modifiers: {
                attackPower: 0.5
            }
        }],
        [StatusEffectType.Poison, {
            type: StatusEffectType.Poison,
            name: '毒',
            description: '毎ターンHPが3減少',
            duration: 3,
            category: 'debuff',
            isDebuff: true,
            onTick: (target: any, _effect: StatusEffect) => {
                target.takeDamage(3);
            }
        }],
        [StatusEffectType.Invincible, {
            type: StatusEffectType.Invincible,
            name: '無敵',
            description: 'すべての攻撃を回避する',
            duration: 3,
            category: 'buff',
            isDebuff: false,
            modifiers: {
                damageReceived: 0
            }
        }],
        [StatusEffectType.Energized, {
            type: StatusEffectType.Energized,
            name: '元気満々',
            description: 'MPが常に満タン',
            duration: 3,
            category: 'buff',
            isDebuff: false,
            onTick: (target: any, _effect: StatusEffect) => {
                target.mp = target.maxMp;
            }
        }],
        [StatusEffectType.Slimed, {
            type: StatusEffectType.Slimed,
            name: '粘液まみれ',
            description: '拘束解除の成功率が半減',
            duration: 3,
            category: 'debuff',
            isDebuff: true,
            modifiers: {
                struggleRate: 0.5
            }
        }],
        [StatusEffectType.Paralysis, {
            type: StatusEffectType.Paralysis,
            name: '麻痺',
            description: '時々行動不能になり、攻撃力が大幅低下',
            duration: 20,
            category: 'debuff',
            isDebuff: true,
            modifiers: {
                attackPower: 0.3
            }
        }],
        [StatusEffectType.AphrodisiacPoison, {
            type: StatusEffectType.AphrodisiacPoison,
            name: '淫毒',
            description: '毎ターンMP減少＋魅了効果が蓄積',
            duration: 20,
            category: 'debuff',
            isDebuff: true,
            modifiers: {
                struggleRate: 0.4
            },
            onTick: (target: any, _effect: StatusEffect) => {
                const mpLoss = Math.min(target.mp, 2);
                if (mpLoss > 0) {
                    target.loseMp(mpLoss);
                }
            }
        }],
        [StatusEffectType.Drowsiness, {
            type: StatusEffectType.Drowsiness,
            name: 'ねむけ',
            description: '時々眠ってしまい行動不能、重ねがけで睡眠状態に',
            duration: 20,
            category: 'debuff',
            isDebuff: true,
            modifiers: {
                attackPower: 0.7
            }
        }],
        [StatusEffectType.Weakness, {
            type: StatusEffectType.Weakness,
            name: '脱力',
            description: '攻撃力と防御力が大幅低下',
            duration: 20,
            category: 'debuff',
            isDebuff: true,
            modifiers: {
                attackPower: 0.4,
                damageReceived: 1.3
            }
        }],
        [StatusEffectType.Infatuation, {
            type: StatusEffectType.Infatuation,
            name: 'メロメロ',
            description: '魅了の強化版、拘束解除率がさらに低下、MP大幅減少',
            duration: 20,
            category: 'debuff',
            isDebuff: true,
            modifiers: {
                struggleRate: 0.2
            },
            onTick: (target: any, _effect: StatusEffect) => {
                const mpLoss = Math.min(target.mp, 3);
                if (mpLoss > 0) {
                    target.loseMp(mpLoss);
                }
            }
        }],
        [StatusEffectType.Confusion, {
            type: StatusEffectType.Confusion,
            name: '混乱',
            description: '時々間違った行動をとってしまう',
            duration: 20,
            category: 'debuff',
            isDebuff: true,
            modifiers: {
                attackPower: 0.6
            }
        }],
        [StatusEffectType.Arousal, {
            type: StatusEffectType.Arousal,
            name: '発情',
            description: '拘束解除率が大幅低下、判断力が鈍る、MP減少',
            duration: 20,
            category: 'debuff',
            isDebuff: true,
            modifiers: {
                struggleRate: 0.25
            },
            onTick: (target: any, _effect: StatusEffect) => {
                const mpLoss = Math.min(target.mp, 2);
                if (mpLoss > 0) {
                    target.loseMp(mpLoss);
                }
            }
        }],
        [StatusEffectType.Seduction, {
            type: StatusEffectType.Seduction,
            name: '悩殺',
            description: '複合デバフ、様々な能力が低下、MP減少',
            duration: 20,
            category: 'debuff',
            isDebuff: true,
            modifiers: {
                attackPower: 0.5,
                struggleRate: 0.3
            },
            onTick: (target: any, _effect: StatusEffect) => {
                const mpLoss = Math.min(target.mp, 2);
                if (mpLoss > 0) {
                    target.loseMp(mpLoss);
                }
            }
        }],
        [StatusEffectType.MagicSeal, {
            type: StatusEffectType.MagicSeal,
            name: '魔法封印',
            description: 'MP使用不可、スキルが封印される',
            duration: 20,
            category: 'debuff',
            isDebuff: true,
            modifiers: {
                canUseSkills: false
            }
        }],
        [StatusEffectType.PleasureFall, {
            type: StatusEffectType.PleasureFall,
            name: '快楽堕ち',
            description: '重篤なデバフ複合状態、全能力が大幅低下、MP大幅減少',
            duration: 20,
            category: 'debuff',
            isDebuff: true,
            modifiers: {
                attackPower: 0.2,
                damageReceived: 1.8,
                struggleRate: 0.1
            },
            onTick: (target: any, _effect: StatusEffect) => {
                const mpLoss = Math.min(target.mp, 4);
                if (mpLoss > 0) {
                    target.loseMp(mpLoss);
                }
            }
        }],
        [StatusEffectType.Lewdness, {
            type: StatusEffectType.Lewdness,
            name: '淫乱',
            description: '行動が不安定になり、時々行動不能、MP減少',
            duration: 20,
            category: 'debuff',
            isDebuff: true,
            modifiers: {
                attackPower: 0.6,
                struggleRate: 0.4
            },
            onTick: (target: any, _effect: StatusEffect) => {
                const mpLoss = Math.min(target.mp, 2);
                if (mpLoss > 0) {
                    target.loseMp(mpLoss);
                }
            }
        }],
        [StatusEffectType.Hypnosis, {
            type: StatusEffectType.Hypnosis,
            name: '催眠',
            description: '完全な行動不能状態',
            duration: 15,
            category: 'debuff',
            isDebuff: true,
            modifiers: {
                canAct: false
            }
        }],
        [StatusEffectType.Brainwash, {
            type: StatusEffectType.Brainwash,
            name: '洗脳',
            description: '永続的な思考支配、解除困難、MP減少',
            duration: 30,
            category: 'debuff',
            isDebuff: true,
            modifiers: {
                canAct: false,
                canUseSkills: false
            },
            onTick: (target: any, _effect: StatusEffect) => {
                const mpLoss = Math.min(target.mp, 3);
                if (mpLoss > 0) {
                    target.loseMp(mpLoss);
                }
            }
        }],
        [StatusEffectType.Sweet, {
            type: StatusEffectType.Sweet,
            name: 'あまあま',
            description: '幸福状態でデバフに無抵抗、MP減少',
            duration: 20,
            category: 'debuff',
            isDebuff: true,
            modifiers: {
                damageReceived: 1.2,
                struggleRate: 0.6
            },
            onTick: (target: any, _effect: StatusEffect) => {
                const mpLoss = Math.min(target.mp, 1);
                if (mpLoss > 0) {
                    target.loseMp(mpLoss);
                }
            }
        }],
        [StatusEffectType.Sleep, {
            type: StatusEffectType.Sleep,
            name: '睡眠',
            description: '完全に眠っており行動不能',
            duration: 10,
            category: 'debuff',
            isDebuff: true,
            modifiers: {
                canAct: false
            }
        }],
        [StatusEffectType.DreamControl, {
            type: StatusEffectType.DreamControl,
            name: '夢操作',
            description: '夢の世界に閉じ込められ、完全に支配されている',
            duration: -1, // Permanent while sleeping
            category: 'debuff',
            isDebuff: true,
            modifiers: {
                canAct: false,
                canUseSkills: false
            }
        }],
        [StatusEffectType.Melting, {
            type: StatusEffectType.Melting,
            name: 'とろとろ',
            description: '意識がとろけて抵抗力低下、MP減少',
            duration: 20,
            category: 'debuff',
            isDebuff: true,
            modifiers: {
                attackPower: 0.5,
                struggleRate: 0.4
            },
            onTick: (target: any, _effect: StatusEffect) => {
                const mpLoss = Math.min(target.mp, 2);
                if (mpLoss > 0) {
                    target.loseMp(mpLoss);
                }
            }
        }],
        [StatusEffectType.Euphoria, {
            type: StatusEffectType.Euphoria,
            name: 'うっとり',
            description: '恍惚状態で判断力低下、MP減少',
            duration: 20,
            category: 'debuff',
            isDebuff: true,
            modifiers: {
                attackPower: 0.6,
                struggleRate: 0.5
            },
            onTick: (target: any, _effect: StatusEffect) => {
                const mpLoss = Math.min(target.mp, 1);
                if (mpLoss > 0) {
                    target.loseMp(mpLoss);
                }
            }
        }],
        [StatusEffectType.Fascination, {
            type: StatusEffectType.Fascination,
            name: '魅惑',
            description: '深い魅惑状態、行動意欲低下、MP減少',
            duration: 20,
            category: 'debuff',
            isDebuff: true,
            modifiers: {
                attackPower: 0.5,
                struggleRate: 0.3
            },
            onTick: (target: any, _effect: StatusEffect) => {
                const mpLoss = Math.min(target.mp, 2);
                if (mpLoss > 0) {
                    target.loseMp(mpLoss);
                }
            }
        }],
        [StatusEffectType.Bliss, {
            type: StatusEffectType.Bliss,
            name: '至福',
            description: '至福の陶酔状態、抵抗不能、MP減少',
            duration: 20,
            category: 'debuff',
            isDebuff: true,
            modifiers: {
                attackPower: 0.3,
                struggleRate: 0.1
            },
            onTick: (target: any, _effect: StatusEffect) => {
                const mpLoss = Math.min(target.mp, 3);
                if (mpLoss > 0) {
                    target.loseMp(mpLoss);
                }
            }
        }],
        [StatusEffectType.Enchantment, {
            type: StatusEffectType.Enchantment,
            name: '魅了術',
            description: '強力な魅了魔法の効果、完全支配、MP減少',
            duration: 20,
            category: 'debuff',
            isDebuff: true,
            modifiers: {
                attackPower: 0.2,
                struggleRate: 0.15
            },
            onTick: (target: any, _effect: StatusEffect) => {
                const mpLoss = Math.min(target.mp, 2);
                if (mpLoss > 0) {
                    target.loseMp(mpLoss);
                }
            }
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
    
    isEnergized(): boolean {
        return this.hasEffect(StatusEffectType.Energized);
    }
    
    isSlimed(): boolean {
        return this.hasEffect(StatusEffectType.Slimed);
    }
    
    isCocoon(): boolean {
        return this.hasEffect(StatusEffectType.Cocoon);
    }
    
    // New status effect helper methods
    isParalyzed(): boolean {
        return this.hasEffect(StatusEffectType.Paralysis);
    }
    
    hasAphrodisiacPoison(): boolean {
        return this.hasEffect(StatusEffectType.AphrodisiacPoison);
    }
    
    isDrowsy(): boolean {
        return this.hasEffect(StatusEffectType.Drowsiness);
    }
    
    isWeak(): boolean {
        return this.hasEffect(StatusEffectType.Weakness);
    }
    
    isInfatuated(): boolean {
        return this.hasEffect(StatusEffectType.Infatuation);
    }
    
    isConfused(): boolean {
        return this.hasEffect(StatusEffectType.Confusion);
    }
    
    isAroused(): boolean {
        return this.hasEffect(StatusEffectType.Arousal);
    }
    
    isSeduced(): boolean {
        return this.hasEffect(StatusEffectType.Seduction);
    }
    
    isMagicSealed(): boolean {
        return this.hasEffect(StatusEffectType.MagicSeal);
    }
    
    hasPleasureFall(): boolean {
        return this.hasEffect(StatusEffectType.PleasureFall);
    }
    
    isLewd(): boolean {
        return this.hasEffect(StatusEffectType.Lewdness);
    }
    
    isHypnotized(): boolean {
        return this.hasEffect(StatusEffectType.Hypnosis);
    }
    
    isBrainwashed(): boolean {
        return this.hasEffect(StatusEffectType.Brainwash);
    }
    
    isSweet(): boolean {
        return this.hasEffect(StatusEffectType.Sweet);
    }
    
    isSleeping(): boolean {
        return this.hasEffect(StatusEffectType.Sleep);
    }
    
    // New debuff helper methods
    isMelting(): boolean {
        return this.hasEffect(StatusEffectType.Melting);
    }
    
    isEuphoric(): boolean {
        return this.hasEffect(StatusEffectType.Euphoria);
    }
    
    isFascinated(): boolean {
        return this.hasEffect(StatusEffectType.Fascination);
    }
    
    isBlissful(): boolean {
        return this.hasEffect(StatusEffectType.Bliss);
    }
    
    isEnchanted(): boolean {
        return this.hasEffect(StatusEffectType.Enchantment);
    }
    
    isDreamControlled(): boolean {
        return this.hasEffect(StatusEffectType.DreamControl);
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
}