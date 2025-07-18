// import { AccuracyType, DamageType, TargetStatus } from '@/game/systems/Action';
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
            // Action は Player.convertSkillDataToAction で動的に生成される
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
            // Action は Player.convertSkillDataToAction で動的に生成される
        },
        upgrades: []
    }
];