import { StatusEffectType, ActionPriority } from '../systems/StatusEffect';
import { AbilitySystem, AbilityType, Equipment, WEAPONS, ARMORS } from '../systems/AbilitySystem';
import { PlayerSaveManager, PlayerSaveData } from '../systems/PlayerSaveData';
import { updatePlayerItems } from '../data/ExtendedItems';
import { Actor } from './Actor';
import { SkillRegistry, SkillData } from '../data/skills';
import { Action, ActionTarget, ActionExecutor, ActionResult, DamageParameter, DamageType, TargetStatus, ExtraEffect, AccuracyType } from '../systems/Action';

export enum SkillType {
    PowerAttack = 'power-attack',
    Heal = 'heal',
    Struggle = 'struggle',
    GiveUp = 'give-up',
    SubmitToFate = 'submit-to-fate'
}

export interface Skill {
    type: SkillType;
    name: string;
    description: string;
    mpCost: number;
    canUse: (player: Player) => boolean;
    use: (player: Player, target?: any) => SkillResult;
    priority?: ActionPriority; // Action priority level
    action?: Action; // Action details if applicable
}

export interface SkillResult {
    success: boolean;
    message: string;
    damage?: number; // Only for attack skills
}

// Player name constant for easy modification
export const PLAYER_NAME = 'エルナル';

export interface PlayerItem {
    name: string;
    count: number;
    description: string;
    use: (player: Player) => boolean;
}

export class Player extends Actor {
    public name: string = PLAYER_NAME;
    
    // Base stats (before equipment/abilities)
    public baseMaxHp: number = 100;
    public baseMaxMp: number = 50;
    public baseAttackPower: number = 5;
    
    // Agility experience callback
    public agilityExperienceCallback?: (amount: number) => void;
    public items: Map<string, PlayerItem> = new Map();
    public isDefending: boolean = false;
    public struggleAttempts: number = 0; // For restrain escape probability
    
    // Ability and equipment system
    public abilitySystem: AbilitySystem = new AbilitySystem();
    public equippedWeapon: string = 'bare-hands';
    public equippedArmor: string = 'naked';
    public unlockedItems: Set<string> = new Set();
    public unlockedSkills: Set<string> = new Set();
    
    constructor() {
        super(PLAYER_NAME, 100, 5, 50);
        this.loadFromSave();
        this.initializeDefaultUnlocks();
        this.initializeItems();
        this.recalculateStats();
    }
    
    /**
     * Load player data from localStorage
     */
    private loadFromSave(): void {
        const saveData = PlayerSaveManager.loadPlayerData();
        if (saveData) {
            // Load abilities
            this.abilitySystem.loadFromSaveData(saveData.abilities);
            
            // Load equipment
            this.equippedWeapon = saveData.equipment.weapon;
            this.equippedArmor = saveData.equipment.armor;
            
            // Load unlocked items
            this.unlockedItems = new Set(saveData.unlockedItems);
            
            // Load unlocked skills
            this.unlockedSkills = new Set(saveData.unlockedSkills || []);
        } else {
            // Initialize with default values
            this.unlockedItems = new Set();
            this.unlockedSkills = new Set();
        }
    }
    
    /**
     * Save player data to localStorage
     */
    public saveToStorage(): void {
        const saveData: PlayerSaveData = {
            abilities: this.abilitySystem.exportForSave(),
            equipment: {
                weapon: this.equippedWeapon,
                armor: this.equippedArmor
            },
            unlockedItems: Array.from(this.unlockedItems),
            unlockedSkills: Array.from(this.unlockedSkills),
            version: 2
        };
        
        PlayerSaveManager.savePlayerData(saveData);
    }
    
    /**
     * Recalculate all stats based on abilities and equipment
     */
    public recalculateStats(): void {
        // Calculate HP with toughness bonus and armor
        const toughnessMultiplier = 1 + this.abilitySystem.getToughnessHpBonus();
        const armorBonus = this.getArmorHpBonus();
        this.maxHp = Math.round(this.baseMaxHp * toughnessMultiplier) + armorBonus;
        
        // Calculate MP with endurance bonus
        const enduranceMultiplier = 1 + this.abilitySystem.getEnduranceMpBonus();
        this.maxMp = Math.round(this.baseMaxMp * enduranceMultiplier);
        
        // Update items based on new ability levels
        updatePlayerItems(this);
        
        // Update unlocked skills based on ability levels
        this.updateUnlockedSkills();
    }
    
