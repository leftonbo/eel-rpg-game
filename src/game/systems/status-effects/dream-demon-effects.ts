import { Actor } from '@/game/entities/Actor';
import { StatusEffectType, StatusEffectConfig, StatusEffect } from '../StatusEffectTypes';

export const dreamDemonEffectsConfigs: Map<StatusEffectType, StatusEffectConfig> = new Map([
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
        onTick: (target: Actor, _effect: StatusEffect) => {
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
        onTick: (target: Actor, _effect: StatusEffect) => {
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
        onTick: (target: Actor, _effect: StatusEffect) => {
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
        onTick: (target: Actor, _effect: StatusEffect) => {
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
        onTick: (target: Actor, _effect: StatusEffect) => {
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
        onTick: (target: Actor, _effect: StatusEffect) => {
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
        onTick: (target: Actor, _effect: StatusEffect) => {
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
        onTick: (target: Actor, _effect: StatusEffect) => {
            const mpLoss = Math.min(target.mp, 1);
            if (mpLoss > 0) {
                target.loseMp(mpLoss);
            }
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
        onTick: (target: Actor, _effect: StatusEffect) => {
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
        onTick: (target: Actor, _effect: StatusEffect) => {
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
        onTick: (target: Actor, _effect: StatusEffect) => {
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
        onTick: (target: Actor, _effect: StatusEffect) => {
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
        onTick: (target: Actor, _effect: StatusEffect) => {
            const mpLoss = Math.min(target.mp, 2);
            if (mpLoss > 0) {
                target.loseMp(mpLoss);
            }
        }
    }]
]);