import { StatusEffectType, ActionPriority } from '../systems/StatusEffect';
import { AbilitySystem, AbilityType, Equipment, WEAPONS, ARMORS } from '../systems/AbilitySystem';
import { PlayerSaveManager, PlayerSaveData } from '../systems/PlayerSaveData';
import { updatePlayerItems } from '../data/ExtendedItems';
import { Actor } from './Actor';
import { SkillRegistry, SkillData } from '../data/skills';
import { MemorialSystem } from '../systems/MemorialSystem';

export enum SkillType {
    PowerAttack = 'power-attack',
    Heal = 'heal',
    Struggle = 'struggle',
    GiveUp = 'give-up',
    SubmitToFate = 'submit-to-fate',
    UltraSmash = 'ultra-smash'
}

export interface Skill {
    type: SkillType;
    name: string;
    description: string;
    mpCost: number;
    canUse: (player: Player) => boolean;
    use: (player: Player, target?: Actor) => SkillResult;
    hitRate?: number; // Custom hit rate (0-1)
    criticalRate?: number; // Custom critical hit rate (0-1)
    damageVarianceMin?: number; // Minimum damage variance percentage (default: -20)
    damageVarianceMax?: number; // Maximum damage variance percentage (default: +20)
    priority?: ActionPriority; // Action priority level
}

export interface SkillResult {
    success: boolean;
    mpConsumed?: number; // Only for skills that consume MP
    message: string;
    damage?: number; // Only for attack skills
}

// Default player values
export const DEFAULT_PLAYER_NAME = 'エルナル';
export const DEFAULT_PLAYER_ICON = '🐍';

export interface PlayerItem {
    name: string;
    count: number;
    description: string;
    use: (player: Player) => boolean;
    experienceGain: number; // Experience gain for using the item
}

export class Player extends Actor {
    public name: string = DEFAULT_PLAYER_NAME;
    public icon: string = DEFAULT_PLAYER_ICON;
    
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
    public memorialSystem: MemorialSystem = new MemorialSystem();
    public equippedWeapon: string = 'bare-hands';
    public equippedArmor: string = 'naked';
    
    constructor() {
        super(DEFAULT_PLAYER_NAME, 100, 5, 50);
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
            this.equippedWeapon = saveData.equipment.weapon;
            this.equippedArmor = saveData.equipment.armor;
            
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
            equipment: {
                weapon: this.equippedWeapon,
                armor: this.equippedArmor
            },
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
        const armorBonus = this.getArmorHpBonus();
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
            'ultra-smash': SkillType.UltraSmash,
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
            mpCost: skillData.mpCost,
            priority: skillData.priority,
            hitRate: skillData.hitRate,
            criticalRate: skillData.criticalRate,
            damageVarianceMin: skillData.damageVarianceMin,
            damageVarianceMax: skillData.damageVarianceMax,
            canUse: (player: Player) => this.canUseSkill(skillData, player),
            use: (player: Player, target?: Actor) => this.useSkillData(skillData, player, target)
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
    private useSkillData(skillData: SkillData, player: Player, _target?: Actor): SkillResult {
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
        const mpInsufficient = !player.consumeMp(skillData.mpCost);
        let powerMultiplier = skillData.damageMultiplier || 2.5;
        
        if (mpInsufficient) {
            powerMultiplier *= 2; // Double effect when MP insufficient
        }
        
        const damage = Math.floor(player.getAttackPower() * powerMultiplier);
        return {
            success: true,
            mpConsumed: mpInsufficient ? player.mp : skillData.mpCost,
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
            mpConsumed: mpConsumed,
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
                mpConsumed: mpInsufficient ? player.mp : skillData.mpCost,
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
                mpConsumed: mpInsufficient ? player.mp : skillData.mpCost,
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
    
    useSkill(skillType: SkillType, target?: Actor): SkillResult {
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
     * Get current explorer level
     */
    public getExplorerLevel(): number {
        return this.abilitySystem.getExplorerLevel();
    }
    
    /**
     * Get accessible terrains based on explorer level
     */
    public getAccessibleTerrains(): string[] {
        const level = this.getExplorerLevel();
        
        const terrainMap: { [key: number]: string | string[] } = {
            0: '近隣の地方',
            1: '砂漠',
            2: '海',
            4: 'ジャングル',
            5: '洞窟',
            6: ['遺跡', '廃墟'],
            7: '寒冷地',
            8: '火山',
            9: '天空',
            10: '魔界'
        };
        
        const accessibleTerrains: string[] = [];
        
        for (let i = 0; i <= level; i++) {
            // レベル3はゲストキャラ関係のため表示しない
            if (i === 3) continue;
            
            const terrain = terrainMap[i];
            if (terrain) {
                if (Array.isArray(terrain)) {
                    accessibleTerrains.push(...terrain);
                } else {
                    accessibleTerrains.push(terrain);
                }
            }
        }
        
        return accessibleTerrains.length > 0 ? accessibleTerrains : ['未知の領域'];
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
                    if (!this.isKnockedOut() && !this.isAnyRestrained() && this.hp < this.maxHp) {
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
            const lostMaxHp = this.initialMaxHp - this.maxHp;
            const recoveryAmount = Math.floor(lostMaxHp * 0.2); // 20% of lost max HP
            if (recoveryAmount > 0) {
                const actualHeal = this.gainMaxHp(recoveryAmount);
                if (actualHeal > 0) {
                    messages.push(`${this.name}は拘束からの脱出で${actualHeal}の最大HPを回復した！`);
                }
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
        // Reset battle-specific flags
        this.struggleAttempts = 0;
        this.isDefending = false;
        
        // Call parent resetBattleState for common processing
        super.resetBattleState();
        
        // Note: Keep progression data (abilities, equipment, items) intact
        // Also preserve maxHp changes from abilities/equipment
    }
}
