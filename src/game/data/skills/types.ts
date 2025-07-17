import { AbilityType } from '../../systems/AbilitySystem';
import { ActionPriority } from '../../systems/StatusEffect';

export enum SkillCategory {
    Combat = 'combat',
    Defense = 'defense',
    Support = 'support',
    Passive = 'passive'
}

export interface UnlockCondition {
    abilityType: AbilityType;
    requiredLevel: number;
}

export interface SkillData {
    id: string;
    name: string;
    description: string;
    category: SkillCategory;
    mpCost: number;
    priority: ActionPriority;
    unlockConditions: UnlockCondition[];
    
    // Combat skill properties
    damageMultiplier?: number;
    hitRate?: number;
    criticalRate?: number;
    damageVarianceMin?: number;
    damageVarianceMax?: number;
    
    // Healing skill properties
    healAmount?: number;
    healPercentage?: number;
    
    // Status effect properties
    statusEffects?: string[];
    
    // Special properties
    consumesAllMp?: boolean;
    causesExhaustion?: boolean;
    
    // Passive skill properties
    isPassive?: boolean;
    passiveEffect?: string;
}

export interface SkillResult {
    success: boolean;
    message: string;
    damage?: number;
    heal?: number;
    mpConsumed?: number;
}

export interface SkillUpgrade {
    requiredLevel: number;
    property: keyof SkillData;
    value: any;
    description: string;
}

export interface SkillProgression {
    baseSkill: SkillData;
    upgrades: SkillUpgrade[];
}