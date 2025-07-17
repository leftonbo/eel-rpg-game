import { COMBAT_SKILLS } from './combat';
import { TOUGHNESS_SKILLS, TOUGHNESS_PASSIVE_SKILLS } from './toughness';
import { ENDURANCE_PASSIVE_SKILLS } from './endurance';
import { AGILITY_SKILLS } from './agility';
import { SkillData, SkillProgression, UnlockCondition } from './types';
import { AbilityType } from '../../systems/AbilitySystem';

export * from './types';

export const ALL_SKILL_PROGRESSIONS: SkillProgression[] = [
    ...COMBAT_SKILLS,
    ...TOUGHNESS_SKILLS,
    ...AGILITY_SKILLS
];

export const ALL_PASSIVE_SKILLS: SkillData[] = [
    ...TOUGHNESS_PASSIVE_SKILLS,
    ...ENDURANCE_PASSIVE_SKILLS
];

export class SkillRegistry {
    private static skillMap: Map<string, SkillData> = new Map();
    private static progressionMap: Map<string, SkillProgression> = new Map();
    
    static initialize() {
        // Initialize skill progressions
        ALL_SKILL_PROGRESSIONS.forEach(progression => {
            this.progressionMap.set(progression.baseSkill.id, progression);
            this.skillMap.set(progression.baseSkill.id, progression.baseSkill);
        });
        
        // Initialize passive skills
        ALL_PASSIVE_SKILLS.forEach(skill => {
            this.skillMap.set(skill.id, skill);
        });
    }
    
    static getSkill(skillId: string): SkillData | undefined {
        return this.skillMap.get(skillId);
    }
    
    static getProgression(skillId: string): SkillProgression | undefined {
        return this.progressionMap.get(skillId);
    }
    
    static getUpgradedSkill(skillId: string, abilityLevels: Map<AbilityType, number>): SkillData | undefined {
        const baseSkill = this.skillMap.get(skillId);
        if (!baseSkill) return undefined;
        
        const progression = this.progressionMap.get(skillId);
        if (!progression) return { ...baseSkill };
        
        // Create a copy of the base skill
        const upgradedSkill: SkillData = { ...baseSkill };
        
        // Apply upgrades based on ability levels
        const primaryAbility = baseSkill.unlockConditions[0];
        const currentLevel = abilityLevels.get(primaryAbility.abilityType) || 0;
        
        progression.upgrades.forEach(upgrade => {
            if (currentLevel >= upgrade.requiredLevel) {
                (upgradedSkill as any)[upgrade.property] = upgrade.value;
            }
        });
        
        return upgradedSkill;
    }
    
    static getUnlockedSkills(abilityLevels: Map<AbilityType, number>): string[] {
        const unlockedSkills: string[] = [];
        
        // Check regular skills
        ALL_SKILL_PROGRESSIONS.forEach(progression => {
            if (this.isSkillUnlocked(progression.baseSkill.unlockConditions, abilityLevels)) {
                unlockedSkills.push(progression.baseSkill.id);
            }
        });
        
        // Check passive skills
        ALL_PASSIVE_SKILLS.forEach(skill => {
            if (this.isSkillUnlocked(skill.unlockConditions, abilityLevels)) {
                unlockedSkills.push(skill.id);
            }
        });
        
        return unlockedSkills;
    }
    
    static getUnlockedPassiveSkills(abilityLevels: Map<AbilityType, number>): SkillData[] {
        return ALL_PASSIVE_SKILLS.filter(skill => 
            this.isSkillUnlocked(skill.unlockConditions, abilityLevels)
        );
    }
    
    private static isSkillUnlocked(conditions: UnlockCondition[], abilityLevels: Map<AbilityType, number>): boolean {
        return conditions.every(condition => {
            const currentLevel = abilityLevels.get(condition.abilityType) || 0;
            return currentLevel >= condition.requiredLevel;
        });
    }
}

// Initialize the registry
SkillRegistry.initialize();