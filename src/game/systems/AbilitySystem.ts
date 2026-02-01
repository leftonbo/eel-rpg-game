import { t } from '@/game/i18n';

export enum AbilityType {
    Combat = 'combat',
    Toughness = 'toughness',
    CraftWork = 'craftwork',
    Endurance = 'endurance',
    Agility = 'agility',
    Explorer = 'explorer'
}

export enum EquipmentType {
    Weapons = 'weapons',
    Armors = 'armors',
    Gloves = 'gloves',
    Belts = 'belts'
}

export interface AbilityData {
    level: number;
    experience: number;
}

export interface Equipment {
    id: string;
    attackPowerBonus?: number;
    hpBonus?: number;
    mpBonus?: number;
    escapeRateBonus?: number;
    requiredLevel: number;
    abilityType: AbilityType;
}

export const EQUIPMENT_I18N_NAMESPACE = 'equipment';

export class AbilitySystem {
    public static readonly MAX_LEVEL = 10;
    public static readonly SCORE_PER_LEVEL = 2; // 1 level = 2 points in score calculation
    public abilities: Map<AbilityType, AbilityData> = new Map();
    
    constructor() {
        this.initializeAbilities();
    }
    
    private initializeAbilities(): void {
        // Initialize all abilities at level 0 with 0 experience
        Object.values(AbilityType).forEach(type => {
            this.abilities.set(type, {
                level: 0,
                experience: 0
            });
        });
    }
    
    /**
     * Calculate required total experience for reaching a specific level
     * Formula: level^3 * 50
     */
    getRequiredExperienceForLevel(level: number): number {
        if (level <= 0) return 0;
        return level * level * level * 50;
    }
    
    /**
     * Calculate current level based on total experience
     */
    calculateLevelFromExperience(totalExperience: number): number {
        let level = 0;
        while (this.getRequiredExperienceForLevel(level + 1) <= totalExperience) {
            level++;
            if (level >= AbilitySystem.MAX_LEVEL) break; // Max level is 10
        }
        return level;
    }
    
    /**
     * Add experience to an ability and check for level up
     */
    addExperience(abilityType: AbilityType, amount: number): { leveledUp: boolean; newLevel: number; previousLevel: number } {
        const ability = this.abilities.get(abilityType);
        if (!ability) {
            throw new Error(`Ability ${abilityType} not found`);
        }
        
        const previousLevel = ability.level;
        ability.experience += amount;
        
        // Recalculate level based on total experience
        const newLevel = this.calculateLevelFromExperience(ability.experience);
        ability.level = Math.min(newLevel, AbilitySystem.MAX_LEVEL); // Cap at max level
        
        const leveledUp = ability.level > previousLevel;
        
        return {
            leveledUp,
            newLevel: ability.level,
            previousLevel
        };
    }
    
    /**
     * Get ability data
     */
    getAbility(abilityType: AbilityType): AbilityData | undefined {
        return this.abilities.get(abilityType);
    }
    
    /**
     * Set experience directly for an ability (for debug purposes)
     */
    setAbilityExperience(abilityType: AbilityType, experience: number): void {
        const ability = this.abilities.get(abilityType);
        if (!ability) {
            throw new Error(`Ability ${abilityType} not found`);
        }
        
        ability.experience = Math.max(0, experience); // Ensure non-negative
        
        // Recalculate level based on total experience
        const newLevel = this.calculateLevelFromExperience(ability.experience);
        ability.level = Math.min(newLevel, AbilitySystem.MAX_LEVEL); // Cap at max level
    }
    
    /**
     * Get experience needed for next level
     */
    getExperienceToNextLevel(abilityType: AbilityType): number {
        const ability = this.abilities.get(abilityType);
        if (!ability || ability.level >= AbilitySystem.MAX_LEVEL) return 0;
        
        const nextLevelRequirement = this.getRequiredExperienceForLevel(ability.level + 1);
        return nextLevelRequirement - ability.experience;
    }
    
    
    /**
     * Calculate craftwork item healing bonus (10% per level)
     */
    getCraftworkHealingBonus(): number {
        const craftworkAbility = this.abilities.get(AbilityType.CraftWork);
        if (!craftworkAbility) return 0;
        
        return craftworkAbility.level / 10; // 10% per level (level/10 = multiplier)
    }
    
    
    /**
     * Get explorer level (controls boss unlock progression)
     */
    getExplorerLevel(): number {
        const explorerAbility = this.abilities.get(AbilityType.Explorer);
        if (!explorerAbility) return 0;
        
        return explorerAbility.level;
    }
    
