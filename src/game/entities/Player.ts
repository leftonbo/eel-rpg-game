import { StatusEffectType, ActionPriority } from '../systems/StatusEffect';
import { AbilitySystem, AbilityType, Equipment } from '../systems/AbilitySystem';
import { PlayerSaveManager, PlayerSaveData } from '../systems/PlayerSaveData';
import { updatePlayerItems } from '../data/ExtendedItems';
import { Actor } from './Actor';
import { SkillRegistry, SkillData } from '../data/skills';
import { MemorialSystem } from '../systems/MemorialSystem';
import { SkillStrategyFactory } from './SkillStrategy';
import { PlayerEquipmentManager } from './PlayerEquipmentManager';
import { PlayerItemManager } from './PlayerItemManager';
import { PlayerBattleActions } from './PlayerBattleActions';
import { PlayerProgressionManager } from './PlayerProgressionManager';
import * as PlayerConstants from './PlayerConstants';


export interface SkillResult {
    success: boolean;
    mpConsumed?: number; // Only for skills that consume MP
    message: string;
    damage?: number; // Only for attack skills
}

// Re-export constants for backward compatibility
export const DEFAULT_PLAYER_NAME = PlayerConstants.DEFAULT_PLAYER_NAME;
export const DEFAULT_PLAYER_ICON = PlayerConstants.DEFAULT_PLAYER_ICON;

export class Player extends Actor {
    public name: string = DEFAULT_PLAYER_NAME;
    public icon: string = DEFAULT_PLAYER_ICON;
    
    // Base stats (before equipment/abilities)
    public baseMaxHp: number = PlayerConstants.BASE_MAX_HP;
    public baseMaxMp: number = PlayerConstants.BASE_MAX_MP;
    public baseAttackPower: number = PlayerConstants.BASE_ATTACK_POWER;
    
    // Agility experience callback
    public agilityExperienceCallback?: (amount: number) => void;
    public isDefending: boolean = false;
    public struggleAttempts: number = 0; // For restrain escape probability
    
    // Ability and equipment system
    public abilitySystem: AbilitySystem = new AbilitySystem();
    public memorialSystem: MemorialSystem = new MemorialSystem();
    public equipmentManager: PlayerEquipmentManager;
    public itemManager: PlayerItemManager = new PlayerItemManager();
    public battleActions: PlayerBattleActions;
    public progressionManager: PlayerProgressionManager;
    
    constructor() {
        super(DEFAULT_PLAYER_NAME, PlayerConstants.BASE_MAX_HP, PlayerConstants.BASE_ATTACK_POWER, PlayerConstants.BASE_MAX_MP);
        this.equipmentManager = new PlayerEquipmentManager(this.abilitySystem);
        this.battleActions = new PlayerBattleActions(this);
        this.progressionManager = new PlayerProgressionManager(this.abilitySystem);
    }

    /**
     * 初期化メソッド
     */
    public lateInitialize(): void {
        this.loadFromSave();
        this.initializeDefaultUnlocks();
        this.initializeItems();
        this.recalculateStats();
    }
    
    /**
     * Load player data from localStorage
     */
    private loadFromSave(): void {
        console.log('[Player][loadFromSave] Loading player data from localStorage...');
        const saveData = PlayerSaveManager.loadPlayerData();
        
        if (saveData) {
            this.loadSaveDataComponents(saveData);
        } else {
            this.initializeDefaultData();
        }
    }
    
    /**
     * Load all components from save data
     */
    private loadSaveDataComponents(saveData: any): void {
        console.log('[Player][loadFromSave] Save data found:', saveData);
        
        this.loadAbilities(saveData.abilities);
        this.loadEquipment(saveData.equipment);
        this.loadMemorials(saveData.memorials);
        this.loadPlayerInfo(saveData.playerInfo);
        
        console.log('[Player][loadFromSave] Player data loaded successfully');
    }
    
    /**
     * Load abilities from save data
     */
    private loadAbilities(abilitiesData: any): void {
        console.log('[Player][loadFromSave] Loading abilities:', abilitiesData);
        this.abilitySystem.loadFromSaveData(abilitiesData);
    }
    
