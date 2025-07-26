import { AbilitySystem, AbilityType, Equipment, WEAPONS, ARMORS } from '../systems/AbilitySystem';

/**
 * プレイヤーの装備管理クラス
 */
export class PlayerEquipmentManager {
    private equippedWeapon: string = 'bare-hands';
    private equippedArmor: string = 'naked';
    
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
     * 装備データをロード
     */
    loadEquipment(weapon: string, armor: string): void {
        this.equippedWeapon = weapon;
        this.equippedArmor = armor;
    }
    
    /**
     * 装備データをエクスポート
     */
    exportEquipment(): { weapon: string; armor: string } {
        return {
            weapon: this.equippedWeapon,
            armor: this.equippedArmor
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
     * 現在の装備情報を取得
     */
    getEquipmentInfo(): { weapon: Equipment | null; armor: Equipment | null } {
        const weapon = WEAPONS.find(w => w.id === this.equippedWeapon) || null;
        const armor = ARMORS.find(a => a.id === this.equippedArmor) || null;
        return { weapon, armor };
    }
}