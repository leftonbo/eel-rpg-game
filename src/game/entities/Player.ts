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


export interface SkillResult {
    success: boolean;
    mpConsumed?: number; // Only for skills that consume MP
    message: string;
    damage?: number; // Only for attack skills
}

// Default player values
export const DEFAULT_PLAYER_NAME = 'エルナル';
export const DEFAULT_PLAYER_ICON = '🐍';

export class Player extends Actor {
    public name: string = DEFAULT_PLAYER_NAME;
    public icon: string = DEFAULT_PLAYER_ICON;
    
    // Base stats (before equipment/abilities)
    public baseMaxHp: number = 100;
    public baseMaxMp: number = 50;
    public baseAttackPower: number = 5;
    
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
        super(DEFAULT_PLAYER_NAME, 100, 5, 50);
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
            console.log('[Player][loadFromSave] Save data found:', saveData);
            
            // Load abilities
            console.log('[Player][loadFromSave] Loading abilities:', saveData.abilities);
            this.abilitySystem.loadFromSaveData(saveData.abilities);
            
            // Load equipment
            console.log('[Player][loadFromSave] Loading equipment:', saveData.equipment);
            this.equipmentManager.loadEquipment(saveData.equipment.weapon, saveData.equipment.armor);
            
            // Load battle memorials into MemorialSystem
            console.log('[Player][loadFromSave] Loading memorials:', saveData.memorials);
            this.memorialSystem.importData(saveData.memorials || {});
            
            // Load player info (name and icon)
            if (saveData.playerInfo) {
                console.log('[Player][loadFromSave] Loading player info:', saveData.playerInfo);
                this.name = saveData.playerInfo.name;
                this.icon = saveData.playerInfo.icon;
                // Update Actor's displayName as well
                this.displayName = saveData.playerInfo.name;
            }
            
            console.log('[Player][loadFromSave] Player data loaded successfully');
        } else {
            console.log('[Player][loadFromSave] No save data found, initializing with defaults');
            // Initialize MemorialSystem with empty data
            this.memorialSystem.initializeData();
        }
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
            version: 4
        };
        
        PlayerSaveManager.savePlayerData(saveData);
    }
    
    /**
     * Recalculate all stats based on abilities and equipment
     */
    public recalculateStats(): void {
        // Calculate HP with toughness bonus and armor
        const toughnessMultiplier = 1 + this.abilitySystem.getToughnessHpBonus();
        const armorBonus = this.equipmentManager.getArmorHpBonus();
        this.maxHp = Math.round((this.baseMaxHp + armorBonus) * toughnessMultiplier);
        
        // Calculate MP with endurance bonus
        const enduranceMultiplier = 1 + this.abilitySystem.getEnduranceMpBonus();
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
        const abilityLevels = new Map<AbilityType, number>();
        Object.values(AbilityType).forEach(type => {
            const ability = this.abilitySystem.getAbility(type);
            abilityLevels.set(type, ability?.level || 0);
        });
        
        const unlockedSkillIds = SkillRegistry.getUnlockedSkills(abilityLevels);
        const skills: SkillData[] = [];
        
        unlockedSkillIds.forEach(skillId => {
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
        const abilityLevels = new Map<AbilityType, number>();
        Object.values(AbilityType).forEach(type => {
            const ability = this.abilitySystem.getAbility(type);
            abilityLevels.set(type, ability?.level || 0);
        });
        
        return SkillRegistry.getUnlockedPassiveSkills(abilityLevels);
    }
    
    /**
     * Check if a specific skill is unlocked (calculated from ability levels)
     */
    public hasSkill(skillId: string): boolean {
        const abilityLevels = new Map<AbilityType, number>();
        Object.values(AbilityType).forEach(type => {
            const ability = this.abilitySystem.getAbility(type);
            abilityLevels.set(type, ability?.level || 0);
        });
        
        const unlockedSkillIds = SkillRegistry.getUnlockedSkills(abilityLevels);
        return unlockedSkillIds.includes(skillId);
    }
    
    getAttackPower(): number {
        // Calculate base attack power with combat ability and weapon
        const combatMultiplier = 1 + this.abilitySystem.getCombatAttackBonus();
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
        const craftworkMultiplier = 1 + this.abilitySystem.getCraftworkHealingBonus();
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
        // Get unlocked skills from SkillRegistry
        const abilityLevels = new Map<AbilityType, number>();
        Object.values(AbilityType).forEach(type => {
            const ability = this.abilitySystem.getAbility(type);
            abilityLevels.set(type, ability?.level || 0);
        });
        
        const unlockedSkills = this.getUnlockedSkills();
        
        // Filter usable skills based on current state
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