    /**
     * Load equipment from save data
     */
    private loadEquipment(equipmentData: any): void {
        console.log('[Player][loadFromSave] Loading equipment:', equipmentData);
        this.equipmentManager.loadEquipment(equipmentData.weapon, equipmentData.armor);
    }
    
    /**
     * Load memorials from save data
     */
    private loadMemorials(memorialsData: any): void {
        console.log('[Player][loadFromSave] Loading memorials:', memorialsData);
        this.memorialSystem.importData(memorialsData || {});
    }
    
    /**
     * Load player info from save data
     */
    private loadPlayerInfo(playerInfoData: any): void {
        if (playerInfoData) {
            console.log('[Player][loadFromSave] Loading player info:', playerInfoData);
            this.name = playerInfoData.name;
            this.icon = playerInfoData.icon;
            this.displayName = playerInfoData.name;
        }
    }
    
    /**
     * Initialize default data when no save exists
     */
    private initializeDefaultData(): void {
        console.log('[Player][loadFromSave] No save data found, initializing with defaults');
        this.memorialSystem.initializeData();
    }
    
    /**
     * Save player data to localStorage
     */
    public saveToStorage(): void {
        const saveData: PlayerSaveData = {
            abilities: this.abilitySystem.exportForSave(),
            equipment: this.equipmentManager.exportEquipment(),
            memorials: this.memorialSystem.exportData(),
            playerInfo: {
                name: this.name,
                icon: this.icon
            },
            version: PlayerConstants.SAVE_DATA_VERSION
        };
        
        PlayerSaveManager.savePlayerData(saveData);
    }
    
    /**
     * Recalculate all stats based on abilities and equipment
     */
    public recalculateStats(): void {
        // Calculate HP with toughness bonus and armor
        const toughnessMultiplier = PlayerConstants.STAT_MULTIPLIER_BASE + this.abilitySystem.getToughnessHpBonus();
        const armorBonus = this.equipmentManager.getArmorHpBonus();
        this.maxHp = Math.round((this.baseMaxHp + armorBonus) * toughnessMultiplier);
        
        // Calculate MP with endurance bonus
        const enduranceMultiplier = PlayerConstants.STAT_MULTIPLIER_BASE + this.abilitySystem.getEnduranceMpBonus();
        this.maxMp = Math.round(this.baseMaxMp * enduranceMultiplier);
        
        // Update items based on new ability levels
        updatePlayerItems(this);
    }
    
    /**
     * Initialize default unlocks for basic skills and items
     */
    private initializeDefaultUnlocks(): void {
        // Default unlocks are now handled by ability-based calculation
        // No manual unlocking needed - skills/items derived from ability levels
    }
    
    private initializeItems(): void {
        // Initialize items based on ability levels
        updatePlayerItems(this);
    }
    
    
    /**
     * Get all unlocked skills with their current stats (calculated from ability levels)
     */
    public getUnlockedSkills(): SkillData[] {
        const abilityLevels = this.getAbilityLevelsMap();
        const unlockedSkillIds = SkillRegistry.getUnlockedSkills(abilityLevels);
        
        return this.buildSkillsFromIds(unlockedSkillIds, abilityLevels);
    }
    
    /**
     * Get ability levels as a map for skill calculations
     */
    private getAbilityLevelsMap(): Map<AbilityType, number> {
        const abilityLevels = new Map<AbilityType, number>();
        Object.values(AbilityType).forEach(type => {
            const ability = this.abilitySystem.getAbility(type);
            abilityLevels.set(type, ability?.level || 0);
        });
        return abilityLevels;
    }
    
    /**
     * Build skill data array from skill IDs
     */
    private buildSkillsFromIds(skillIds: string[], abilityLevels: Map<AbilityType, number>): SkillData[] {
        const skills: SkillData[] = [];
        
        skillIds.forEach(skillId => {
            const skill = SkillRegistry.getUpgradedSkill(skillId, abilityLevels);
            if (skill) {
                skills.push(skill);
            }
        });
        
        return skills;
    }
    
