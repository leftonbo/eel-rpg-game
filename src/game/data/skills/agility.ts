import { AbilityType } from '../../systems/AbilitySystem';
import { ActionPriority } from '../../systems/StatusEffect';
import { SkillCategory, SkillProgression } from './types';

export const AGILITY_SKILLS: SkillProgression[] = [
    {
        baseSkill: {
            id: 'struggle',
            name: 'あばれる',
            description: '拘束状態専用：脱出確率2倍',
            category: SkillCategory.Support,
            mpCost: 30,
            priority: ActionPriority.StruggleAction,
            unlockConditions: [
                { abilityType: AbilityType.Agility, requiredLevel: 3 }
            ]
        },
        upgrades: [
            {
                requiredLevel: 5,
                property: 'description',
                value: '拘束状態専用：脱出確率2倍、脱出の成否に関わらずボスにダメージを与える',
                description: '「あばれる」時、脱出の成否に関わらずボスにダメージを与える (攻撃力 x 1.5)'
            }
        ]
    }
];