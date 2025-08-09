export enum AbilityType {
    Combat = 'combat',
    Toughness = 'toughness',
    CraftWork = 'craftwork',
    Endurance = 'endurance',
    Agility = 'agility',
    Explorer = 'explorer'
}

export interface AbilityData {
    level: number;
    experience: number;
}

export interface Equipment {
    id: string;
    name: string;
    description: string;
    attackPowerBonus?: number;
    hpBonus?: number;
    requiredLevel: number;
    abilityType: AbilityType;
}

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
     * Calculate endurance max MP bonus (10% per level)
     */
    getEnduranceMpBonus(): number {
        const enduranceAbility = this.abilities.get(AbilityType.Endurance);
        if (!enduranceAbility) return 0;
        
        return enduranceAbility.level / 10; // 10% per level (level/10 = multiplier)
    }
    
    /**
     * Calculate agility restrain escape bonus (10% per level)
     */
    getAgilityEscapeBonus(): number {
        const agilityAbility = this.abilities.get(AbilityType.Agility);
        if (!agilityAbility) return 0;
        
        return agilityAbility.level * 0.1; // 10% per level
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
}

// Equipment definitions
export const WEAPONS: Equipment[] = [
    { id: 'bare-hands', name: '素手', description: '生身の拳で戦う', attackPowerBonus: 0, requiredLevel: 0, abilityType: AbilityType.Combat },
    { id: 'slingshot', name: 'パチンコ', description: '小石を飛ばす簡易武器', attackPowerBonus: 3, requiredLevel: 1, abilityType: AbilityType.Combat },
    { id: 'wooden-bow', name: '木の弓矢', description: '木製の弓と矢', attackPowerBonus: 6, requiredLevel: 2, abilityType: AbilityType.Combat },
    { id: 'knife', name: 'ナイフ', description: '手製の刃物', attackPowerBonus: 9, requiredLevel: 3, abilityType: AbilityType.Combat },
    { id: 'compound-bow', name: 'コンパウンドボウ', description: '現代的な複合弓', attackPowerBonus: 12, requiredLevel: 4, abilityType: AbilityType.Combat },
    { id: 'crossbow', name: 'クロスボウ', description: '機械式弓', attackPowerBonus: 15, requiredLevel: 5, abilityType: AbilityType.Combat },
    { id: 'submachine-gun', name: 'サブマシンガン', description: '連射可能な自動火器', attackPowerBonus: 18, requiredLevel: 6, abilityType: AbilityType.Combat },
    { id: 'assault-rifle', name: 'アサルトライフル', description: '高性能自動銃', attackPowerBonus: 24, requiredLevel: 7, abilityType: AbilityType.Combat },
    { id: 'laser-rifle', name: 'レーザーライフル', description: '未来的なエネルギー兵器', attackPowerBonus: 30, requiredLevel: 8, abilityType: AbilityType.Combat },
    { id: 'plasma-cannon', name: 'プラズマキャノン', description: 'エネルギー砲', attackPowerBonus: 40, requiredLevel: 9, abilityType: AbilityType.Combat },
    { id: 'super-blaster', name: 'スーパーブラスター', description: '究極の破壊兵器', attackPowerBonus: 50, requiredLevel: 10, abilityType: AbilityType.Combat }
];

export const ARMORS: Equipment[] = [
    { id: 'naked', name: 'はだか', description: '何も装備していない', hpBonus: 0, requiredLevel: 0, abilityType: AbilityType.Toughness },
    { id: 't-shirt', name: 'Tシャツ', description: '普通のTシャツ', hpBonus: 20, requiredLevel: 1, abilityType: AbilityType.Toughness },
    { id: 'travel-gear', name: '旅装', description: '旅行用の服装', hpBonus: 40, requiredLevel: 2, abilityType: AbilityType.Toughness },
    { id: 'work-clothes', name: '作業服', description: '作業用の服装', hpBonus: 70, requiredLevel: 3, abilityType: AbilityType.Toughness },
    { id: 'adventurer-clothes', name: '冒険者の服', description: '冒険に適した丈夫な服', hpBonus: 100, requiredLevel: 4, abilityType: AbilityType.Toughness },
    { id: 'combat-suit', name: '戦闘服', description: '戦闘用装備', hpBonus: 160, requiredLevel: 5, abilityType: AbilityType.Toughness },
    { id: 'military-jacket', name: '軍用ジャケット', description: '軍事用の防護服', hpBonus: 220, requiredLevel: 6, abilityType: AbilityType.Toughness },
    { id: 'reinforced-armor', name: '強化アーマー', description: '強化防護具', hpBonus: 320, requiredLevel: 7, abilityType: AbilityType.Toughness },
    { id: 'future-suit', name: '近未来スーツ', description: '高性能な防護スーツ', hpBonus: 440, requiredLevel: 8, abilityType: AbilityType.Toughness },
    { id: 'quantum-suit', name: '量子スーツ', description: '量子技術装備', hpBonus: 650, requiredLevel: 9, abilityType: AbilityType.Toughness },
    { id: 'super-armor', name: '超合金アーマー', description: '最強の防護装備', hpBonus: 900, requiredLevel: 10, abilityType: AbilityType.Toughness }
];
