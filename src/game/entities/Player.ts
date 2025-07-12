import { StatusEffectManager, StatusEffectType } from '../systems/StatusEffect';
import { AbilitySystem, AbilityType, Equipment, WEAPONS, ARMORS } from '../systems/AbilitySystem';
import { PlayerSaveManager, PlayerSaveData } from '../systems/PlayerSaveData';
import { updatePlayerItems } from '../data/ExtendedItems';

export enum SkillType {
    PowerAttack = 'power-attack',
    Heal = 'heal',
    Struggle = 'struggle'
}

export interface Skill {
    type: SkillType;
    name: string;
    description: string;
    mpCost: number;
    canUse: (player: Player) => boolean;
    use: (player: Player, target?: any) => { success: boolean; message: string; damage?: number };
}

// Player name constant for easy modification
export const PLAYER_NAME = 'エルナル';

export interface PlayerItem {
    name: string;
    count: number;
    description: string;
    use: (player: Player) => boolean;
}

export class Player {
    public name: string = PLAYER_NAME;
    
    // Base stats (before equipment/abilities)
    public baseMaxHp: number = 100;
    public baseMaxMp: number = 40;
    public baseAttackPower: number = 5;
    
    // Current stats (calculated with equipment/abilities)
    public maxHp: number = 100;
    public hp: number = 100;
    public maxMp: number = 40;
    public mp: number = 40;
    
    public statusEffects: StatusEffectManager = new StatusEffectManager();
    public items: Map<string, PlayerItem> = new Map();
    public isDefending: boolean = false;
    public struggleAttempts: number = 0; // For restrain escape probability
    
    // Ability and equipment system
    public abilitySystem: AbilitySystem = new AbilitySystem();
    public equippedWeapon: string = 'bare-hands';
    public equippedArmor: string = 'naked';
    public unlockedItems: Set<string> = new Set();
    
    constructor() {
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
            this.unlockedItems = new Set(['heal-potion', 'adrenaline', 'energy-drink']);
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
        
        // Ensure current HP doesn't exceed new max HP
        if (this.hp > this.maxHp) {
            this.hp = this.maxHp;
        }
        
        // Calculate MP with endurance bonus
        const enduranceMultiplier = 1 + this.abilitySystem.getEnduranceMpBonus();
        this.maxMp = Math.round(this.baseMaxMp * enduranceMultiplier);
        
        // Ensure current MP doesn't exceed new max MP
        if (this.mp > this.maxMp) {
            this.mp = this.maxMp;
        }
        
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
        PlayerSaveManager.saveEquipment(this.equippedWeapon, this.equippedArmor);
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
        PlayerSaveManager.saveEquipment(this.equippedWeapon, this.equippedArmor);
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
    
    takeDamage(amount: number): number {
        if (amount <= 0) return 0;
        
        const modifier = this.statusEffects.getDamageModifier();
        const actualDamage = Math.floor(amount * modifier);
        
        this.hp = Math.max(0, this.hp - actualDamage);
        
        // If health reaches 0, apply knocked out status
        if (this.hp === 0 && !this.statusEffects.hasEffect(StatusEffectType.KnockedOut)) {
            this.statusEffects.addEffect(StatusEffectType.KnockedOut);
        }
        
        return actualDamage;
    }
    
    heal(amount: number): number {
        if (amount <= 0) return 0;
        
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
        if (!this.statusEffects.isRestrained() && !this.statusEffects.isEaten()) {
            return false;
        }
        
        this.struggleAttempts++;
        
        // Base success rate starts at 30% and increases by 20% each attempt
        let baseSuccessRate = 0.3 + (this.struggleAttempts - 1) * 0.2;
        baseSuccessRate = Math.min(baseSuccessRate, 0.9); // Cap at 90%
        
        // Apply charm modifier
        const modifier = this.statusEffects.getStruggleModifier();
        const finalSuccessRate = baseSuccessRate * modifier;
        
        const success = Math.random() < finalSuccessRate;
        
        if (success) {
            // Reset struggle attempts
            this.struggleAttempts = 0;
            
            // Remove restrained or eaten status
            this.statusEffects.removeEffect(StatusEffectType.Restrained);
            this.statusEffects.removeEffect(StatusEffectType.Eaten);
            
            return true;
        }
        
        return false;
    }
    
    stayStill(): void {
        // Staying still provides a small amount of healing
        const healAmount = Math.floor(this.maxHp * 0.05); // 5% of max health
        this.heal(healAmount);
    }
    
    loseMaxHp(amount: number): void {
        this.maxHp = Math.max(0, this.maxHp - amount);
        
        // If current health exceeds new max health, reduce it
        if (this.hp > this.maxHp) {
            this.hp = this.maxHp;
        }
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
                
                messages.push(`${PLAYER_NAME}が意識を取り戻した！`);
                messages.push(`ヘルスが${healAmount}回復した！`);
            }
        }
        