    /**
     * Get unlocked passive skills
     */
    public getUnlockedPassiveSkills(): SkillData[] {
        const abilityLevels = this.getAbilityLevelsMap();
        return SkillRegistry.getUnlockedPassiveSkills(abilityLevels);
    }
    
    /**
     * Check if a specific skill is unlocked (calculated from ability levels)
     */
    public hasSkill(skillId: string): boolean {
        const abilityLevels = this.getAbilityLevelsMap();
        const unlockedSkillIds = SkillRegistry.getUnlockedSkills(abilityLevels);
        return unlockedSkillIds.includes(skillId);
    }
    
    getAttackPower(): number {
        // Calculate base attack power with combat ability and weapon
        const combatMultiplier = PlayerConstants.STAT_MULTIPLIER_BASE + this.abilitySystem.getCombatAttackBonus();
        const weaponBonus = this.equipmentManager.getWeaponAttackBonus();
        const baseWithAbilityAndWeapon = (this.baseAttackPower + weaponBonus) * combatMultiplier;
        
        // Apply status effect modifiers
        const statusModifier = this.statusEffects.getAttackModifier();
        return Math.round(baseWithAbilityAndWeapon * statusModifier);
    }
    
    /**
     * Equip a weapon (if unlocked)
     */
    public equipWeapon(weaponId: string): boolean {
        const success = this.equipmentManager.equipWeapon(weaponId);
        if (success) {
            this.recalculateStats();
        }
        return success;
    }
    
    /**
     * Equip armor (if unlocked)
     */
    public equipArmor(armorId: string): boolean {
        const success = this.equipmentManager.equipArmor(armorId);
        if (success) {
            this.recalculateStats();
        }
        return success;
    }
    
    /**
     * Get available weapons based on combat level
     */
    public getAvailableWeapons(): Equipment[] {
        return this.equipmentManager.getAvailableWeapons();
    }
    
    /**
     * Get available armors based on toughness level
     */
    public getAvailableArmors(): Equipment[] {
        return this.equipmentManager.getAvailableArmors();
    }
    
    /**
     * Add experience to an ability
     */
    public addExperience(abilityType: AbilityType, amount: number): { leveledUp: boolean; newLevel: number; previousLevel: number } {
        const result = this.progressionManager.addExperience(abilityType, amount);
        
        if (result.leveledUp) {
            this.recalculateStats(); // This will update items automatically
            this.saveToStorage(); // Auto-save on level up
        }
        
        return result;
    }
    
    
    heal(amount: number): number {
        if (amount <= 0) return 0;
        
        // Only heal if hp is below max
        if (this.hp >= this.maxHp) return 0;
        
        // Apply craftwork healing bonus
        const craftworkMultiplier = PlayerConstants.CRAFTWORK_HEALING_MULTIPLIER_BASE + this.abilitySystem.getCraftworkHealingBonus();
        const enhancedAmount = Math.round(amount * craftworkMultiplier);
        
        const oldHp = this.hp;
        this.hp = Math.min(this.maxHp, this.hp + enhancedAmount);
        
        // If healed from 0, remove knocked out status
        if (oldHp === 0 && this.hp > 0) {
            this.statusEffects.removeEffect(StatusEffectType.KnockedOut);
        }
        
        return this.hp - oldHp;
    }
    
    
    defend(): void {
        this.battleActions.defend();
    }
    
    useItem(itemName: string): boolean {
        return this.itemManager.useItem(itemName, this);
    }
    
    attemptStruggle(): boolean {
        return this.battleActions.attemptStruggle();
    }
    
    stayStill(): void {
        this.battleActions.stayStill();
    }
    
    
    
    
    
    startTurn(): void {
        // Call battle actions start turn
        this.battleActions.startTurn();
        
        // Call parent startTurn for MP recovery
        super.startTurn();
    }
    