    /**
     * Load abilities from save data
     */
    loadFromSaveData(saveData: { [key: string]: AbilityData }): void {
        Object.entries(saveData).forEach(([abilityType, data]) => {
            if (Object.values(AbilityType).includes(abilityType as AbilityType)) {
                this.abilities.set(abilityType as AbilityType, { ...data });
            }
        });
    }
    
    /**
     * Export abilities for save data
     */
    exportForSave(): { [key: string]: AbilityData } {
        const saveData: { [key: string]: AbilityData } = {};
        this.abilities.forEach((data, type) => {
            saveData[type] = { ...data };
        });
        return saveData;
    }
    
    /**
     * Get maximum score for progress calculation
     */
    public static getMaximumScore(): number {
        // Assuming maximum score is based on max level for all abilities
        return Object.values(AbilityType).length * AbilitySystem.MAX_LEVEL * AbilitySystem.SCORE_PER_LEVEL;
    }
    
    /**
     * Calculate progress score based on abilities
     * - Each ability contributes 2 points per level
     */
    public calculateProgressScore(): number {
        let score = 0;
        this.abilities.forEach(ability => {
            score += ability.level * AbilitySystem.SCORE_PER_LEVEL; // 2 points per level
        });
        return score;
    }
    
    /**
     * Build equipment key for localization
     * @param category Equipment category
     * @param equipmentId Equipment ID
     * @param field Field name (name or description)
     * @returns Equipment key
     */
    public static buildEquipmentKey(
        category: EquipmentType,
        equipmentId: string,
        field: 'name' | 'description'
    ): string {
        return `${EQUIPMENT_I18N_NAMESPACE}.${category}.${equipmentId}.${field}`;
    }

    /**
     * Get equipment name for localization
     * @param category Equipment category
     * @param equipment Equipment
     * @returns Equipment name
     */
    public static getEquipmentName(
        category: EquipmentType,
        equipment: Equipment
    ): string {
        return t(AbilitySystem.buildEquipmentKey(category, equipment.id, 'name'));
    }

    /**
     * Get equipment description for localization
     * @param category Equipment category
     * @param equipment Equipment
     * @returns Equipment description
     */
    public static getEquipmentDescription(
        category: EquipmentType,
        equipment: Equipment
    ): string {
        return t(AbilitySystem.buildEquipmentKey(category, equipment.id, 'description'));
    }
}

// Equipment definitions
export const WEAPONS: Equipment[] = [
    { id: 'bare-hands', attackPowerBonus: 0, requiredLevel: 0, abilityType: AbilityType.Combat },
    { id: 'slingshot', attackPowerBonus: 3, requiredLevel: 1, abilityType: AbilityType.Combat },
    { id: 'wooden-bow', attackPowerBonus: 6, requiredLevel: 2, abilityType: AbilityType.Combat },
    { id: 'shuriken', attackPowerBonus: 9, requiredLevel: 3, abilityType: AbilityType.Combat },
    { id: 'compound-bow', attackPowerBonus: 12, requiredLevel: 4, abilityType: AbilityType.Combat },
    { id: 'repeater-bow', attackPowerBonus: 15, requiredLevel: 5, abilityType: AbilityType.Combat },
    { id: 'submachine-gun', attackPowerBonus: 18, requiredLevel: 6, abilityType: AbilityType.Combat },
    { id: 'assault-rifle', attackPowerBonus: 24, requiredLevel: 7, abilityType: AbilityType.Combat },
    { id: 'laser-rifle', attackPowerBonus: 30, requiredLevel: 8, abilityType: AbilityType.Combat },
    { id: 'plasma-cannon', attackPowerBonus: 40, requiredLevel: 9, abilityType: AbilityType.Combat },
    { id: 'super-blaster', attackPowerBonus: 60, requiredLevel: 10, abilityType: AbilityType.Combat }
];