        return messages;
    }
    
    canAct(): boolean {
        return this.statusEffects.canAct();
    }
    
    isRestrained(): boolean {
        return this.statusEffects.isRestrained();
    }
    
    isEaten(): boolean {
        return this.statusEffects.isEaten();
    }
    
    isKnockedOut(): boolean {
        return this.statusEffects.isKnockedOut();
    }
    
    isDead(): boolean {
        return this.maxHp <= 0;
    }
    
    startTurn(): void {
        // Reset defending status
        this.isDefending = false;
        
        // Recover MP (1/4 of max MP) at start of turn, unless eaten
        if (!this.statusEffects.isEaten()) {
            const mpRecovery = Math.floor(this.maxMp / 4);
            this.recoverMp(mpRecovery);
        }
        
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
        
        // Apply status effect damages/effects
        const effectMessages = this.statusEffects.applyEffects(this);
        messages.push(...effectMessages);
        
        // Decrease durations and remove expired effects
        const durationMessages = this.statusEffects.decreaseDurations(this);
        messages.push(...durationMessages);
        
        return messages;
    }
    
    getHpPercentage(): number {
        return this.maxHp > 0 ? (this.hp / this.maxHp) * 100 : 0;
    }
    
    getMpPercentage(): number {
        return this.maxMp > 0 ? (this.mp / this.maxMp) * 100 : 0;
    }
    
    consumeMp(amount: number): boolean {
        if (this.mp >= amount) {
            this.mp -= amount;
            return true;
        }
        return false;
    }
    
    recoverMp(amount: number): number {
        if (amount <= 0) return 0;
        
        const oldMp = this.mp;
        this.mp = Math.min(this.maxMp, this.mp + amount);
        return this.mp - oldMp;
    }
    
    loseMp(amount: number): number {
        if (amount <= 0) return 0;
        
        const oldMp = this.mp;
        this.mp = Math.max(0, this.mp - amount);
        return oldMp - this.mp;
    }
    
    getAvailableSkills(): Skill[] {
        const skills: Skill[] = [
            {
                type: SkillType.PowerAttack,
                name: 'パワーアタック',
                description: '2.5倍の攻撃力で確実に攻撃（20MP）',
                mpCost: 20,
                canUse: (player: Player) => !player.statusEffects.isExhausted() && player.statusEffects.canAct(),
                use: (player: Player, _target?: any) => {
                    const mpInsufficient = player.mp < 20;
                    let powerMultiplier = 2.5;
                    
                    if (mpInsufficient) {
                        powerMultiplier = 5.0; // Double effect when MP insufficient
                        player.statusEffects.addEffect(StatusEffectType.Exhausted);
                    } else {
                        player.consumeMp(20);
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
                canUse: (player: Player) => !player.statusEffects.isExhausted() && player.statusEffects.canAct() && player.hp < player.maxHp,
                use: (player: Player) => {
                    const mpInsufficient = player.mp < 30;
                    let healAmount = 100;
                    
                    if (mpInsufficient) {
                        healAmount = 200; // Double effect when MP insufficient
                        player.statusEffects.addEffect(StatusEffectType.Exhausted);
                    } else {
                        player.consumeMp(30);
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
                canUse: (player: Player) => !player.statusEffects.isExhausted() && 
                    (player.statusEffects.isRestrained() || player.statusEffects.isEaten()),
                use: (player: Player) => {
                    const mpInsufficient = player.mp < 30;
                    let successMultiplier = 2;
                    
                    if (mpInsufficient) {
                        successMultiplier = 4; // Double effect when MP insufficient
                        player.statusEffects.addEffect(StatusEffectType.Exhausted);
                    } else {
                        player.consumeMp(30);
                    }
                    
                    // Calculate enhanced struggle success rate
                    let baseSuccessRate = 0.3 + (player.struggleAttempts) * 0.2;
                    baseSuccessRate = Math.min(baseSuccessRate, 0.9);
                    
                    const modifier = player.statusEffects.getStruggleModifier();
                    let finalSuccessRate = baseSuccessRate * modifier * successMultiplier;
                    finalSuccessRate = Math.min(finalSuccessRate, 0.95); // Cap at 95%
                    
                    const success = Math.random() < finalSuccessRate;
                    player.struggleAttempts++;
                    
                    if (success) {
                        player.struggleAttempts = 0;
                        player.statusEffects.removeEffect(StatusEffectType.Restrained);
                        player.statusEffects.removeEffect(StatusEffectType.Eaten);
                        
                        return {
                            success: true,
                            message: mpInsufficient ? 
                                `${player.name}は最後の力で激しくあばれた！拘束から脱出した！` :
                                `${player.name}は激しくあばれた！拘束から脱出した！`,
                            mpCost: mpInsufficient ? 0 : 30
                        };
                    } else {
                        // Increase future struggle success significantly on failure
                        player.struggleAttempts += mpInsufficient ? 2 : 1;
                        
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
    
    useSkill(skillType: SkillType, target?: any): { success: boolean; message: string; damage?: number } {
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
}