import { Actor } from "../entities/Actor";

export enum ActionPriority {
    CannotAct = 'cannot-act',
    StruggleAction = 'struggle-action', 
    NormalAction = 'normal-action'
}

export enum StatusEffectType {
    // `Dead` is for Player to make game-over state.
    // NOTE: It's not meaning actual "death".
    Dead = 'dead',
    // `Doomed` is for Player to mark defeat state (MaxHP = 0). 
    // It can be used to trigger special defeat scenes.
    Doomed = 'doomed',
    // `KnockedOut` is for any actor to mark incapacitated state (HP = 0).
    // If Boss is KnockedOut, the player win.
    // If Player is KnockedOut, it continues some turns
    // then recover itself and heald 50% of MaxHP.
    KnockedOut = 'knocked-out',
    // `Exhausted` is for Player to mark exhausted state (MP = 0).
    // Player's skills are disabled until MP is recovered or after some turns.
    Exhausted = 'exhausted',
    // `Restrained` is for Player to mark restrained state.
    // Player cannot act, but can struggle to escape.
    Restrained = 'restrained',
    // `Cocoon` is special state for Mech Spider.
    Cocoon = 'cocoon',
    // `Eaten` is for Player to mark eaten state.
    Eaten = 'eaten',
    // `Defending` is for defensive state.
    Defending = 'defending',
    // `Stunned` is for Player / Boss to mark stunned state.
    Stunned = 'stunned',
    Fire = 'fire',
    Charm = 'charm',
    Slow = 'slow',
    Poison = 'poison',
    // `Invincible` is from Adrenaline Shot (Item)
    Invincible = 'invincible',
    // `Energized` is from Energy Drink (Item)
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
    Enchantment = 'enchantment',
    
    // Scorpion Carrier effects
    Anesthesia = 'anesthesia',
    ScorpionPoison = 'scorpion-poison',
    Weakening = 'weakening',
    
    // Mikan Dragon effects
    Lethargy = 'lethargy',
    
    // Sea Kraken effects
    VisionImpairment = 'vision-impairment',
    
    // Aqua Serpent effects
    WaterSoaked = 'water-soaked',
    Dizzy = 'dizzy',
    
    // Clean Master effects
    Soapy = 'soapy',
    Spinning = 'spinning',
    Steamy = 'steamy',
    
    // Dark Ghost mental effects
    Fear = 'fear',
    Oblivion = 'oblivion',
    
    // Underground Worm effects
    Petrified = 'petrified',
    
    // Bat Vampire effects
    Darkness = 'darkness'
}

export interface StatusEffect {
    type: StatusEffectType;
    duration: number;
    name: string;
    description: string;
    stackable?: boolean;
    potency?: number; // 効力パラメーター（ダメージ量などを定義）
}

export interface StatusEffectMessages {
    // Messages when effect is applied
    onApplyPlayer?: string; // For when Player receives the effect
    onApplyBoss?: string; // For when Boss receives the effect
    
    // Messages during effect tick (damage/effect)
    onTickPlayer?: string; // Template: use {damage} for damage amount
    onTickBoss?: string; // Template: use {damage} for damage amount
    
    // Messages when effect is removed
    onRemovePlayer?: string; // For when Player's effect is removed
    onRemoveBoss?: string; // For when Boss's effect is removed
    
    // Hide specific messages by setting to empty string ""
    // If undefined, uses default message generation
}

export interface StatusEffectConfig {
    type: StatusEffectType;
    name: string;
    description: string;
    duration: number;
    onApply?: (target: Actor) => void;
    onTick?: (target: Actor, effect: StatusEffect) => void;
    onRemove?: (target: Actor) => void;
    stackable?: boolean;
    potency?: number; // デフォルトの効力値（StatusEffectの作成時に使用）
    
    // New properties for better organization
    category: 'buff' | 'debuff' | 'neutral';
    isDebuff: boolean;
    modifiers?: {
        attackPower?: number; // Multiplier for attack power (default: 1.0)
        damageReceived?: number; // Multiplier for damage received (default: 1.0)
        struggleRate?: number; // Multiplier for struggle success rate (default: 1.0)
        accuracy?: number; // Multiplier for hit accuracy (default: 1.0)
        canAct?: boolean; // Whether the entity can act (default: true)
        canUseSkills?: boolean; // Whether skills can be used (default: true)
        actionPriority?: ActionPriority; // Action priority level
    };
    
    // Custom messages for different actor types
    messages?: StatusEffectMessages;
}