import { AbilityData, AbilityType } from './AbilitySystem';
import { MemorialSaveData, MemorialSystem } from './MemorialSystem';

export interface PlayerSaveData {
    abilities: { [key: string]: AbilityData };
    equipment: {
        weapon: string;
        armor: string;
    };
    memorials: MemorialSaveData; // Trophy system data
    playerInfo: {
        name: string;
        icon: string;
    };
    readDocuments: string[]; // Read document IDs for unread badge system
    shownChangelogIndex: number; // Index of the latest changelog entry shown
    version: number; // For future save data migration
}

export class PlayerSaveManager {
    private static readonly SAVE_KEY = 'eelfood_player_data';
    private static readonly CURRENT_VERSION = 7;
    
    /**
     * Save player data to localStorage
     */
    static savePlayerData(saveData: PlayerSaveData): void {
        try {
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
            console.log('Player data saved successfully');
        } catch (error) {
            console.error('Failed to save player data:', error);
        }
    }
    
    /**
     * Load player data from localStorage.
     * If no data exists, returns default save data.
     * If data is in an old format, migrates it to the current version.
     */
    static loadPlayerData(): PlayerSaveData {
        try {
            const savedData = localStorage.getItem(this.SAVE_KEY);
            if (!savedData) {
                console.log('[PlayerSaveManager][loadPlayerData] No saved player data found');
                return this.createDefaultSaveData();
            }
            
            const parsedData = JSON.parse(savedData);
            
            // Version check and migration if needed
            if (parsedData.version !== this.CURRENT_VERSION) {
                console.log('[PlayerSaveManager][loadPlayerData] Save data version mismatch, migrating...');
                return this.migrateSaveData(parsedData);
            }
            
            return parsedData as PlayerSaveData;
        } catch (error) {
            console.error('[PlayerSaveManager][loadPlayerData] Failed to load player data:', error);
            
            // if loading fails, return default data
            console.log('[PlayerSaveManager][loadPlayerData] Returning default player data');
            return this.createDefaultSaveData();
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
            memorials: MemorialSystem.INITIAL_SAVE_DATA, // Start with no boss memorials
            playerInfo: {
                name: 'エルナル',
                icon: '🐍'
            },
            readDocuments: [], // Start with no read documents
            shownChangelogIndex: -2, // Initial value that changelog modal will not show.
            version: this.CURRENT_VERSION
        };
    }
    
    /**
     * Migrate save data from older versions
     */
    private static migrateSaveData(oldData: Record<string, any>): PlayerSaveData {
        // For unknown versions, return default data
        if (oldData.version && oldData.version > this.CURRENT_VERSION) {
            console.log('Unknown version, creating new save data');
            return this.createDefaultSaveData();
        }
        
        console.log(`Migrating save data from version ${oldData.version || 'unknown'} to ${this.CURRENT_VERSION}`);
        
        let migratedData = { ...oldData };
        
        // Migration from version 1 to 2: add unlockedSkills field
        if (oldData.version === 1 || !oldData.version) {
            migratedData = {
                ...migratedData,
                unlockedSkills: [], // Initialize empty skills array
                version: 2
            };
        }
        
        // Migration from version 2 to 3: add bossMemorials field
        if (migratedData.version === 2) {
            const memorials: MemorialSaveData = MemorialSystem.INITIAL_SAVE_DATA;
            
            migratedData = {
                ...migratedData,
                memorials: memorials,
                version: 3
            };
        }
        
        // Migration from version 3 to 4: remove unlockedItems and unlockedSkills (now derived from abilities)
        if (migratedData.version === 3) {
            // Remove the redundant fields - they'll now be calculated from ability levels
            const { _unlockedItems, _unlockedSkills, ...rest } = migratedData;
            migratedData = {
                ...rest,
                version: 4
            };
        }

        // Migration from version 4 to 5: Ensure playerInfo exists
        if (migratedData.version === 4) {
            migratedData = {
                ...migratedData,
                playerInfo: {
                    name: 'エルナル',
                    icon: '🐍'
                },
                version: 5
            };
        }

        // Migration from version 5 to 6: add readDocuments field
        if (migratedData.version === 5) {
            migratedData = {
                ...migratedData,
                readDocuments: [], // Initialize empty read documents array
                version: 6
            };
        }

        // Migration from version 6 to 7: add lastSavedGameVersion field
        if (migratedData.version === 6) {
            migratedData = {
                ...migratedData,
                shownChangelogIndex: -1, // Initialize to -1 to indicate no changelog shown yet
                version: 7
            };
        }
        
        // Set final version
        migratedData.version = this.CURRENT_VERSION;
        
        return migratedData as PlayerSaveData;
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
     * Export save data as JSON string
     */
    static exportSaveDataJson(): string {
        const saveData = this.loadPlayerData() || this.createDefaultSaveData();
        return JSON.stringify(saveData, null, 2);
    }
    
    /**
     * Import save data from JSON string
     */
    static importSaveDataJson(jsonString: string): boolean {
        try {
            const importedData = JSON.parse(jsonString);
            
            // Migrate the imported data if necessary
            const migratedData = importedData.version !== this.CURRENT_VERSION
                ? this.migrateSaveData(importedData)
                : importedData;

            // Validate the structure of the migrated data
            if (!this.validateSaveDataStructure(migratedData)) {
                throw new Error('Invalid save data structure');
            }
            
            // Save the imported data
            this.savePlayerData(migratedData);
            console.log('Save data imported successfully');
            return true;
        } catch (error) {
            console.error('Failed to import save data:', error);
            return false;
        }
    }
    
    /**
     * Validate save data structure
     */
    private static validateSaveDataStructure(data: Record<string, any>): boolean {
        if (!data || typeof data !== 'object') return false;
        
        // Check required fields
        if (!data.abilities || typeof data.abilities !== 'object') return false;
        if (!data.equipment || typeof data.equipment !== 'object') return false;
        if (!data.equipment.weapon || typeof data.equipment.weapon !== 'string') return false;
        if (!data.equipment.armor || typeof data.equipment.armor !== 'string') return false;
        if (!data.memorials || typeof data.memorials !== 'object') return false;
        if (!data.playerInfo || typeof data.playerInfo !== 'object') return false;
        if (typeof data.playerInfo.name !== 'string') return false;
        if (typeof data.playerInfo.icon !== 'string') return false;
        if (!Array.isArray(data.readDocuments)) return false;
        
        // Check abilities structure
        for (const [, ability] of Object.entries(data.abilities)) {
            if (!ability || typeof ability !== 'object') return false;
            const abilityObj = ability as Record<string, any>;
            if (typeof abilityObj.level !== 'number') return false;
            if (typeof abilityObj.experience !== 'number') return false;
        }
        
        return true;
    }
}