import { AccuracyType, DamageType, TargetStatus } from '@/game/systems/Action';
import { AbilityType } from '../../systems/AbilitySystem';
import { ActionPriority } from '../../systems/StatusEffect';
import { SkillCategory, SkillProgression } from './types';

export const COMBAT_SKILLS: SkillProgression[] = [
    {
        baseSkill: {
            id: 'power-attack',
            name: 'パワーアタック',
            description: '2.5倍の攻撃力で確実に攻撃。クリティカル率10%',
            category: SkillCategory.Combat,
            mpCost: 20,
            priority: ActionPriority.NormalAction,
            unlockConditions: [
                { abilityType: AbilityType.Combat, requiredLevel: 3 }
            ],
            action: {
                accuracy: 1.0,
                accuracyType: AccuracyType.Evade,
                criticalRate: 0.10, // Base 5% critical rate + 5% from skill
                damageParameters: [
                    {
                        targetStatus: TargetStatus.HP,
                        type: DamageType.Damage,
                        formula: (a, b, am, bm) => a.attackPower * am * 2.5 - b.defense * bm,
                        fluctuation: 0.3,
                    }
                ]
            }
        },
        upgrades: [
            {
                requiredLevel: 5,
                property: 'description',
                value: '4倍の攻撃力で確実に攻撃。クリティカル率10%',
                description: 'パワーアタックの威力が150%上昇'
            },
            {
                requiredLevel: 7,
                property: 'description',
                value: '4倍の攻撃力で確実に攻撃。クリティカル率30%',
                description: 'パワーアタックのクリティカル率が20%上昇'
            }
        ]
    },
    {
        baseSkill: {
            id: 'ultra-smash',
            name: 'ウルトラスマッシュ',
            description: 'MPを全て消費。攻撃力+消費したMPのダメージを与える。クリティカル率+50%。使用後は疲れ果てになる',
            category: SkillCategory.Combat,
            mpCost: 0, // Special: consumes all MP
            priority: ActionPriority.NormalAction,
            unlockConditions: [
                { abilityType: AbilityType.Combat, requiredLevel: 9 }
            ],
            consumesAllMp: true,
            action: {
                accuracy: 1.0,
                accuracyType: AccuracyType.Fixed,
                criticalRate: 0.50, // Base 5% critical rate + 45% from skill
                damageParameters: [
                    {
                        targetStatus: TargetStatus.HP,
                        type: DamageType.Damage,
                        formula: (user, target, userMult, targetMult) => {
                            // MPを全て消費してその分のダメージを与える
                            const mpDamage = user.mp * userMult;
                            // 通常の攻撃力ダメージを計算
                            const baseDamage = user.attackPower * userMult - target.defense * targetMult;
                            return baseDamage + mpDamage; // 合計ダメージ
                        },
                        fluctuation: 0.3
                    }
                ]
            }
        },
        upgrades: []
    }
];