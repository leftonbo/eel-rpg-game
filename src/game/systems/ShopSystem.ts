import { Player } from '../entities/Player';

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    category: 'weapon' | 'armor' | 'item' | 'skill' | 'permanent';
    requirements?: {
        abilityLevel?: { [key: string]: number };
        completedBosses?: string[];
    };
    effects?: {
        unlockItem?: string;
        unlockSkill?: string;
        grantAbilityExp?: { [key: string]: number };
        permanent?: {
            type: 'hp-boost' | 'mp-boost' | 'attack-boost' | 'orb-multiplier';
            value: number;
        };
    };
}

export class ShopSystem {
    private static shopItems: ShopItem[] = [
        // 武器アップグレード
        {
            id: 'weapon-upgrade-1',
            name: '基本武器強化',
            description: '基本武器の攻撃力を永続的に+2向上させる',
            cost: 50,
            category: 'permanent',
            effects: {
                permanent: {
                    type: 'attack-boost',
                    value: 2
                }
            }
        },
        // 体力強化
        {
            id: 'hp-boost-1',
            name: '体力強化I',
            description: '最大HPを永続的に+20向上させる',
            cost: 30,
            category: 'permanent',
            effects: {
                permanent: {
                    type: 'hp-boost',
                    value: 20
                }
            }
        },
        {
            id: 'hp-boost-2',
            name: '体力強化II',
            description: '最大HPを永続的に+50向上させる',
            cost: 75,
            category: 'permanent',
            requirements: {
                abilityLevel: { 'toughness': 3 }
            },
            effects: {
                permanent: {
                    type: 'hp-boost',
                    value: 50
                }
            }
        },
        // MP強化
        {
            id: 'mp-boost-1',
            name: 'MP強化I',
            description: '最大MPを永続的に+15向上させる',
            cost: 25,
            category: 'permanent',
            effects: {
                permanent: {
                    type: 'mp-boost',
                    value: 15
                }
            }
        },
        // オーブ獲得量増加
        {
            id: 'orb-multiplier-1',
            name: 'オーブマスター',
            description: 'バトル勝利時のオーブ獲得量が1.5倍になる',
            cost: 100,
            category: 'permanent',
            requirements: {
                abilityLevel: { 'combat': 5 }
            },
            effects: {
                permanent: {
                    type: 'orb-multiplier',
                    value: 1.5
                }
            }
        },
        // スキル解放
        {
            id: 'unlock-advanced-heal',
            name: '高度回復術',
            description: '強力な回復スキルを解放する',
            cost: 40,
            category: 'skill',
            requirements: {
                abilityLevel: { 'endurance': 4 }
            },
            effects: {
                unlockSkill: 'advanced-heal'
            }
        },
        // 特殊アイテム
        {
            id: 'unlock-phoenix-feather',
            name: '不死鳥の羽根',
            description: '戦闘不能時に自動復活するアイテムを解放',
            cost: 80,
            category: 'item',
            requirements: {
                abilityLevel: { 'toughness': 6 }
            },
            effects: {
                unlockItem: 'phoenix-feather'
            }
        }
    ];

    /**
     * 利用可能なショップアイテムを取得
     */
    public static getAvailableItems(player: Player): ShopItem[] {
        return this.shopItems.filter(item => {
            // 既に購入済みのアイテムは除外
            if (player.hasShopItem(item.id)) {
                return false;
            }

            // 要件チェック
            if (item.requirements) {
                // アビリティレベル要件
                if (item.requirements.abilityLevel) {
                    for (const [abilityType, requiredLevel] of Object.entries(item.requirements.abilityLevel)) {
                        const ability = player.abilitySystem.getAbility(abilityType as any);
                        if (!ability || ability.level < requiredLevel) {
                            return false;
                        }
                    }
                }

                // ボス撃破要件（将来実装予定）
                if (item.requirements.completedBosses) {
                    // TODO: プレイヤーの撃破ボス情報と照合
                }
            }

            return true;
        });
    }

    /**
     * ショップアイテムを購入
     */
    public static purchaseItem(player: Player, itemId: string): { success: boolean; message: string } {
        const item = this.shopItems.find(i => i.id === itemId);
        if (!item) {
            return { success: false, message: 'アイテムが見つかりません' };
        }

        // 既に購入済みかチェック
        if (player.hasShopItem(itemId)) {
            return { success: false, message: 'このアイテムは既に購入済みです' };
        }

        // オーブ不足チェック
        if (player.getOrbs() < item.cost) {
            return { success: false, message: `オーブが不足しています（必要: ${item.cost}、所持: ${player.getOrbs()}）` };
        }

        // 要件チェック
        const availableItems = this.getAvailableItems(player);
        if (!availableItems.find(i => i.id === itemId)) {
            return { success: false, message: '購入要件を満たしていません' };
        }

        // 購入処理
        if (player.purchaseShopItem(itemId, item.cost)) {
            this.applyItemEffects(player, item);
            return { success: true, message: `${item.name}を購入しました！` };
        }

        return { success: false, message: '購入に失敗しました' };
    }

    /**
     * アイテムの効果を適用
     */
    private static applyItemEffects(player: Player, item: ShopItem): void {
        if (!item.effects) return;

        // アイテム解放
        if (item.effects.unlockItem) {
            player.unlockedItems.add(item.effects.unlockItem);
        }

        // スキル解放
        if (item.effects.unlockSkill) {
            player.unlockedSkills.add(item.effects.unlockSkill);
        }

        // アビリティ経験値付与
        if (item.effects.grantAbilityExp) {
            for (const [abilityType, exp] of Object.entries(item.effects.grantAbilityExp)) {
                player.addExperience(abilityType as any, exp);
            }
        }

        // 永続効果は ShopBonusManager で処理される
        
        // 統計を再計算して保存
        player.recalculateStats();
        player.saveToStorage();
    }

    /**
     * 全ショップアイテムを取得（デバッグ用）
     */
    public static getAllItems(): ShopItem[] {
        return [...this.shopItems];
    }
}

/**
 * ショップで購入したボーナスを管理するクラス
 */
export class ShopBonusManager {
    /**
     * プレイヤーの永続ボーナスを計算
     */
    public static calculateBonuses(player: Player): {
        hpBonus: number;
        mpBonus: number;
        attackBonus: number;
        orbMultiplier: number;
    } {
        let hpBonus = 0;
        let mpBonus = 0;
        let attackBonus = 0;
        let orbMultiplier = 1;

        const purchasedItems = ShopSystem.getAllItems().filter(item => 
            player.hasShopItem(item.id)
        );

        for (const item of purchasedItems) {
            if (item.effects?.permanent) {
                const effect = item.effects.permanent;
                switch (effect.type) {
                    case 'hp-boost':
                        hpBonus += effect.value;
                        break;
                    case 'mp-boost':
                        mpBonus += effect.value;
                        break;
                    case 'attack-boost':
                        attackBonus += effect.value;
                        break;
                    case 'orb-multiplier':
                        orbMultiplier *= effect.value;
                        break;
                }
            }
        }

        return { hpBonus, mpBonus, attackBonus, orbMultiplier };
    }
}