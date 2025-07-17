import { AbilityType } from '../../systems/AbilitySystem';
import { ActionPriority } from '../../systems/StatusEffect';
import { SkillCategory, SkillProgression } from './types';

export const COMBAT_SKILLS: SkillProgression[] = [
    {
        baseSkill: {
            id: 'power-attack',
            name: 'パワーアタック',
            description: '2.5倍の攻撃力で確実に攻撃',
            category: SkillCategory.Combat,
            mpCost: 20,
            priority: ActionPriority.NormalAction,
            unlockConditions: [
                { abilityType: AbilityType.Combat, requiredLevel: 3 }
            ],
            damageMultiplier: 2.5,
            hitRate: 1.0,
            criticalRate: 0.05,
            damageVarianceMin: -0.2,
            damageVarianceMax: 0.5
        },
        upgrades: [
            {
                requiredLevel: 5,
                property: 'damageMultiplier',
                value: 3.75, // 2.5 * 1.5 = 威力+50%
                description: 'パワーアタックの威力が50%上昇'
            },
            {
                requiredLevel: 7,
                property: 'criticalRate',
                value: 0.25, // 0.05 + 0.20 = クリティカル率+20%
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
            damageMultiplier: 1.0,
            hitRate: 1.0,
            criticalRate: 0.55, // Base 5% + 50%
            damageVarianceMin: -0.1,
            damageVarianceMax: 0.3,
            consumesAllMp: true,
            causesExhaustion: true
        },
        upgrades: []
    }
];