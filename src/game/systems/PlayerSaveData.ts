import { AbilityData, AbilityType } from './AbilitySystem';

export interface PlayerSaveData {
    abilities: { [key: string]: AbilityData };
    equipment: {
        weapon: string;
        armor: string;
    };
    unlockedItems: string[];
    unlockedSkills: string[]; // New: track unlocked skills
    version: number; // For future save data migration
}

export class PlayerSaveManager {
    private static readonly SAVE_KEY = 'eelfood_player_data';
    private static readonly CURRENT_VERSION = 2;
    
    /**
     * Save player data to localStorage
     */
    static savePlayerData(saveData: PlayerSaveData): void {
        try {
            const dataWithVersion = {
                ...saveData,
                version: this.CURRENT_VERSION
            };
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(dataWithVersion));
            console.log('Player data saved successfully');
        } catch (error) {
            console.error('Failed to save player data:', error);
        }
    }
    
    /**
     * Load player data from localStorage
     */
    static loadPlayerData(): PlayerSaveData | null {
        try {
            const savedData = localStorage.getItem(this.SAVE_KEY);
            if (!savedData) {
                console.log('No saved player data found');
                return null;
            }
            
            const parsedData = JSON.parse(savedData);
            
            // Version check and migration if needed
            if (parsedData.version !== this.CURRENT_VERSION) {
                console.log('Save data version mismatch, migrating...');
                return this.migrateSaveData(parsedData);
            }
            
            return parsedData as PlayerSaveData;
        } catch (error) {
            console.error('Failed to load player data:', error);
            return null;
        }
    }
    
    /**
     * Create default save data
     */
    static createDefaultSaveData(): PlayerSaveData {
        const defaultAbilities: { [key: string]: AbilityData } = {};
        Object.values(AbilityType).forEach(type => {
            defaultAbilities[type] = {
                level: 0,
                experience: 0
            };
        });
        
        return {
            abilities: defaultAbilities,
            equipment: {
                weapon: 'bare-hands',
                armor: 'naked'
            },
            unlockedItems: ['heal-potion', 'adrenaline', 'energy-drink'], // Default items
            unlockedSkills: [], // Default: no skills unlocked, they unlock based on ability levels
            version: this.CURRENT_VERSION
        };
    }
    
    /**
     * Migrate save data from older versions
     */
    private static migrateSaveData(oldData: any): PlayerSaveData {
        console.log(`Migrating save data from version ${oldData.version || 'unknown'} to ${this.CURRENT_VERSION}`);
        
        // Migration from version 1 to 2: add unlockedSkills field
        if (oldData.version === 1 || !oldData.version) {
            const migratedData = {
                ...oldData,
                unlockedSkills: [], // Initialize empty skills array
                version: this.CURRENT_VERSION
            };
            return migratedData;
        }
        
        // For unknown versions, return default data
        console.log('Unknown version, creating new save data');
        return this.createDefaultSaveData();
    }
    
    /**
     * Clear all saved data (useful for testing or reset)
     */
    static clearSaveData(): void {
        try {
            localStorage.removeItem(this.SAVE_KEY);
            console.log('Player data cleared');
        } catch (error) {
            console.error('Failed to clear player data:', error);
        }
    }
    
    /**
     * Check if save data exists
     */
    static hasSaveData(): boolean {
        return localStorage.getItem(this.SAVE_KEY) !== null;
    }
    
    /**
     * Quick save just equipment data
     */
    static saveEquipment(weapon: string, armor: string): void {
        const currentData = this.loadPlayerData() || this.createDefaultSaveData();
        currentData.equipment.weapon = weapon;
        currentData.equipment.armor = armor;
        this.savePlayerData(currentData);
    }
    
    /**
     * Quick save just abilities data
     */
    static saveAbilities(abilities: { [key: string]: AbilityData }): void {
        const currentData = this.loadPlayerData() || this.createDefaultSaveData();
        currentData.abilities = abilities;
        this.savePlayerData(currentData);
    }
    
    /**
     * Quick save just unlocked items
     */
    static saveUnlockedItems(unlockedItems: string[]): void {
        const currentData = this.loadPlayerData() || this.createDefaultSaveData();
        currentData.unlockedItems = unlockedItems;
        this.savePlayerData(currentData);
    }
    
    /**
     * Quick save just unlocked skills
     */
    static saveUnlockedSkills(unlockedSkills: string[]): void {
        const currentData = this.loadPlayerData() || this.createDefaultSaveData();
        currentData.unlockedSkills = unlockedSkills;
        this.savePlayerData(currentData);
    }
}