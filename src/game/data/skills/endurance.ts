import { AbilityType } from '../../systems/AbilitySystem';
import { ActionPriority } from '../../systems/StatusEffect';
import { SkillData, SkillCategory } from './types';

export const ENDURANCE_PASSIVE_SKILLS: SkillData[] = [
    {
        id: 'mp-recovery-on-defense',
        name: 'MP回復強化',
        description: '「防御」または「じっとする」コマンド時、MPが全回復するようになる',
        category: SkillCategory.Passive,
        mpCost: 0,
        priority: ActionPriority.NormalAction,
        unlockConditions: [
            { abilityType: AbilityType.Endurance, requiredLevel: 3 }
        ],
        isPassive: true,
        passiveEffect: 'mp-recovery-on-defense'
    }
];