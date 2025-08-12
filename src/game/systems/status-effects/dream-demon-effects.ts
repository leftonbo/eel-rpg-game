import { Actor } from '@/game/entities/Actor';
import { StatusEffectType, StatusEffectConfig, StatusEffect } from '../StatusEffectTypes';

export const dreamDemonEffectsConfigs: StatusEffectConfig[] = [
    {
        type: StatusEffectType.Paralysis,
        name: '麻痺',
        description: '命中率と攻撃力が大幅に低下',
        duration: 20,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            attackPower: 0.3,
            accuracy: 0.3
        },
        messages: {
            onApplyPlayer: '{name}は麻痺した！',
            onApplyBoss: '{name}は麻痺した！',
            onRemovePlayer: '{name}の麻痺が解けた',
            onRemoveBoss: '{name}の麻痺が解けた'
        }
    },
    {
        type: StatusEffectType.AphrodisiacPoison,
        name: '淫毒',
        description: '毎ターンMP減少、拘束解除率が低下',
        duration: 20,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            struggleRate: 0.4
        },
        onTick: (target: Actor, _effect: StatusEffect) => {
            const mpLoss = Math.min(target.mp, 2);
            if (mpLoss > 0) {
                target.loseMp(mpLoss);
            }
        },
        messages: {
            onApplyPlayer: '{name}は淫毒に冒された！',
            onApplyBoss: '{name}は淫毒に冒された！',
            onTickPlayer: '{name}は淫毒により体力が奪われている…',
            onTickBoss: '{name}は淫毒により体力が奪われている…',
            onRemovePlayer: '{name}は淫毒から回復した',
            onRemoveBoss: '{name}は淫毒から回復した'
        }
    },
    {
        type: StatusEffectType.Drowsiness,
        name: 'ねむけ',
        description: '攻撃力が低下、重ねがけで睡眠状態に',
        duration: 20,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            attackPower: 0.7
        },
        messages: {
            onApplyPlayer: '{name}はねむけになった！',
            onApplyBoss: '{name}はねむけになった！',
            onRemovePlayer: '{name}のねむけが解けた',
            onRemoveBoss: '{name}のねむけが解けた'
        }
    },
    {
        type: StatusEffectType.Weakness,
        name: '脱力',
        description: '攻撃力と防御力が大幅低下',
        duration: 20,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            attackPower: 0.4,
            damageReceived: 1.5
        },
        messages: {
            onApplyPlayer: '{name}は脱力した！',
            onApplyBoss: '{name}は脱力した！',
            onRemovePlayer: '{name}の脱力が解けた',
            onRemoveBoss: '{name}の脱力が解けた'
        }
    },
    {
        type: StatusEffectType.Infatuation,
        name: 'メロメロ',
        description: '拘束解除率が大きく低下、MP大幅減少',
        duration: 20,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            struggleRate: 0.2
        },
        onTick: (target: Actor, _effect: StatusEffect) => {
            const mpLoss = Math.min(target.mp, 5);
            if (mpLoss > 0) {
                target.loseMp(mpLoss);
            }
        },
        messages: {
            onApplyPlayer: '{name}はメロメロ状態になった！',
            onApplyBoss: '{name}はメロメロ状態になった！',
            onTickPlayer: '{name}はメロメロ状態で判断力が鈍っている…',
            onTickBoss: '{name}はメロメロ状態で判断力が鈍っている…',
            onRemovePlayer: '{name}はメロメロ状態から回復した',
            onRemoveBoss: '{name}はメロメロ状態から回復した'
        }
    },
    {
        type: StatusEffectType.Confusion,
        name: '混乱',
        description: '攻撃力が大幅に低下',
        duration: 20,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            attackPower: 0.1
        },
        messages: {
            onApplyPlayer: '{name}は混乱した！',
            onApplyBoss: '{name}は混乱した！',
            onRemovePlayer: '{name}の混乱が解けた',
            onRemoveBoss: '{name}の混乱が解けた'
        }
    },
    {
        type: StatusEffectType.Arousal,
        name: '発情',
        description: '拘束解除率が大幅低下、MP大幅減少',
        duration: 20,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            struggleRate: 0.25
        },
        onTick: (target: Actor, _effect: StatusEffect) => {
            const mpLoss = Math.min(target.mp, 5);
            if (mpLoss > 0) {
                target.loseMp(mpLoss);
            }
        },
        messages: {
            onApplyPlayer: '{name}は発情した！',
            onApplyBoss: '{name}は発情した！',
            onRemovePlayer: '{name}の発情が解けた',
            onRemoveBoss: '{name}の発情が解けた'
        }
    },
    {
        type: StatusEffectType.Seduction,
        name: '悩殺',
        description: '複合デバフ、様々な能力が低下、MP減少',
        duration: 20,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            attackPower: 0.5,
            struggleRate: 0.3,
            damageReceived: 1.3
        },
        onTick: (target: Actor, _effect: StatusEffect) => {
            const mpLoss = Math.min(target.mp, 2);
            if (mpLoss > 0) {
                target.loseMp(mpLoss);
            }
        },
        messages: {
            onApplyPlayer: '{name}は悩殺された！',
            onApplyBoss: '{name}は悩殺された！',
            onRemovePlayer: '{name}の悩殺が解けた',
            onRemoveBoss: '{name}の悩殺が解けた'
        }
    },
    {
        type: StatusEffectType.MagicSeal,
        name: '魔法封印',
        description: 'MPを使うスキルが封印される',
        duration: 20,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            canUseSkills: false
        },
        messages: {
            onApplyPlayer: '{name}は魔法を使えなくなった！',
            onApplyBoss: '{name}は魔法を使えなくなった！',
            onRemovePlayer: '{name}の魔法封印が解けた',
            onRemoveBoss: '{name}の魔法封印が解けた'
        }
    },
    {
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
        onTick: (target: Actor, _effect: StatusEffect) => {
            const mpLoss = Math.min(target.mp, 4);
            if (mpLoss > 0) {
                target.loseMp(mpLoss);
            }
        },
        messages: {
            onApplyPlayer: '{name}は快楽に堕ちてしまった！',
            onApplyBoss: '{name}は快楽に堕ちてしまった！',
            onRemovePlayer: '{name}は快楽から回復した',
            onRemoveBoss: '{name}は快楽から回復した'
        }
    },
    {
        type: StatusEffectType.Lewdness,
        name: '淫乱',
        description: '行動が不安定になり、時々行動不能、MP減少',
        duration: 20,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            attackPower: 0.6,
            struggleRate: 0.4,
            accuracy: 0.5
        },
        onTick: (target: Actor, _effect: StatusEffect) => {
            const mpLoss = Math.min(target.mp, 2);
            if (mpLoss > 0) {
                target.loseMp(mpLoss);
            }
        },
        messages: {
            onApplyPlayer: '{name}は淫乱になった！',
            onApplyBoss: '{name}は淫乱になった！',
            onRemovePlayer: '{name}の淫乱が解けた',
            onRemoveBoss: '{name}の淫乱が解けた'
        }
    },
    {
        type: StatusEffectType.Hypnosis,
        name: '催眠',
        description: '深い催眠状態、行動できない',
        duration: 4,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            canAct: false
        },
        messages: {
            onApplyPlayer: '{name}は催眠を受けてしまった！',
            onApplyBoss: '{name}は催眠された！',
            onRemovePlayer: '{name}の催眠が解けた',
            onRemoveBoss: '{name}の催眠が解けた'
        }
    },
    {
        type: StatusEffectType.Brainwash,
        name: '洗脳',
        description: '永続的な思考支配、解除困難、MP減少',
        duration: 6,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            canAct: false,
            canUseSkills: false
        },
        onTick: (target: Actor, _effect: StatusEffect) => {
            const mpLoss = Math.min(target.mp, 3);
            if (mpLoss > 0) {
                target.loseMp(mpLoss);
            }
        },
        messages: {
            onApplyPlayer: '{name}は洗脳されてしまった！',
            onApplyBoss: '{name}は洗脳された！',
            onRemovePlayer: '{name}の洗脳が解けた',
            onRemoveBoss: '{name}の洗脳が解けた'
        }
    },
    {
        type: StatusEffectType.Sweet,
        name: 'あまあま',
        description: '幸福状態でデバフに無抵抗、MP減少',
        duration: 20,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            damageReceived: 1.2,
            struggleRate: 0.6,
            debuffChanceModifier: 3.0
        },
        onTick: (target: Actor, _effect: StatusEffect) => {
            const mpLoss = Math.min(target.mp, 1);
            if (mpLoss > 0) {
                target.loseMp(mpLoss);
            }
        },
        messages: {
            onApplyPlayer: '{name}はあまあまになった！',
            onApplyBoss: '{name}はあまあまになった！',
            onRemovePlayer: '{name}はあまあまから回復した',
            onRemoveBoss: '{name}はあまあまから回復した'
        }
    },
    {
        type: StatusEffectType.Melting,
        name: 'とろとろ',
        description: '意識がとろけて抵抗力低下、MP減少',
        duration: 20,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            damageReceived: 1.2,
            struggleRate: 0.4,
            debuffChanceModifier: 1.2
        },
        onTick: (target: Actor, _effect: StatusEffect) => {
            const mpLoss = Math.min(target.mp, 2);
            if (mpLoss > 0) {
                target.loseMp(mpLoss);
            }
        },
        messages: {
            onApplyPlayer: '{name}はとろとろになった！',
            onApplyBoss: '{name}はとろとろになった！',
            onRemovePlayer: '{name}はとろとろから回復した',
            onRemoveBoss: '{name}はとろとろから回復した'
        }
    },
    {
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
        onTick: (target: Actor, _effect: StatusEffect) => {
            const mpLoss = Math.min(target.mp, 1);
            if (mpLoss > 0) {
                target.loseMp(mpLoss);
            }
        },
        messages: {
            onApplyPlayer: '{name}はうっとりになった！',
            onApplyBoss: '{name}はうっとりになった！',
            onRemovePlayer: '{name}はうっとりから回復した',
            onRemoveBoss: '{name}はうっとりから回復した'
        }
    },
    {
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
        onTick: (target: Actor, _effect: StatusEffect) => {
            const mpLoss = Math.min(target.mp, 2);
            if (mpLoss > 0) {
                target.loseMp(mpLoss);
            }
        },
        messages: {
            onApplyPlayer: '{name}は魅惑された！',
            onApplyBoss: '{name}は魅惑された！',
            onRemovePlayer: '{name}の魅惑が解けた',
            onRemoveBoss: '{name}の魅惑が解けた'
        }
    },
    {
        type: StatusEffectType.Bliss,
        name: '至福',
        description: '至福の陶酔状態、抵抗不能、MP減少',
        duration: 20,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            attackPower: 0.3,
            struggleRate: 0.05
        },
        onTick: (target: Actor, _effect: StatusEffect) => {
            const mpLoss = Math.min(target.mp, 3);
            if (mpLoss > 0) {
                target.loseMp(mpLoss);
            }
        },
        messages: {
            onApplyPlayer: '{name}は至福になった！',
            onApplyBoss: '{name}は至福になった！',
            onRemovePlayer: '{name}は至福から回復した',
            onRemoveBoss: '{name}は至福から回復した'
        }
    },
    {
        type: StatusEffectType.Enchantment,
        name: '魅了術',
        description: '強力な魅了魔法の効果、完全支配、MP減少',
        duration: 20,
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            attackPower: 0.1,
            struggleRate: 0.1
        },
        onTick: (target: Actor, _effect: StatusEffect) => {
            const mpLoss = Math.min(target.mp, 2);
            if (mpLoss > 0) {
                target.loseMp(mpLoss);
            }
        },
        messages: {
            onApplyPlayer: '{name}は魅了術にかかった！',
            onApplyBoss: '{name}は魅了術にかかった！',
            onRemovePlayer: '{name}の魅了術が解けた',
            onRemoveBoss: '{name}の魅了術が解けた'
        }
    },
    {
        type: StatusEffectType.DreamControl,
        name: '夢操作',
        description: '夢の世界に閉じ込められ、完全に支配されている',
        duration: -1, // Permanent while sleeping
        category: 'debuff',
        isDebuff: true,
        modifiers: {
            canAct: false,
            canUseSkills: false
        },
        messages: {
            onApplyPlayer: '{name}は夢の世界に閉じ込められた！',
            onApplyBoss: '{name}は夢の世界に閉じ込められた！',
            onRemovePlayer: '{name}は夢の世界から抜け出した',
            onRemoveBoss: '{name}は夢の世界から抜け出した'
        }
    }
];