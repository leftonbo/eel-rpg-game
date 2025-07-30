import { AbilityData, AbilityType } from './AbilitySystem';
import { BossMemorial, MemorialSaveData, MemorialSystem } from './MemorialSystem';

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
    version: number; // For future save data migration
}

export class PlayerSaveManager {
    private static readonly SAVE_KEY = 'eelfood_player_data';
    private static readonly CURRENT_VERSION = 5;
    
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

        // Migration from version 4 to 5: add readDocuments field
        if (migratedData.version === 4) {
            migratedData = {
                ...migratedData,
                readDocuments: [], // Initialize empty read documents array
                version: 5
            };
        }

        // Ensure playerInfo exists (add if missing in any version)
        if (!migratedData.playerInfo) {
            migratedData.playerInfo = {
                name: 'エルナル',
                icon: '🐍'
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
     * Quick save just battle memorials
     */
    static saveBattleMemorials(battleMemorials: { [bossId: string]: BossMemorial }): void {
        const currentData = this.loadPlayerData() || this.createDefaultSaveData();
        currentData.memorials.bossMemorials = Object.values(battleMemorials);
        this.savePlayerData(currentData);
    }

    /**
     * Quick save just player info (name and icon)
     */
    static savePlayerInfo(name: string, icon: string): void {
        const currentData = this.loadPlayerData() || this.createDefaultSaveData();
        currentData.playerInfo = { name, icon };
        this.savePlayerData(currentData);
    }

    /**
     * Mark a document as read
     */
    static markDocumentAsRead(documentId: string): void {
        const currentData = this.loadPlayerData() || this.createDefaultSaveData();
        
        // Add to readDocuments if not already present
        if (!currentData.readDocuments.includes(documentId)) {
            currentData.readDocuments.push(documentId);
            this.savePlayerData(currentData);
        }
    }

    /**
     * Check if a document has been read
     */
    static isDocumentRead(documentId: string): boolean {
        const currentData = this.loadPlayerData() || this.createDefaultSaveData();
        return currentData.readDocuments.includes(documentId);
    }

    /**
     * Get list of unread document IDs from a given document list
     */
    static getUnreadDocumentIds(allDocumentIds: string[]): string[] {
        const currentData = this.loadPlayerData() || this.createDefaultSaveData();
        return allDocumentIds.filter(id => !currentData.readDocuments.includes(id));
    }
    
    /**
     * Export save data as JSON string
     */
    static exportSaveData(): string {
        const saveData = this.loadPlayerData() || this.createDefaultSaveData();
        return JSON.stringify(saveData, null, 2);
    }
    
    /**
     * Import save data from JSON string
     */
    static importSaveData(jsonString: string): boolean {
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