    /**
     * Initialize default unlocks for basic skills and items
     */
    private initializeDefaultUnlocks(): void {
        // Always unlock basic attack (no skill unlocks needed for basic actions)
        // Power attack and other skills will be unlocked via ability levels
        
        // Always unlock basic heal potion
        this.unlockedItems.add('heal-potion');
        
        // Save if new unlocks were added
        this.saveToStorage();
    }
    
    private initializeItems(): void {
        // Initialize items based on ability levels
        updatePlayerItems(this);
    }
    
    /**
     * Update unlocked skills based on current ability levels
     */
    private updateUnlockedSkills(): void {
        const abilityLevels = new Map<AbilityType, number>();
        Object.values(AbilityType).forEach(type => {
            const ability = this.abilitySystem.getAbility(type);
            abilityLevels.set(type, ability?.level || 0);
        });
        
        const availableSkills = SkillRegistry.getUnlockedSkills(abilityLevels);
        const previousSize = this.unlockedSkills.size;
        
        this.unlockedSkills = new Set(availableSkills);
        
        // Save if new skills were unlocked
        if (this.unlockedSkills.size > previousSize) {
            this.saveToStorage();
        }
    }
    
    /**
     * Get all unlocked skills with their current stats
     */
    public getUnlockedSkills(): SkillData[] {
        const abilityLevels = new Map<AbilityType, number>();
        Object.values(AbilityType).forEach(type => {
            const ability = this.abilitySystem.getAbility(type);
            abilityLevels.set(type, ability?.level || 0);
        });
        
        const skills: SkillData[] = [];
        this.unlockedSkills.forEach(skillId => {
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
     * Check if a specific skill is unlocked
     */
    public hasSkill(skillId: string): boolean {
        return this.unlockedSkills.has(skillId);
    }
    
    getAttackPower(): number {
        // Calculate base attack power with combat ability and weapon
        const combatMultiplier = 1 + this.abilitySystem.getCombatAttackBonus();
        const weaponBonus = this.getWeaponAttackBonus();
        const baseWithAbilityAndWeapon = (this.baseAttackPower + weaponBonus) * combatMultiplier;
        
        // Apply status effect modifiers
        const statusModifier = this.statusEffects.getAttackModifier();
        return Math.round(baseWithAbilityAndWeapon * statusModifier);
    }
    
    /**
     * Get weapon attack bonus from equipped weapon
     */
    public getWeaponAttackBonus(): number {
        const weapon = WEAPONS.find(w => w.id === this.equippedWeapon);
        return weapon?.attackPowerBonus || 0;
    }
    
    /**
     * Get armor HP bonus from equipped armor
     */
    public getArmorHpBonus(): number {
        const armor = ARMORS.find(a => a.id === this.equippedArmor);
        return armor?.hpBonus || 0;
    }
    
    /**
     * Equip a weapon (if unlocked)
     */
    public equipWeapon(weaponId: string): boolean {
        const weapon = WEAPONS.find(w => w.id === weaponId);
        if (!weapon) return false;
        
        const combatLevel = this.abilitySystem.getAbility(AbilityType.Combat)?.level || 0;
        if (combatLevel < weapon.requiredLevel) return false;
        
        this.equippedWeapon = weaponId;
        this.recalculateStats();
        return true;
    }
    
    /**
     * Equip armor (if unlocked)
     */
    public equipArmor(armorId: string): boolean {
        const armor = ARMORS.find(a => a.id === armorId);
        if (!armor) return false;
        
        const toughnessLevel = this.abilitySystem.getAbility(AbilityType.Toughness)?.level || 0;
        if (toughnessLevel < armor.requiredLevel) return false;
        
        this.equippedArmor = armorId;
        this.recalculateStats();
        return true;
    }
    
    /**
     * Get available weapons based on combat level
     */
    public getAvailableWeapons(): Equipment[] {
        const combatLevel = this.abilitySystem.getAbility(AbilityType.Combat)?.level || 0;
        return WEAPONS.filter(weapon => weapon.requiredLevel <= combatLevel);
    }
    
    /**
     * Get available armors based on toughness level
     */
    public getAvailableArmors(): Equipment[] {
        const toughnessLevel = this.abilitySystem.getAbility(AbilityType.Toughness)?.level || 0;
        return ARMORS.filter(armor => armor.requiredLevel <= toughnessLevel);
    }
    
    /**
     * Add experience to an ability
     */
    public addExperience(abilityType: AbilityType, amount: number): { leveledUp: boolean; newLevel: number; previousLevel: number } {
        const result = this.abilitySystem.addExperience(abilityType, amount);
        
        if (result.leveledUp) {
            this.recalculateStats();
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
        this.isDefending = true;
        this.statusEffects.addEffect(StatusEffectType.Defending);
    }
    
    useItem(itemName: string): boolean {
        const item = this.items.get(itemName);
        if (!item || item.count <= 0) return false;
        
        return item.use(this);
    }
    
    attemptStruggle(): boolean {
        if (!this.statusEffects.isRestrained() && !this.statusEffects.isEaten() && !this.statusEffects.isCocoon()) {
            return false;
        }
        
        this.struggleAttempts++;
        
        // Base success rate starts at 30% and increases by 20% each attempt
        let baseSuccessRate = 0.3 + (this.struggleAttempts - 1) * 0.2;
        baseSuccessRate = Math.min(baseSuccessRate, 0.9); // Cap at 90%
        
        // Apply agility bonus
        const agilityBonus = this.abilitySystem.getAgilityEscapeBonus();
        baseSuccessRate += agilityBonus;
        
        // Apply charm modifier
        const modifier = this.statusEffects.getStruggleModifier();
        const finalSuccessRate = baseSuccessRate * modifier;
        
        const success = Math.random() < finalSuccessRate;
        
        if (success) {
            // Reset struggle attempts
            this.struggleAttempts = 0;
            
            // Remove restrained, eaten, or cocoon status
            this.statusEffects.removeEffect(StatusEffectType.Restrained);
            this.statusEffects.removeEffect(StatusEffectType.Eaten);
            this.statusEffects.removeEffect(StatusEffectType.Cocoon);
            
            // Apply escape recovery passive skill
            this.applyEscapeRecovery();
            
            // Notify agility experience for successful escape
            if (this.agilityExperienceCallback) {
                this.agilityExperienceCallback(50);
            }
            
            return true;
        }
        
        // Notify agility experience for failed escape (2x amount)
        if (this.agilityExperienceCallback) {
            this.agilityExperienceCallback(100);
        }
        
        return false;
    }
    
    stayStill(): void {
        // Staying still provides a small amount of healing
        const healAmount = Math.floor(this.maxHp * 0.05); // 5% of max health
        this.heal(healAmount);
        
        // Also recover a small amount of MP
        const mpRecovery = Math.floor(this.maxMp * 0.25); // 25% of max MP
        this.recoverMp(mpRecovery);
    }
    
    
    recoverFromKnockOut(): string[] {
        const messages: string[] = [];
        
        if (this.statusEffects.hasEffect(StatusEffectType.KnockedOut)) {
            // Check if knock out duration is over
            const knockOutEffect = this.statusEffects.getEffect(StatusEffectType.KnockedOut);
            if (knockOutEffect && knockOutEffect.duration <= 1) {
                this.statusEffects.removeEffect(StatusEffectType.KnockedOut);
                
                // Recover 50% health
                const healAmount = Math.floor(this.maxHp * 0.5);
                this.heal(healAmount);
                
                messages.push(`${this.name}が意識を取り戻した！`);
                messages.push(`ヘルスが${healAmount}回復した！`);
            }
        }
        
        return messages;
    }
    
    
    
    startTurn(): void {
        // Reset defending status
        this.isDefending = false;
        
        // Call parent startTurn for MP recovery
        super.startTurn();
        
        // Check exhausted recovery
        const recoveryMessages = this.checkExhaustedRecovery();
        if (recoveryMessages.length > 0) {
            // This could be handled by the game to display messages
        }
    }
    
    // Process all status effects at round end
    processRoundEnd(): string[] {
        const messages: string[] = [];
        
        // Check for knock out recovery before decreasing durations
        const recoveryMessages = this.recoverFromKnockOut();
        messages.push(...recoveryMessages);
        
        // Apply passive skill effects
        const passiveMessages = this.applyPassiveSkills();
        messages.push(...passiveMessages);
        
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
    
    getAvailableSkills(): Skill[] {
        // If in defeat state, only allow submit to fate action
        if (this.isDefeated()) {
            return [{
                type: SkillType.SubmitToFate,
                name: '☠なすがまま',
                description: '......',
                mpCost: 0,
                priority: ActionPriority.CannotAct,
                canUse: () => true,
                use: (_player: Player) => {
                    return {
                        success: true,
                        message: '......',
                    };
                }
            }];
        }
        
        // If doomed, only allow give up action
        if (this.statusEffects.isDoomed()) {
            return [{
                type: SkillType.GiveUp,
                name: '☠なすがまま',
                description: '再起不能でもう行動できない',
                mpCost: 0,
                priority: ActionPriority.CannotAct,
                canUse: () => true,
                use: (player: Player) => {
                    return {
                        success: true,
                        message: `${player.name}はもう何もできない...`,
                    };
                }
            }];
        }
        
        // If sleeping, only allow give up action
        if (this.statusEffects.isSleeping()) {
            return [{
                type: SkillType.GiveUp,
                name: '😴なすがまま',
                description: '深い眠りに落ちて行動できない',
                mpCost: 0,
                priority: ActionPriority.CannotAct,
                canUse: () => true,
                use: (player: Player) => {
                    return {
                        success: true,
                        message: `${player.name}は深く眠っており何もできない...`,
                    };
                }
            }];
        }
        
        // Get unlocked skills from new system
        const unlockedSkills = this.getUnlockedSkills();
        const skills: Skill[] = [];
        
        // Convert new skill system to old skill interface for compatibility
        unlockedSkills.forEach(skillData => {
            const skill = this.convertSkillDataToSkill(skillData);
            if (skill) {
                skills.push(skill);
            }
        });
        
        return skills.filter(skill => skill.canUse(this));
    }
    
    /**
     * Convert new SkillData to old Skill interface for compatibility
     */
    private convertSkillDataToSkill(skillData: SkillData): Skill | null {
        // Map skill IDs to SkillType
        const skillTypeMap: { [key: string]: SkillType } = {
            'power-attack': SkillType.PowerAttack,
            'ultra-smash': SkillType.PowerAttack, // Temporary mapping
            'struggle': SkillType.Struggle,
            'defend': SkillType.PowerAttack, // Temporary mapping
            'stay-still': SkillType.PowerAttack // Temporary mapping
        };
        
        const skillType = skillTypeMap[skillData.id];
        if (!skillType) return null;
        
        return {
            type: skillType,
            name: skillData.name,
            description: skillData.description,
            mpCost: skillData.mpCost || 0,
            priority: skillData.priority,
            canUse: (player: Player) => this.canUseSkill(skillData, player),
            use: (player: Player, target?: any) => this.useSkillData(skillData, player, target),
            action: skillData.action
        };
    }
    
    /**
     * Check if a skill can be used
     */
    private canUseSkill(skillData: SkillData, player: Player): boolean {
        // Basic checks
        if (player.statusEffects.isExhausted()) return false;
        if (!player.statusEffects.canAct()) return false;
        
        // Skill-specific checks
        switch (skillData.id) {
            case 'power-attack':
            case 'ultra-smash':
                return true;
            case 'struggle':
                return player.statusEffects.isRestrained() || player.statusEffects.isEaten();
            case 'defend':
                return true;
            case 'stay-still':
                return player.statusEffects.isRestrained() || player.statusEffects.isEaten();
            default:
                return true;
        }
    }
    
    /**
     * Use a skill from the new system
     */
    private useSkillData(skillData: SkillData, player: Player, _target?: any): SkillResult {
        switch (skillData.id) {
            case 'power-attack':
                return this.usePowerAttack(skillData, player);
            case 'ultra-smash':
                return this.useUltraSmash(skillData, player);
            case 'struggle':
                return this.useStruggleSkill(skillData, player);
            case 'defend':
                return this.useDefend(skillData, player);
            case 'stay-still':
                return this.useStayStill(skillData, player);
            default:
                return { success: false, message: 'Unknown skill' };
        }
    }
    
    /**
     * Use Power Attack skill
     */
    private usePowerAttack(skillData: SkillData, player: Player): SkillResult {
        const mpInsufficient = !player.consumeMp(skillData.mpCost || 0);
        let powerMultiplier = skillData.damageMultiplier || 2.5;
        
        if (mpInsufficient) {
            powerMultiplier *= 2; // Double effect when MP insufficient
        }
        
        const damage = Math.floor(player.getAttackPower() * powerMultiplier);
        return {
            success: true,
            message: mpInsufficient ? 
                `${player.name}は最後の力を振り絞って${skillData.name}を放った！` :
                `${player.name}は${skillData.name}を放った！`,
            damage
        };
    }
    
    /**
     * Use Ultra Smash skill
     */
    private useUltraSmash(skillData: SkillData, player: Player): SkillResult {
        const mpConsumed = player.mp;
        player.mp = 0; // Consume all MP
        
        const baseDamage = player.getAttackPower();
        const mpDamage = mpConsumed;
        const totalDamage = baseDamage + mpDamage;
        
        // Add exhaustion effect
        player.statusEffects.addEffect(StatusEffectType.Exhausted);
        
        return {
            success: true,
            message: `${player.name}は${skillData.name}を放った！（消費MP: ${mpConsumed}）`,
            damage: totalDamage
        };
    }
    
    /**
     * Use Struggle skill
     */
    private useStruggleSkill(skillData: SkillData, player: Player): SkillResult {
        const mpInsufficient = !player.consumeMp(skillData.mpCost);
        let successMultiplier = 2;
        
        if (mpInsufficient) {
            successMultiplier = 4; // Double effect when MP insufficient
        }
        
        // Calculate enhanced struggle success rate
        let baseSuccessRate = 0.3 + (player.struggleAttempts) * 0.2;
        baseSuccessRate = Math.min(baseSuccessRate, 1.0);
        
        // Apply agility bonus
        const agilityBonus = player.abilitySystem.getAgilityEscapeBonus();
        baseSuccessRate += agilityBonus;
        
        const modifier = player.statusEffects.getStruggleModifier();
        let finalSuccessRate = baseSuccessRate * modifier * successMultiplier;
        finalSuccessRate = Math.min(finalSuccessRate, 1.0);
        
        const success = Math.random() < finalSuccessRate;
        player.struggleAttempts++;
        
        // Check if agility level 5+ for damage dealing
        const agilityLevel = player.abilitySystem.getAbility(AbilityType.Agility)?.level || 0;
        let damageDealt = 0;
        if (agilityLevel >= 5) {
            damageDealt = Math.floor(player.getAttackPower() * 1.5);
        }
        
        if (success) {
            player.struggleAttempts = 0;
            player.statusEffects.removeEffect(StatusEffectType.Restrained);
            player.statusEffects.removeEffect(StatusEffectType.Eaten);
            
            // Notify agility experience for successful escape
            if (player.agilityExperienceCallback) {
                player.agilityExperienceCallback(100);
            }
            
            return {
                success: true,
                message: mpInsufficient ? 
                    `${player.name}は最後の力で激しくあばれた！拘束から脱出した！` :
                    `${player.name}は激しくあばれた！拘束から脱出した！`,
                damage: damageDealt
            };
        } else {
            // Increase future struggle success significantly on failure
            player.struggleAttempts += mpInsufficient ? 8 : 4;
            
            // Notify agility experience for failed escape (2x amount)
            if (player.agilityExperienceCallback) {
                player.agilityExperienceCallback(400);
            }
            
            return {
                success: false,
                message: mpInsufficient ? 
                    `${player.name}は最後の力であばれたが、脱出できなかった...しかし次回の成功率が大幅に上がった！` :
                    `${player.name}があばれたが、脱出できなかった...次回の成功率が上がった！`,
                damage: damageDealt
            };
        }
    }
    
    /**
     * Use Defend skill
     */
    private useDefend(skillData: SkillData, player: Player): SkillResult {
        player.defend();
        
        // Check if endurance level 3+ for MP recovery
        const enduranceLevel = player.abilitySystem.getAbility(AbilityType.Endurance)?.level || 0;
        if (enduranceLevel >= 3) {
            player.mp = player.maxMp;
        }
        
        return {
            success: true,
            message: `${player.name}は${skillData.name}の構えを取った！`
        };
    }
    
    /**
     * Use Stay Still skill
     */
    private useStayStill(skillData: SkillData, player: Player): SkillResult {
        player.stayStill();
        
        // Check if endurance level 3+ for MP recovery
        const enduranceLevel = player.abilitySystem.getAbility(AbilityType.Endurance)?.level || 0;
        if (enduranceLevel >= 3) {
            player.mp = player.maxMp;
        }
        
        return {
            success: true,
            message: `${player.name}は${skillData.name}して体力を回復した！`
        };
    }
    
    useSkill(skillType: SkillType, target?: any): SkillResult {
        const skills = this.getAvailableSkills();
        const skill = skills.find(s => s.type === skillType);
        
        if (!skill) {
            return { success: false, message: 'そのスキルは使用できません' };
        }
        
        return skill.use(this, target);
    }
    
    checkExhaustedRecovery(): string[] {
        const messages: string[] = [];
        
        if (this.statusEffects.isExhausted()) {
            // Check if MP is full or 4 turns have passed
            const exhaustedEffect = this.statusEffects.getEffect(StatusEffectType.Exhausted);
            if (this.mp >= this.maxMp || (exhaustedEffect && exhaustedEffect.duration <= 1)) {
                this.statusEffects.removeEffect(StatusEffectType.Exhausted);
                messages.push(`${this.name}の疲れが回復した！`);
            }
        }
        
        return messages;
    }
    
    getItemCount(itemName: string): number {
        const item = this.items.get(itemName);
        return item ? item.count : 0;
    }
    
    getStatusEffectsList(): string[] {
        return this.statusEffects.getAllEffects().map(effect => effect.name);
    }
    
    /**
     * Add combat experience based on damage dealt
     */
    public addCombatExperience(damageDealt: number): void {
        this.addExperience(AbilityType.Combat, damageDealt);
    }
    
    /**
     * Get display information for current equipment
     */
    public getEquipmentInfo(): { weapon: Equipment | null; armor: Equipment | null } {
        const weapon = WEAPONS.find(w => w.id === this.equippedWeapon) || null;
        const armor = ARMORS.find(a => a.id === this.equippedArmor) || null;
        return { weapon, armor };
    }
    
    /**
     * Get ability levels for display
     */
    public getAbilityLevels(): { [key: string]: { level: number; experience: number; experienceToNext: number } } {
        const result: { [key: string]: { level: number; experience: number; experienceToNext: number } } = {};
        
        Object.values(AbilityType).forEach(type => {
            const ability = this.abilitySystem.getAbility(type);
            if (ability) {
                result[type] = {
                    level: ability.level,
                    experience: ability.experience,
                    experienceToNext: this.abilitySystem.getExperienceToNextLevel(type)
                };
            }
        });
        
        return result;
    }

    /**
     * Apply passive skill effects
     */
    private applyPassiveSkills(): string[] {
        const messages: string[] = [];
        const passiveSkills = this.getUnlockedPassiveSkills();
        
        passiveSkills.forEach(skill => {
            switch (skill.passiveEffect) {
                case 'regeneration':
                    const healAmount = Math.max(1, Math.round(this.maxHp / 50));
                    if (!this.isKnockedOut() && this.hp < this.maxHp) {
                        this.heal(healAmount);
                    }
                    break;
                // Other passive effects will be handled in specific situations
            }
        });
        
        return messages;
    }
    
    /**
     * Apply escape recovery passive skill
     */
    public applyEscapeRecovery(): string[] {
        const messages: string[] = [];
        const passiveSkills = this.getUnlockedPassiveSkills();
        
        const hasEscapeRecovery = passiveSkills.some(skill => skill.passiveEffect === 'escape-recovery');
        if (hasEscapeRecovery) {
            const lostHp = this.maxHp - this.hp;
            const recoveryAmount = Math.floor(lostHp * 0.5);
            if (recoveryAmount > 0) {
                const actualHeal = this.heal(recoveryAmount);
                messages.push(`${this.name}は脱出回復でHPが${actualHeal}回復した！`);
            }
        }
        
        return messages;
    }
    
    /**
     * Check if defend damage should be 100% cut
     */
    public shouldCutDefendDamage(): boolean {
        const toughnessLevel = this.abilitySystem.getAbility(AbilityType.Toughness)?.level || 0;
        return toughnessLevel >= 7;
    }
    
    /**
     * Reset battle-specific state while preserving progression
     */
    public resetBattleState(): void {
        // Reset battle-specific flags
        this.struggleAttempts = 0;
        this.isDefending = false;
        
        // Call parent resetBattleState for common processing
        super.resetBattleState();
        
        // Note: Keep progression data (abilities, equipment, items) intact
        // Also preserve maxHp changes from abilities/equipment
    }

    /**
     * 基本攻撃の Action を作成
     */
    public createBasicAttackAction(): Action {
        const damageParams: DamageParameter[] = [{
            targetStatus: TargetStatus.HP,
            type: DamageType.Damage,
            formula: ActionExecutor.defaultDamageFormula,
            fluctuation: 0.2
        }];

        return new Action(
            '攻撃',
            '基本的な物理攻撃',
            ActionTarget.Enemy,
            0, // MP cost
            [`<USER>の攻撃！`],
            1, // repeat count
            1.0, // accuracy
            AccuracyType.Evade, // accuracy type
            0.05, // critical rate
            damageParams
        );
    }

    /**
     * SkillData を Action に変換
     */
    public convertSkillDataToAction(skillData: SkillData, _target: Actor): Action {
        const damageParams: DamageParameter[] = [];

        // スキルの種類に応じてダメージパラメータを設定
        switch (skillData.id) {
            case 'power-attack':
            case 'ultra-smash':
                damageParams.push({
                    targetStatus: TargetStatus.HP,
                    type: DamageType.Damage,
                    formula: (user: Actor, target: Actor, userMult: number, targetMult: number) => {
                        const multiplier = skillData.damageMultiplier || 2.5;
                        return user.attackPower * multiplier * userMult - target.defense * targetMult;
                    },
                    fluctuation: 0.2
                });
                break;
            case 'defend':
            case 'stay-still':
                // 防御やじっとするスキルは回復効果
                damageParams.push({
                    targetStatus: TargetStatus.HP,
                    type: DamageType.Heal,
                    formula: (_user: Actor, target: Actor, userMult: number, _targetMult: number) => {
                        return Math.floor(target.maxHp * 0.05) * userMult; // 5% 回復
                    }
                });
                break;
        }

        const extraEffects: ExtraEffect[] = [];
        
        // カスタム関数を使用して特殊効果を実装
        let customFunction: ((user: Actor, target: Actor, result: any) => any) | undefined;

        switch (skillData.id) {
            case 'struggle':
                customFunction = (user: Actor, _target: Actor, result: any) => {
                    // もがく処理のカスタムロジック
                    if (user.statusEffects.isRestrained() || user.statusEffects.isEaten() && user instanceof Player) {
                        const success = (user as Player).attemptStruggle();
                        if (success) {
                            result.targetAddStates = result.targetAddStates || [];
                            // 拘束解除の効果はattemptStruggleで処理される
                        }
                    }
                    return result;
                };
                break;
            case 'defend':
                customFunction = (user: Actor, _target: Actor, result: any) => {
                    if (user instanceof Player) {
                        (user as Player).defend();
                        const enduranceLevel = (user as Player).abilitySystem.getAbility(AbilityType.Endurance)?.level || 0;
                        if (enduranceLevel >= 3) {
                            user.mp = user.maxMp;
                        }
                    }
                    return result;
                };
                break;
        }

        return new Action(
            skillData.name,
            skillData.description,
            ActionTarget.Enemy, // 大部分のスキルは敵対象
            skillData.mpCost,
            [`${this.name}は${skillData.name}を使った！`],
            1, // repeat count
            skillData.hitRate || 1.0,
            undefined, // accuracy type (default fixed)
            skillData.criticalRate || 0.05,
            damageParams,
            extraEffects,
            customFunction
        );
    }

    /**
     * Action を実行（新しい統一システム）
     */
    public executeAction(action: Action, target: Actor): ActionResult {
        return ActionExecutor.execute(action, this, target);
    }

    /**
     * 利用可能なスキルを Action として取得
     */
    public getAvailableActionsForBattle(target: Actor): Action[] {
        const actions: Action[] = [];

        // 基本攻撃は常に利用可能
        actions.push(this.createBasicAttackAction());

        // 状態に応じたスキル取得
        if (this.isDefeated()) {
            // 敗北状態では何もできない
            return [];
        }

        if (this.statusEffects.isDoomed() || this.statusEffects.isSleeping()) {
            // 特定の状態では行動不能
            return [];
        }

        // 利用可能なスキルを Action に変換
        const unlockedSkills = this.getUnlockedSkills();
        for (const skillData of unlockedSkills) {
            if (this.canUseSkill(skillData, this)) {
                actions.push(this.convertSkillDataToAction(skillData, target));
            }
        }

        return actions;
    }
}