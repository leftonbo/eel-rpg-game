import { Actor } from '@/game/entities/Actor';
import { StatusEffectType, StatusEffectConfig, StatusEffect } from '../StatusEffectTypes';

// デフォルトダメージ量の定数
const DEFAULT_FIRE_DAMAGE = 8;
const DEFAULT_POISON_DAMAGE = 3;

export const battleEffectsConfigs: Map<StatusEffectType, StatusEffectConfig> = new Map([
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
    [StatusEffectType.Shrunk, {
        type: StatusEffectType.Shrunk,
        name: '縮小',
        description: '体が縮んでしまい、あらゆる能力が低下',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            attackPower: 0.25,
            damageReceived: 2.0,
            struggleRate: 0.1,
            accuracy: 0.25,
        },
        messages: {
        }
    }],
    [StatusEffectType.Fire, {
        type: StatusEffectType.Fire,
        name: '火だるま',
        description: '毎ターンHPが減少',
        duration: 2,
        category: 'debuff',
        isDebuff: true,
        stackable: true,
        potency: DEFAULT_FIRE_DAMAGE,
        onTick: (target: Actor, effect: StatusEffect) => {
            const damage = effect.potency ?? DEFAULT_FIRE_DAMAGE;
            target.takeDamage(damage);
        },
        messages: {
            onApplyPlayer: '{name}は火だるま状態になった！',
            onApplyBoss: '{name}は火だるま状態になった！',
            onTickPlayer: '{name}は火だるま状態で{damage}のダメージを受けた！',
            onTickBoss: '{name}は火だるま状態で{damage}のダメージを受けた！',
            onRemovePlayer: '{name}の火だるま状態が回復した',
            onRemoveBoss: '{name}の火だるま状態が回復した'
        }
    }],
    [StatusEffectType.Charm, {
        type: StatusEffectType.Charm,
        name: '魅了',
        description: 'もがくの成功率が低下',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            struggleRate: 0.5
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
        description: '毎ターンHPが減少',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        stackable: true,
        potency: DEFAULT_POISON_DAMAGE,
        onTick: (target: Actor, effect: StatusEffect) => {
            const damage = effect.potency ?? DEFAULT_POISON_DAMAGE;
            target.takeDamage(damage);
        },
        messages: {
            onApplyPlayer: '{name}は毒状態になった！',
            onApplyBoss: '{name}は毒状態になった！',
            onTickPlayer: '{name}は毒により{damage}のダメージを受けた！',
            onTickBoss: '{name}は毒により{damage}のダメージを受けた！',
            onRemovePlayer: '{name}の毒が抜けた',
            onRemoveBoss: '{name}の毒が抜けた'
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
        onTick: (target: Actor, _effect: StatusEffect) => {
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
    
    // Scorpion Carrier status effects
    [StatusEffectType.Anesthesia, {
        type: StatusEffectType.Anesthesia,
        name: '麻酔',
        description: '麻酔により行動不能',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            canAct: false
        }
    }],
    [StatusEffectType.ScorpionPoison, {
        type: StatusEffectType.ScorpionPoison,
        name: 'サソリ毒',
        description: '毎ターン最大HPの1/10のダメージを受ける',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        stackable: true,
        onTick: (target: Actor, _effect: StatusEffect) => {
            const damage = Math.floor(target.maxHp / 10);
            target.takeDamage(damage);
        },
        messages: {
            onApplyPlayer: '{name}は強力なサソリ毒に冒された！',
            onApplyBoss: '{name}は強力なサソリ毒に冒された！',
            onTickPlayer: '{name}はサソリ毒により{damage}のダメージを受けた！',
            onTickBoss: '{name}はサソリ毒により{damage}のダメージを受けた！',
            onRemovePlayer: '{name}の体からサソリ毒が抜けた',
            onRemoveBoss: '{name}の体からサソリ毒が抜けた'
        }
    }],
    [StatusEffectType.Weakening, {
        type: StatusEffectType.Weakening,
        name: '脱力剤',
        description: '体力が奪われ、受けるダメージが1.5倍になる',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            damageReceived: 1.5
        }
    }],
    
    // Mikan Dragon status effects
    [StatusEffectType.Lethargy, {
        type: StatusEffectType.Lethargy,
        name: '脱力',
        description: '体に力が入らず、攻撃力が大幅に低下',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            attackPower: 0.3
        }
    }],
    
    // Sea Kraken status effects
    [StatusEffectType.VisionImpairment, {
        type: StatusEffectType.VisionImpairment,
        name: '視界阻害',
        description: 'イカスミで視界が阻害され、攻撃の命中率が低下',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            accuracy: 0.7 // Reduces accuracy to 70% of its original value
        }
    }],
    
    // Aqua Serpent status effects
    [StatusEffectType.WaterSoaked, {
        type: StatusEffectType.WaterSoaked,
        name: '水浸し',
        description: '水で濡れて防御力が低下',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            damageReceived: 1.3 // Increases damage received by 30%
        }
    }],
    [StatusEffectType.Dizzy, {
        type: StatusEffectType.Dizzy,
        name: '目眩',
        description: 'ふらつきで攻撃の命中率が低下',
        duration: 2,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            accuracy: 0.8 // Reduces accuracy to 80% of its original value
        }
    }],
    
    // Clean Master status effects
    [StatusEffectType.Soapy, {
        type: StatusEffectType.Soapy,
        name: '泡まみれ',
        description: '石鹸の泡で滑りやすくなり、命中率が低下',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            accuracy: 0.7, // Reduces accuracy to 70%
            struggleRate: 0.8 // Slightly harder to struggle
        }
    }],
    [StatusEffectType.Spinning, {
        type: StatusEffectType.Spinning,
        name: '回転中',
        description: '遠心分離で回転し、命中率が大幅低下',
        duration: 2,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            accuracy: 0.5, // Reduces accuracy to 50%
            canAct: false // Cannot act during first turn
        }
    }],
    [StatusEffectType.Steamy, {
        type: StatusEffectType.Steamy,
        name: '蒸し暑い',
        description: '温風で蒸し暑くなり、毎ターン軽微ダメージ',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        stackable: true,
        onTick: (target: Actor, _effect: StatusEffect) => {
            target.takeDamage(4);
        },
        messages: {
            onApplyPlayer: '{name}は蒸し暑さに包まれた！',
            onApplyBoss: '{name}は蒸し暑さに包まれた！',
            onTickPlayer: '{name}は熱風により{damage}のダメージを受けた！',
            onTickBoss: '{name}は熱風により{damage}のダメージを受けた！',
            onRemovePlayer: '{name}を包む蒸し暑さが収まった',
            onRemoveBoss: '{name}を包む蒸し暑さが収まった'
        }
    }],
    
    // Dark Ghost mental effects
    [StatusEffectType.Fear, {
        type: StatusEffectType.Fear,
        name: '恐怖',
        description: '恐怖により受けるダメージが1.5倍になる',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            damageReceived: 1.5
        },
        messages: {
            onApplyPlayer: '{name}は恐怖に支配された！',
            onApplyBoss: '{name}は恐怖に支配された！',
            onRemovePlayer: '{name}の恐怖が和らいだ',
            onRemoveBoss: '{name}の恐怖が和らいだ'
        }
    }],
    [StatusEffectType.Oblivion, {
        type: StatusEffectType.Oblivion,
        name: '忘却',
        description: 'スキルの使用方法を忘れ、使用できない',
        duration: 3,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            canUseSkills: false
        },
        messages: {
            onApplyPlayer: '{name}はスキルの使用方法を忘れてしまった！',
            onApplyBoss: '{name}はスキルの使用方法を忘れてしまった！',
            onRemovePlayer: '{name}はスキルの使用方法を思い出した',
            onRemoveBoss: '{name}はスキルの使用方法を思い出した'
        }
    }],
    
    // Underground Worm status effects
    [StatusEffectType.Petrified, {
        type: StatusEffectType.Petrified,
        name: '石化',
        description: '石のように固まって行動できない',
        duration: 2,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            canAct: false
        },
        messages: {
            onApplyPlayer: '{name}は石のように固まってしまった！',
            onApplyBoss: '{name}は石のように固まってしまった！',
            onRemovePlayer: '{name}の石化が解けた',
            onRemoveBoss: '{name}の石化が解けた'
        }
    }]
]);