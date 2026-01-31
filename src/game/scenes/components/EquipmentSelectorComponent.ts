import { AbilitySystem, Equipment, EquipmentType } from "@/game/systems/AbilitySystem";
import { t } from "i18next";

/**
 * 装備選択の共通コンポーネント
 * 武器・防具選択UIの生成とイベントハンドリングを統一化
 */
export class EquipmentSelectorComponent {
    /**
     * 装備選択要素を作成する
     * @param equipment 装備データ
     * @param isEquipped 現在装備中かどうか
     * @param equipmentType 装備タイプ（'weapon' または 'armor'）
     * @param onEquipmentChange 装備変更時のコールバック
     * @returns 作成された装備選択要素
     */
    static createEquipmentOption(
        equipment: Equipment,
        isEquipped: boolean,
        equipmentType: EquipmentType,
        onEquipmentChange: (equipmentId: string) => void
    ): HTMLElement {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'form-check';
        
        const bonusText = this.getEquipmentBonusText(equipment, equipmentType);
        const inputId = `${equipmentType}-${equipment.id}`;
        const { localizedName, localizedDescription } = this.getLocalizedEquipmentTexts(equipment, equipmentType);
        
        optionDiv.innerHTML = `
            <input class="form-check-input" type="radio" name="${equipmentType}" id="${inputId}" 
                   value="${equipment.id}" ${isEquipped ? 'checked' : ''}>
            <label class="form-check-label" for="${inputId}">
                <strong>${localizedName}</strong> ${bonusText}<br>
                <small class="text-muted">${localizedDescription}</small>
            </label>
        `;
        
        // イベントリスナーを追加
        const input = optionDiv.querySelector('input') as HTMLInputElement;
        if (input) {
            input.addEventListener('change', () => {
                if (input.checked) {
                    onEquipmentChange(equipment.id);
                }
            });
        }
        
        return optionDiv;
    }

