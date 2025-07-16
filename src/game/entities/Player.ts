import { StatusEffectType, ActionPriority } from '../systems/StatusEffect';
import { AbilitySystem, AbilityType, Equipment, WEAPONS, ARMORS } from '../systems/AbilitySystem';
import { PlayerSaveManager, PlayerSaveData } from '../systems/PlayerSaveData';
import { updatePlayerItems } from '../data/ExtendedItems';
import { Actor } from './Actor';

export enum SkillType {
    PowerAttack = 'power-attack',
    Heal = 'heal',
    Struggle = 'struggle',
    GiveUp = 'give-up'
}

export interface Skill {
    type: SkillType;
    name: string;
    description: string;
    mpCost: number;
    canUse: (player: Player) => boolean;
    use: (player: Player, target?: any) => SkillResult;
    hitRate?: number; // Custom hit rate (0-1)
    criticalRate?: number; // Custom critical hit rate (0-1)
    damageVarianceMin?: number; // Minimum damage variance percentage (default: -20)
    damageVarianceMax?: number; // Maximum damage variance percentage (default: +20)
    priority?: ActionPriority; // Action priority level
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
    
    constructor() {
        super(PLAYER_NAME, 100, 5, 50);
        this.loadFromSave();
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
        } else {
            // Initialize with default values
            this.unlockedItems = new Set();
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
            version: 1
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
    }
    
    private initializeItems(): void {
        // Initialize items based on ability levels
        updatePlayerItems(this);
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
        
        const skills: Skill[] = [
            {
                type: SkillType.PowerAttack,
                name: 'パワーアタック',
                description: '2.5倍の攻撃力で確実に攻撃（20MP）',
                mpCost: 20,
                priority: ActionPriority.NormalAction,
                damageVarianceMin: -0.2,
                damageVarianceMax: 0.5,
                canUse: (player: Player) => !player.statusEffects.isExhausted() && player.statusEffects.canAct(),
                use: (player: Player, _target?: any) => {
                    const mpInsufficient = !player.consumeMp(20);
                    let powerMultiplier = 2.5;
                    
                    if (mpInsufficient) {
                        powerMultiplier = 5.0; // Double effect when MP insufficient
                    }
                    
                    const damage = Math.floor(player.baseAttackPower * powerMultiplier);
                    return {
                        success: true,
                        message: mpInsufficient ? 
                            `${player.name}は最後の力を振り絞ってパワーアタックを放った！` :
                            `${player.name}はパワーアタックを放った！`,
                        damage,
                        mpCost: mpInsufficient ? 0 : 20
                    };
                }
            },
            {
                type: SkillType.Heal,
                name: 'ヒール',
                description: 'HPを100回復（30MP）',
                mpCost: 30,
                priority: ActionPriority.NormalAction,
                canUse: (player: Player) => !player.statusEffects.isExhausted() && player.statusEffects.canAct() && player.hp < player.maxHp,
                use: (player: Player) => {
                    const mpInsufficient = !player.consumeMp(30);
                    let healAmount = 100;
                    
                    if (mpInsufficient) {
                        healAmount = 200; // Double effect when MP insufficient
                    }
                    
                    const actualHeal = player.heal(healAmount);
                    return {
                        success: true,
                        message: mpInsufficient ? 
                            `${player.name}は最後の力でヒールを唱えた！HPが${actualHeal}回復！` :
                            `${player.name}はヒールを唱えた！HPが${actualHeal}回復！`,
                        mpCost: mpInsufficient ? 0 : 30
                    };
                }
            },
            {
                type: SkillType.Struggle,
                name: 'あばれる',
                description: '拘束状態専用：脱出確率2倍（30MP）',
                mpCost: 30,
                priority: ActionPriority.StruggleAction,
                canUse: (player: Player) => !player.statusEffects.isExhausted() && 
                    (player.statusEffects.isRestrained() || player.statusEffects.isEaten()),
                use: (player: Player) => {
                    const mpInsufficient = !player.consumeMp(30);
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
                            mpCost: mpInsufficient ? 0 : 30
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
                            mpCost: mpInsufficient ? 0 : 30
                        };
                    }
                }
            }
        ];
        
        return skills.filter(skill => skill.canUse(this));
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