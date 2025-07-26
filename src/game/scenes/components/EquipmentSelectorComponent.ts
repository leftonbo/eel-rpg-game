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
        equipment: any,
        isEquipped: boolean,
        equipmentType: 'weapon' | 'armor',
        onEquipmentChange: (equipmentId: string) => void
    ): HTMLElement {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'form-check';
        
        const bonusText = this.getEquipmentBonusText(equipment, equipmentType);
        const inputId = `${equipmentType}-${equipment.id}`;
        
        optionDiv.innerHTML = `
            <input class="form-check-input" type="radio" name="${equipmentType}" id="${inputId}" 
                   value="${equipment.id}" ${isEquipped ? 'checked' : ''}>
            <label class="form-check-label" for="${inputId}">
                <strong>${equipment.name}</strong> ${bonusText}<br>
                <small class="text-muted">${equipment.description}</small>
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
        equipments: any[],
        currentEquipmentId: string | null,
        equipmentType: 'weapon' | 'armor',
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
        weapons: any[],
        currentWeaponId: string | null,
        onWeaponChange: (weaponId: string) => void
    ): void {
        this.updateEquipmentSelection(containerId, weapons, currentWeaponId, 'weapon', onWeaponChange);
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
        armors: any[],
        currentArmorId: string | null,
        onArmorChange: (armorId: string) => void
    ): void {
        this.updateEquipmentSelection(containerId, armors, currentArmorId, 'armor', onArmorChange);
    }

    /**
     * 装備のボーナステキストを取得する
     * @param equipment 装備データ
     * @param equipmentType 装備タイプ
     * @returns ボーナステキスト
     */
    private static getEquipmentBonusText(equipment: any, equipmentType: 'weapon' | 'armor'): string {
        if (equipmentType === 'weapon') {
            return `(+${equipment.attackPowerBonus || 0} 攻撃力)`;
        } else if (equipmentType === 'armor') {
            return `(+${equipment.hpBonus || 0} HP)`;
        }
        return '';
    }

    /**
     * 装備タイプの日本語名を取得する
     * @param equipmentType 装備タイプ
     * @returns 日本語名
     */
    private static getEquipmentTypeName(equipmentType: 'weapon' | 'armor'): string {
        switch (equipmentType) {
            case 'weapon': return '武器';
            case 'armor': return '防具';
            default: return '装備';
        }
    }

    /**
     * 装備情報をテキスト形式で取得する（デバッグ用）
     * @param equipment 装備データ
     * @param equipmentType 装備タイプ
     * @returns 装備情報のテキスト
     */
    static getEquipmentInfoText(equipment: any, equipmentType: 'weapon' | 'armor'): string {
        const parts = [
            `名前: ${equipment.name}`,
            `説明: ${equipment.description}`,
            `ID: ${equipment.id}`
        ];

        if (equipmentType === 'weapon' && equipment.attackPowerBonus) {
            parts.push(`攻撃力ボーナス: +${equipment.attackPowerBonus}`);
        }

        if (equipmentType === 'armor' && equipment.hpBonus) {
            parts.push(`HPボーナス: +${equipment.hpBonus}`);
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
        equipments: any[],
        currentEquipmentId: string | null,
        equipmentType: 'weapon' | 'armor',
        formName: string = equipmentType
    ): string {
        if (equipments.length === 0) {
            return `<div class="text-muted">利用可能な${this.getEquipmentTypeName(equipmentType)}がありません</div>`;
        }

        const options = equipments.map(equipment => {
            const isEquipped = currentEquipmentId === equipment.id;
            const bonusText = this.getEquipmentBonusText(equipment, equipmentType);
            const inputId = `${equipmentType}-${equipment.id}`;
            
            return `
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="${formName}" id="${inputId}" 
                           value="${equipment.id}" ${isEquipped ? 'checked' : ''}>
                    <label class="form-check-label" for="${inputId}">
                        <strong>${equipment.name}</strong> ${bonusText}<br>
                        <small class="text-muted">${equipment.description}</small>
                    </label>
                </div>
            `;
        }).join('');

        return options;
    }

    /**
     * 装備統計情報を生成する
     * @param equipments 装備データの配列
     * @param equipmentType 装備タイプ
     * @returns 統計情報オブジェクト
     */
    static getEquipmentStatistics(equipments: any[], equipmentType: 'weapon' | 'armor'): {
        total: number;
        totalBonus: number;
        averageBonus: number;
        strongestEquipment?: any;
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
        equipments: any[], 
        equipmentType: 'weapon' | 'armor', 
        ascending: boolean = false
    ): any[] {
        const bonusProperty = equipmentType === 'weapon' ? 'attackPowerBonus' : 'hpBonus';
        
        return [...equipments].sort((a, b) => {
            const bonusA = a[bonusProperty] || 0;
            const bonusB = b[bonusProperty] || 0;
            return ascending ? bonusA - bonusB : bonusB - bonusA;
        });
    }

    /**
     * 装備をレアリティでフィルタリングする
     * @param equipments 装備データの配列
     * @param rarity レアリティ
     * @returns フィルタリングされた装備配列
     */
    static filterEquipmentsByRarity(equipments: any[], rarity: string): any[] {
        return equipments.filter(equipment => equipment.rarity === rarity);
    }
}