import { AbilityType } from '../../systems/AbilitySystem';
import { ActionPriority } from '../../systems/StatusEffect';
import { SkillData, SkillCategory, SkillProgression } from './types';

export const TOUGHNESS_SKILLS: SkillProgression[] = [
    {
        baseSkill: {
            id: 'defend',
            name: '防御',
            description: '次の攻撃のダメージを軽減する',
            category: SkillCategory.Defense,
            mpCost: 0,
            priority: ActionPriority.NormalAction,
            unlockConditions: [
                { abilityType: AbilityType.Toughness, requiredLevel: 1 }
            ]
        },
        upgrades: [
            {
                requiredLevel: 7,
                property: 'description',
                value: '次の攻撃のダメージを100%カットする',
                description: '防御中のHPダメージを100%カットする'
            }
        ]
    },
    {
        baseSkill: {
            id: 'stay-still',
            name: 'じっとする',
            description: '拘束状態専用：わずかに体力とMPを回復',
            category: SkillCategory.Defense,
            mpCost: 0,
            priority: ActionPriority.NormalAction,
            unlockConditions: [
                { abilityType: AbilityType.Toughness, requiredLevel: 3 }
            ],
            healPercentage: 0.05 // 5% of max HP
        },
        upgrades: []
    }
];

export const TOUGHNESS_PASSIVE_SKILLS: SkillData[] = [
    {
        id: 'regeneration',
        name: '自然回復',
        description: '毎ターン、拘束されていなければヘルスが最大値の1/20だけ回復する',
        category: SkillCategory.Passive,
        mpCost: 0,
        priority: ActionPriority.NormalAction,
        unlockConditions: [
            { abilityType: AbilityType.Toughness, requiredLevel: 5 }
        ],
        isPassive: true,
        passiveEffect: 'regeneration'
    },
    {
        id: 'escape-recovery',
        name: '脱出回復',
        description: '拘束や食べられなどから抜け出すと、失った最大ヘルスの20%を回復する',
        category: SkillCategory.Passive,
        mpCost: 0,
        priority: ActionPriority.NormalAction,
        unlockConditions: [
            { abilityType: AbilityType.Toughness, requiredLevel: 9 }
        ],
        isPassive: true,
        passiveEffect: 'escape-recovery'
    }
];