    // Process all status effects at round end
    processRoundEnd(): string[] {
        const messages: string[] = [];
        
        // Call battle actions round end processing
        const battleMessages = this.battleActions.processRoundEnd();
        messages.push(...battleMessages);
        
        // Call parent processRoundEnd for status effect processing
        const parentMessages = super.processRoundEnd();
        messages.push(...parentMessages);
        
        return messages;
    }

    /**
     * Check if player is defeated
     */
    isDefeated(): boolean {
        // consider player defeated if marked as "dead"
        return this.statusEffects.isDead();
    }
    
    getAvailableSkills(): SkillData[] {
        const unlockedSkills = this.getUnlockedSkills();
        return unlockedSkills.filter(skill => this.canUseSkill(skill));
    }
    
    
    /**
     * Check if a skill can be used
     */
    private canUseSkill(skillData: SkillData): boolean {
        // Basic checks
        if (this.statusEffects.isExhausted()) return false;
        if (!this.statusEffects.canAct()) return false;
        
        // Special state checks
        if (this.isDefeated() || this.statusEffects.isDoomed() || this.statusEffects.isSleeping()) {
            return false;
        }
        
        // Skill-specific checks
        switch (skillData.id) {
            case 'power-attack':
            case 'ultra-smash':
                return true;
            case 'struggle':
                return this.statusEffects.isRestrained() || this.statusEffects.isEaten();
            case 'defend':
                return true;
            case 'stay-still':
                return this.statusEffects.isRestrained() || this.statusEffects.isEaten();
            default:
                return true;
        }
    }
    
    /**
     * Use a skill from the new system
     */
    private useSkillData(skillData: SkillData, target?: Actor): SkillResult {
        const strategy = SkillStrategyFactory.getStrategy(skillData.id);
        if (!strategy) {
            return { success: false, message: 'Unknown skill' };
        }
        
        return strategy.execute(this, skillData, target);
    }
    
    
    useSkill(skillId: string, target?: Actor): SkillResult {
        const skills = this.getAvailableSkills();
        const skill = skills.find(s => s.id === skillId);
        
        if (!skill) {
            return { success: false, message: 'そのスキルは使用できません' };
        }
        
        return this.useSkillData(skill, target);
    }
    
    
    getItemCount(itemName: string): number {
        return this.itemManager.getItemCount(itemName);
    }
    
    getStatusEffectsList(): string[] {
        return this.statusEffects.getAllEffects().map(effect => effect.name);
    }
    
    /**
     * Add combat experience based on damage dealt
     */
    public addCombatExperience(damageDealt: number): void {
        this.progressionManager.addCombatExperience(damageDealt);
    }
    
    /**
     * Get display information for current equipment
     */
    public getEquipmentInfo(): { weapon: Equipment | null; armor: Equipment | null } {
        return this.equipmentManager.getEquipmentInfo();
    }
    
    /**
     * Get current explorer level
     */
    public getExplorerLevel(): number {
        return this.progressionManager.getExplorerLevel();
    }
    
    /**
     * Get accessible terrains based on explorer level
     */
    public getAccessibleTerrains(): string[] {
        return this.progressionManager.getAccessibleTerrains();
    }
    
    /**
     * Get ability levels for display
     */
    public getAbilityLevels(): { [key: string]: { level: number; experience: number; experienceToNext: number } } {
        return this.progressionManager.getAbilityLevels();
    }

    
    /**
     * Check if defend damage should be 100% cut
     */
    public shouldCutDefendDamage(): boolean {
        return this.battleActions.shouldCutDefendDamage();
    }
    
    /**
     * Update player name and icon
     */
    public updatePlayerInfo(name: string, icon: string): void {
        this.name = name;
        this.icon = icon;
        this.displayName = name; // Update Actor's displayName as well
        this.saveToStorage(); // Auto-save changes
    }

    /**
     * Reset battle-specific state while preserving progression
     */
    public resetBattleState(): void {
        // Call battle actions reset
        this.battleActions.resetBattleState();
        
        // Call parent resetBattleState for common processing
        super.resetBattleState();
    }
}
