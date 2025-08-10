import { AbilitySystem, AbilityType, Equipment, WEAPONS, ARMORS, GLOVES, BELTS } from '../systems/AbilitySystem';

/**
 * プレイヤーの装備管理クラス
 */
export class PlayerEquipmentManager {
    private equippedWeapon: string = 'bare-hands';
    private equippedArmor: string = 'naked';
    private equippedGloves: string = 'bare-hands-gloves';
    private equippedBelt: string = 'no-belt';
    
    constructor(private abilitySystem: AbilitySystem) {}
    
    /**
     * 現在装備中の武器IDを取得
     */
    getEquippedWeapon(): string {
        return this.equippedWeapon;
    }
    
    /**
     * 現在装備中の防具IDを取得
     */
    getEquippedArmor(): string {
        return this.equippedArmor;
    }
    
    /**
     * 現在装備中の手袋IDを取得
     */
    getEquippedGloves(): string {
        return this.equippedGloves;
    }
    
    /**
     * 現在装備中のベルトIDを取得
     */
    getEquippedBelt(): string {
        return this.equippedBelt;
    }
    
    /**
     * 装備データをロード
     */
    loadEquipment(weapon?: string, armor?: string, gloves?: string, belt?: string): void {
        this.equippedWeapon = weapon || 'bare-hands';
        this.equippedArmor = armor || 'naked';
        this.equippedGloves = gloves || 'bare-hands-gloves';
        this.equippedBelt = belt || 'no-belt';
    }
    
    /**
     * 装備データをエクスポート
     */
    exportEquipment(): { weapon: string; armor: string; gloves: string; belt: string } {
        return {
            weapon: this.equippedWeapon,
            armor: this.equippedArmor,
            gloves: this.equippedGloves,
            belt: this.equippedBelt
        };
    }
    
    /**
     * 武器攻撃力ボーナスを取得
     */
    getWeaponAttackBonus(): number {
        const weapon = WEAPONS.find(w => w.id === this.equippedWeapon);
        return weapon?.attackPowerBonus || 0;
    }
    
    /**
     * 防具HPボーナスを取得
     */
    getArmorHpBonus(): number {
        const armor = ARMORS.find(a => a.id === this.equippedArmor);
        return armor?.hpBonus || 0;
    }
    
    /**
     * ベルトMPボーナスを取得
     */
    getBeltMpBonus(): number {
        const belt = BELTS.find(b => b.id === this.equippedBelt);
        return belt?.mpBonus || 0;
    }
    
    /**
     * 手袋拘束脱出率ボーナスを取得
     */
    getGlovesEscapeRateBonus(): number {
        const gloves = GLOVES.find(g => g.id === this.equippedGloves);
        return gloves?.escapeRateBonus || 0;
    }
    
    /**
     * 武器を装備（レベル制限チェック付き）
     */
    equipWeapon(weaponId: string): boolean {
        const weapon = WEAPONS.find(w => w.id === weaponId);
        if (!weapon) return false;
        
        const combatLevel = this.abilitySystem.getAbility(AbilityType.Combat)?.level || 0;
        if (combatLevel < weapon.requiredLevel) return false;
        
        this.equippedWeapon = weaponId;
        return true;
    }
    
    /**
     * 防具を装備（レベル制限チェック付き）
     */
    equipArmor(armorId: string): boolean {
        const armor = ARMORS.find(a => a.id === armorId);
        if (!armor) return false;
        
        const toughnessLevel = this.abilitySystem.getAbility(AbilityType.Toughness)?.level || 0;
        if (toughnessLevel < armor.requiredLevel) return false;
        
        this.equippedArmor = armorId;
        return true;
    }
    
    /**
     * 手袋を装備（レベル制限チェック付き）
     */
    equipGloves(glovesId: string): boolean {
        const gloves = GLOVES.find(g => g.id === glovesId);
        if (!gloves) return false;
        
        const agilityLevel = this.abilitySystem.getAbility(AbilityType.Agility)?.level || 0;
        if (agilityLevel < gloves.requiredLevel) return false;
        
        this.equippedGloves = glovesId;
        return true;
    }
    
    /**
     * ベルトを装備（レベル制限チェック付き）
     */
    equipBelt(beltId: string): boolean {
        const belt = BELTS.find(b => b.id === beltId);
        if (!belt) return false;
        
        const enduranceLevel = this.abilitySystem.getAbility(AbilityType.Endurance)?.level || 0;
        if (enduranceLevel < belt.requiredLevel) return false;
        
        this.equippedBelt = beltId;
        return true;
    }
    
    /**
     * 利用可能な武器一覧を取得
     */
    getAvailableWeapons(): Equipment[] {
        const combatLevel = this.abilitySystem.getAbility(AbilityType.Combat)?.level || 0;
        return WEAPONS.filter(weapon => weapon.requiredLevel <= combatLevel);
    }
    
    /**
     * 利用可能な防具一覧を取得
     */
    getAvailableArmors(): Equipment[] {
        const toughnessLevel = this.abilitySystem.getAbility(AbilityType.Toughness)?.level || 0;
        return ARMORS.filter(armor => armor.requiredLevel <= toughnessLevel);
    }
    
    /**
     * 利用可能な手袋一覧を取得
     */
    getAvailableGloves(): Equipment[] {
        const agilityLevel = this.abilitySystem.getAbility(AbilityType.Agility)?.level || 0;
        return GLOVES.filter(gloves => gloves.requiredLevel <= agilityLevel);
    }
    
    /**
     * 利用可能なベルト一覧を取得
     */
    getAvailableBelts(): Equipment[] {
        const enduranceLevel = this.abilitySystem.getAbility(AbilityType.Endurance)?.level || 0;
        return BELTS.filter(belt => belt.requiredLevel <= enduranceLevel);
    }
    
    /**
     * 現在の装備情報を取得
     */
    getEquipmentInfo(): { weapon: Equipment | null; armor: Equipment | null; gloves: Equipment | null; belt: Equipment | null } {
        const weapon = WEAPONS.find(w => w.id === this.equippedWeapon) || null;
        const armor = ARMORS.find(a => a.id === this.equippedArmor) || null;
        const gloves = GLOVES.find(g => g.id === this.equippedGloves) || null;
        const belt = BELTS.find(b => b.id === this.equippedBelt) || null;
        return { weapon, armor, gloves, belt };
    }
}