    /**
     * 装備選択リスト全体を更新する
     * @param containerId コンテナ要素のID
     * @param equipments 装備データの配列
     * @param currentEquipmentId 現在装備中の装備ID
     * @param equipmentType 装備タイプ（'weapon' または 'armor'）
     * @param onEquipmentChange 装備変更時のコールバック
     */
    static updateEquipmentSelection(
        containerId: string,
        equipments: Equipment[],
        currentEquipmentId: string | null,
        equipmentType: EquipmentType,
        onEquipmentChange: (equipmentId: string) => void
    ): void {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Equipment container '${containerId}' not found`);
            return;
        }

        // コンテナをクリア
        container.innerHTML = '';

        if (equipments.length === 0) {
            container.innerHTML = `<div class="text-muted">利用可能な${this.getEquipmentTypeName(equipmentType)}がありません</div>`;
            return;
        }

        // DocumentFragmentを使用してパフォーマンスを向上
        const fragment = document.createDocumentFragment();

        equipments.forEach(equipment => {
            const isEquipped = currentEquipmentId === equipment.id;
            const optionElement = this.createEquipmentOption(
                equipment,
                isEquipped,
                equipmentType,
                onEquipmentChange
            );
            fragment.appendChild(optionElement);
        });

        container.appendChild(fragment);
    }

    /**
     * 武器選択リストを更新する
     * @param containerId コンテナ要素のID
     * @param weapons 武器データの配列
     * @param currentWeaponId 現在装備中の武器ID
     * @param onWeaponChange 武器変更時のコールバック
     */
    static updateWeaponSelection(
        containerId: string,
        weapons: Equipment[],
        currentWeaponId: string | null,
        onWeaponChange: (weaponId: string) => void
    ): void {
        this.updateEquipmentSelection(containerId, weapons, currentWeaponId, EquipmentType.Weapons, onWeaponChange);
    }

    /**
     * 防具選択リストを更新する
     * @param containerId コンテナ要素のID
     * @param armors 防具データの配列
     * @param currentArmorId 現在装備中の防具ID
     * @param onArmorChange 防具変更時のコールバック
     */
    static updateArmorSelection(
        containerId: string,
        armors: Equipment[],
        currentArmorId: string | null,
        onArmorChange: (armorId: string) => void
    ): void {
        this.updateEquipmentSelection(containerId, armors, currentArmorId, EquipmentType.Armors, onArmorChange);
    }
    
    /**
     * 手袋選択リストを更新する
     * @param containerId コンテナ要素のID
     * @param gloves 手袋データの配列
     * @param currentGlovesId 現在装備中の手袋ID
     * @param onGlovesChange 手袋変更時のコールバック
     */
    static updateGlovesSelection(
        containerId: string,
        gloves: Equipment[],
        currentGlovesId: string | null,
        onGlovesChange: (glovesId: string) => void
    ): void {
        this.updateEquipmentSelection(containerId, gloves, currentGlovesId, EquipmentType.Gloves, onGlovesChange);
    }
    
    /**
     * ベルト選択リストを更新する
     * @param containerId コンテナ要素のID
     * @param belts ベルトデータの配列
     * @param currentBeltId 現在装備中のベルトID
     * @param onBeltChange ベルト変更時のコールバック
     */
    static updateBeltSelection(
        containerId: string,
        belts: Equipment[],
        currentBeltId: string | null,
        onBeltChange: (beltId: string) => void
    ): void {
        this.updateEquipmentSelection(containerId, belts, currentBeltId, EquipmentType.Belts, onBeltChange);
    }

    /**
     * 装備のボーナステキストを取得する
     * @param equipment 装備データ
     * @param equipmentType 装備タイプ
     * @returns ボーナステキスト
     */
    private static getEquipmentBonusText(equipment: Equipment, equipmentType: EquipmentType): string {
        if (equipmentType === EquipmentType.Weapons) {
            return `(+${equipment.attackPowerBonus || 0} ${t('common.attack')})`;
        } else if (equipmentType === EquipmentType.Armors) {
            return `(+${equipment.hpBonus || 0} ${t('common.hp')})`;
        } else if (equipmentType === EquipmentType.Gloves) {
            const escapeBonus = equipment.escapeRateBonus || 0;
            return `(+${Math.round(escapeBonus * 100)} ${t('common.escapePower')})`;
        } else if (equipmentType === EquipmentType.Belts) {
            return `(+${equipment.mpBonus || 0} ${t('common.mp')})`;
        }
        return '';
    }

    /**
     * 装備タイプの日本語名を取得する
     * @param equipmentType 装備タイプ
     * @returns 日本語名
     */
    private static getEquipmentTypeName(equipmentType: EquipmentType): string {
        switch (equipmentType) {
            case EquipmentType.Weapons: return '武器';
            case EquipmentType.Armors: return '防具';
            case EquipmentType.Gloves: return '手袋';
            case EquipmentType.Belts: return 'ベルト';
            default: return '装備';
        }
    }

    /**
     * 装備情報をテキスト形式で取得する（デバッグ用）
     * @param equipment 装備データ
     * @param equipmentType 装備タイプ
     * @returns 装備情報のテキスト
     */
    static getEquipmentInfoText(equipment: Equipment, equipmentType: EquipmentType): string {
        const { localizedName, localizedDescription } = this.getLocalizedEquipmentTexts(equipment, equipmentType);
        const parts = [
            `名前: ${localizedName}`,
            `説明: ${localizedDescription}`,
            `ID: ${equipment.id}`
        ];

        if (equipment.attackPowerBonus) {
            parts.push(`${t('common.attack')}: +${equipment.attackPowerBonus}`);
        }

        if (equipment.hpBonus) {
            parts.push(`${t('common.hp')}: +${equipment.hpBonus}`);
        }

        if (equipment.escapeRateBonus) {
            parts.push(`${t('common.escapePower')}: +${Math.round(equipment.escapeRateBonus * 100)}%`);
        }

        if (equipment.mpBonus) {
            parts.push(`${t('common.mp')}: +${equipment.mpBonus}`);
        }

        return parts.join('\n');
    }

    /**
     * 装備選択フォーム全体のHTML文字列を生成する
     * @param equipments 装備データの配列
     * @param currentEquipmentId 現在装備中の装備ID
     * @param equipmentType 装備タイプ
     * @param formName フォーム名（ラジオボタンのname属性）
     * @returns HTML文字列
     */
    static generateEquipmentSelectionHTML(
        equipments: Equipment[],
        currentEquipmentId: string | null,
        equipmentType: EquipmentType,
        formName: string = equipmentType
    ): string {
        if (equipments.length === 0) {
            return `<div class="text-muted">利用可能な${this.getEquipmentTypeName(equipmentType)}がありません</div>`;
        }

        const options = equipments.map(equipment => {
            const isEquipped = currentEquipmentId === equipment.id;
            const bonusText = this.getEquipmentBonusText(equipment, equipmentType);
            const inputId = `${equipmentType}-${equipment.id}`;
            const { localizedName, localizedDescription } = this.getLocalizedEquipmentTexts(equipment, equipmentType);
            
            return `
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="${formName}" id="${inputId}" 
                           value="${equipment.id}" ${isEquipped ? 'checked' : ''}>
                    <label class="form-check-label" for="${inputId}">
                        <strong>${localizedName}</strong> ${bonusText}<br>
                        <small class="text-muted">${localizedDescription}</small>
                    </label>
                </div>
            `;
        }).join('');

        return options;
    }

    private static getLocalizedEquipmentTexts(equipment: Equipment, equipmentType: EquipmentType): { localizedName: string; localizedDescription: string } {
        return {
            localizedName: AbilitySystem.getEquipmentName(equipmentType, equipment),
            localizedDescription: AbilitySystem.getEquipmentDescription(equipmentType, equipment)
        };
    }

    /**
     * 装備統計情報を生成する
     * @param equipments 装備データの配列
     * @param equipmentType 装備タイプ
     * @returns 統計情報オブジェクト
     */
    static getEquipmentStatistics(equipments: Equipment[], equipmentType: 'weapon' | 'armor'): {
        total: number;
        totalBonus: number;
        averageBonus: number;
        strongestEquipment?: Equipment;
    } {
        if (equipments.length === 0) {
            return {
                total: 0,
                totalBonus: 0,
                averageBonus: 0
            };
        }

        const bonusProperty = equipmentType === 'weapon' ? 'attackPowerBonus' : 'hpBonus';
        let totalBonus = 0;
        let strongestEquipment = equipments[0];

        equipments.forEach(equipment => {
            const bonus = equipment[bonusProperty] || 0;
            totalBonus += bonus;
            
            if (bonus > (strongestEquipment[bonusProperty] || 0)) {
                strongestEquipment = equipment;
            }
        });

        return {
            total: equipments.length,
            totalBonus,
            averageBonus: Math.round(totalBonus / equipments.length),
            strongestEquipment
        };
    }

    /**
     * 装備をボーナス値でソートする
     * @param equipments 装備データの配列
     * @param equipmentType 装備タイプ
     * @param ascending 昇順の場合はtrue、降順の場合はfalse（デフォルト）
     * @returns ソートされた装備配列
     */
    static sortEquipmentsByBonus(
        equipments: Equipment[], 
        equipmentType: 'weapon' | 'armor', 
        ascending: boolean = false
    ): Equipment[] {
        const bonusProperty = equipmentType === 'weapon' ? 'attackPowerBonus' : 'hpBonus';
        
        return [...equipments].sort((a, b) => {
            const bonusA = a[bonusProperty] || 0;
            const bonusB = b[bonusProperty] || 0;
            return ascending ? bonusA - bonusB : bonusB - bonusA;
        });
    }
}