export const ARMORS: Equipment[] = [
    { id: 'naked', hpBonus: 0, requiredLevel: 0, abilityType: AbilityType.Toughness },
    { id: 't-shirt', hpBonus: 20, requiredLevel: 1, abilityType: AbilityType.Toughness },
    { id: 'travel-gear', hpBonus: 40, requiredLevel: 2, abilityType: AbilityType.Toughness },
    { id: 'work-clothes', hpBonus: 70, requiredLevel: 3, abilityType: AbilityType.Toughness },
    { id: 'adventurer-clothes', hpBonus: 100, requiredLevel: 4, abilityType: AbilityType.Toughness },
    { id: 'protective-jacket', hpBonus: 160, requiredLevel: 5, abilityType: AbilityType.Toughness },
    { id: 'military-jacket', hpBonus: 220, requiredLevel: 6, abilityType: AbilityType.Toughness },
    { id: 'reinforced-suit', hpBonus: 320, requiredLevel: 7, abilityType: AbilityType.Toughness },
    { id: 'future-suit', hpBonus: 440, requiredLevel: 8, abilityType: AbilityType.Toughness },
    { id: 'powered-armor', hpBonus: 650, requiredLevel: 9, abilityType: AbilityType.Toughness },
    { id: 'super-armor', hpBonus: 900, requiredLevel: 10, abilityType: AbilityType.Toughness }
];

export const GLOVES: Equipment[] = [
    { id: 'bare-hands-gloves', escapeRateBonus: 0, requiredLevel: 0, abilityType: AbilityType.Agility },
    { id: 'cloth-gloves', escapeRateBonus: 0.1, requiredLevel: 1, abilityType: AbilityType.Agility },
    { id: 'work-gloves', escapeRateBonus: 0.2, requiredLevel: 2, abilityType: AbilityType.Agility },
    { id: 'grip-gloves', escapeRateBonus: 0.3, requiredLevel: 3, abilityType: AbilityType.Agility },
    { id: 'climbing-gloves', escapeRateBonus: 0.4, requiredLevel: 4, abilityType: AbilityType.Agility },
    { id: 'tactical-gloves', escapeRateBonus: 0.5, requiredLevel: 5, abilityType: AbilityType.Agility },
    { id: 'spider-gloves', escapeRateBonus: 0.6, requiredLevel: 6, abilityType: AbilityType.Agility },
    { id: 'gecko-gloves', escapeRateBonus: 0.7, requiredLevel: 7, abilityType: AbilityType.Agility },
    { id: 'reinforced-gloves', escapeRateBonus: 0.8, requiredLevel: 8, abilityType: AbilityType.Agility },
    { id: 'nano-gloves', escapeRateBonus: 0.9, requiredLevel: 9, abilityType: AbilityType.Agility },
    { id: 'ultimate-grip', escapeRateBonus: 1.0, requiredLevel: 10, abilityType: AbilityType.Agility }
];

export const BELTS: Equipment[] = [
    { id: 'no-belt', mpBonus: 0, requiredLevel: 0, abilityType: AbilityType.Endurance },
    { id: 'simple-belt', mpBonus: 5, requiredLevel: 1, abilityType: AbilityType.Endurance },
    { id: 'sport-belt', mpBonus: 10, requiredLevel: 2, abilityType: AbilityType.Endurance },
    { id: 'training-belt', mpBonus: 15, requiredLevel: 3, abilityType: AbilityType.Endurance },
    { id: 'weight-belt', mpBonus: 20, requiredLevel: 4, abilityType: AbilityType.Endurance },
    { id: 'martial-belt', mpBonus: 25, requiredLevel: 5, abilityType: AbilityType.Endurance },
    { id: 'stamina-belt', mpBonus: 30, requiredLevel: 6, abilityType: AbilityType.Endurance },
    { id: 'energy-belt', mpBonus: 35, requiredLevel: 7, abilityType: AbilityType.Endurance },
    { id: 'vitality-belt', mpBonus: 40, requiredLevel: 8, abilityType: AbilityType.Endurance },
    { id: 'power-belt', mpBonus: 45, requiredLevel: 9, abilityType: AbilityType.Endurance },
    { id: 'infinity-belt', mpBonus: 50, requiredLevel: 10, abilityType: AbilityType.Endurance }
];
