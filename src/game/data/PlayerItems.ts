import { AbilityType } from '../systems/AbilitySystem';
import { StatusEffectType } from '../systems/StatusEffectTypes';
import { Player } from '../entities/Player';
import { ItemUseResult, ItemUseFailureReason } from '../entities/PlayerItemManager';

/**
 * アイテム使用前の共通バリデーション
 */
function validateItemUse(player: Player, itemId: string): ItemUseResult | null {
    if (player.getItemCount(itemId) <= 0) {
        return { success: false, failureReason: ItemUseFailureReason.NotEnoughCount };
    }
    return null; // バリデーション成功
}

/**
 * 特殊条件アイテム（おまもり等）のバリデーション
 */
function validateSpecialConditionItem(player: Player, itemId: string): ItemUseResult | null {
    const baseValidation = validateItemUse(player, itemId);
    if (baseValidation) return baseValidation;
    
    if (itemId === 'omamori') {
        // おまもりは特定の状態でのみ使用可能
        if (!player.isKnockedOut()
            && !player.isRestrained()
            && !player.isEaten()
            && !player.statusEffects.hasEffect(StatusEffectType.Cocoon)
            && !player.statusEffects.hasEffect(StatusEffectType.Sleep)) {
            return { success: false, failureReason: ItemUseFailureReason.InvalidCondition };
        }
    }
    
    return null; // バリデーション成功
}

/**
 * アイテムの定義データ（テンプレート）
 * ゲーム全体で共有される設定情報を持つ
 * PlayerItemManagerのPlayerItemインスタンス生成に使用される
 */
export interface PlayerItemData {
    id: string;
    icon: string;
    requiredLevel: number;
    abilityType: AbilityType;
    experienceGain: number;
    getCount: (player: Player) => number;
    use: (player: Player) => ItemUseResult;
}

export const PLAYER_ITEMS: PlayerItemData[] = [
    // Healing Potion (base item, enhanced by CraftWork level)
    {
        id: 'heal-potion',
        icon: '💊',
        requiredLevel: 0,
        abilityType: AbilityType.CraftWork,
        experienceGain: 20,
        getCount: (player: Player) => {
            const baseCount = 5;
            const craftworkLevel = player.abilitySystem.getAbility(AbilityType.CraftWork)?.level || 0;
            return baseCount + craftworkLevel;
        },
        use: (player: Player) => {
            const validation = validateItemUse(player, 'heal-potion');
            if (validation) return validation;
            
            // Heal 80% of max HP
            const healAmount = Math.floor(player.maxHp * 0.8);
            const actualHealedHp = player.heal(healAmount);
            
            // Remove all debuff status effects using the new system
            const removedDebuffs = player.statusEffects.removeDebuffs();
            
            player.itemManager.decrementItemCount('heal-potion');
            return { 
                success: true,
                healedHp: actualHealedHp,
                removedStatusEffects: removedDebuffs
            };
        }
    },
    
    // Energy Drink (unlocked at CraftWork level 1)
    {
        id: 'energy-drink',
        icon: '🥤',
        requiredLevel: 1,
        abilityType: AbilityType.CraftWork,
        experienceGain: 80,
        getCount: (player: Player) => {
            const craftworkLevel = player.abilitySystem.getAbility(AbilityType.CraftWork)?.level || 0;
            if (craftworkLevel < 1) return 0;
            
            let count = 1; // Base count
            if (craftworkLevel >= 2) count++; // Level 2: +1
            if (craftworkLevel >= 4) count++; // Level 4: +1
            return count;
        },
        use: (player: Player) => {
            const validation = validateItemUse(player, 'energy-drink');
            if (validation) return validation;
            
            // Set MP to max
            const currentMp = player.mp;
            player.recoverMp(player.maxMp);
            const recoveredMp = player.mp - currentMp;
            
            // Add energized effect for 3 turns
            player.statusEffects.removeEffect(StatusEffectType.Exhausted);
            const addedEffects: StatusEffectType[] = [];
            if (player.statusEffects.addEffect(StatusEffectType.Energized)) {
                addedEffects.push(StatusEffectType.Energized);
            }
            
            player.itemManager.decrementItemCount('energy-drink');
            return { 
                success: true,
                recoveredMp: recoveredMp,
                addedStatusEffects: addedEffects
            };
        }
    },
    
    // Adrenaline Shot (unlocked at CraftWork level 3)
    {
        id: 'adrenaline',
        icon: '💉',
        requiredLevel: 3,
        abilityType: AbilityType.CraftWork,
        experienceGain: 150,
        getCount: (player: Player) => {
            const craftworkLevel = player.abilitySystem.getAbility(AbilityType.CraftWork)?.level || 0;
            if (craftworkLevel < 3) return 0;
            
            let count = 1; // Base count
            if (craftworkLevel >= 6) count++; // Level 6: +1
            if (craftworkLevel >= 9) count++; // Level 9: +1
            return count;
        },
        use: (player: Player) => {
            const validation = validateItemUse(player, 'adrenaline');
            if (validation) return validation;
            
            const addedEffects: StatusEffectType[] = [];
            if (player.statusEffects.addEffect(StatusEffectType.Invincible)) {
                addedEffects.push(StatusEffectType.Invincible);
            }
            
            player.itemManager.decrementItemCount('adrenaline');
            return { 
                success: true,
                addedStatusEffects: addedEffects
            };
        }
    },
    
    // Elixir (unlocked at CraftWork level 5)
    {
        id: 'elixir',
        icon: '🍯',
        requiredLevel: 5,
        abilityType: AbilityType.CraftWork,
        experienceGain: 400,
        getCount: (player: Player) => {
            const craftworkLevel = player.abilitySystem.getAbility(AbilityType.CraftWork)?.level || 0;
            if (craftworkLevel < 5) return 0;
            
            let count = 1; // Base count
            if (craftworkLevel >= 8) count++; // Level 8: +1
            return count;
        },
        use: (player: Player) => {
            const validation = validateItemUse(player, 'elixir');
            if (validation) return validation;
            
            // Full heal
            const actualHealedHp = player.heal(player.maxHp);
            const currentMp = player.mp;
            player.recoverMp(player.maxMp);
            const recoveredMp = player.mp - currentMp;
            
            // Remove all debuff status effects using the new system
            const removedDebuffs = player.statusEffects.removeDebuffs();
            
            // Add energized effect
            player.statusEffects.removeEffect(StatusEffectType.Exhausted);
            const addedEffects: StatusEffectType[] = [];
            if (player.statusEffects.addEffect(StatusEffectType.Energized)) {
                addedEffects.push(StatusEffectType.Energized);
            }
            
            player.itemManager.decrementItemCount('elixir');
            return { 
                success: true,
                healedHp: actualHealedHp,
                recoveredMp: recoveredMp,
                removedStatusEffects: removedDebuffs,
                addedStatusEffects: addedEffects
            };
        }
    },
    
    // Omamori (unlocked at CraftWork level 7)
    {
        id: 'omamori',
        icon: '🧿',
        requiredLevel: 7,
        abilityType: AbilityType.CraftWork,
        experienceGain: 1000,
        getCount: (player: Player) => {
            const craftworkLevel = player.abilitySystem.getAbility(AbilityType.CraftWork)?.level || 0;
            if (craftworkLevel < 7) return 0;

            let count = 1; // Base count
            if (craftworkLevel >= 10) count++; // Level 10: +1
            return count;
        },
        use: (player: Player) => {
            const validation = validateSpecialConditionItem(player, 'omamori');
            if (validation) return validation;
            
            // Remove special states
            const removedSpecialEffects: StatusEffectType[] = [];
            if (player.statusEffects.hasEffect(StatusEffectType.KnockedOut) && player.statusEffects.removeEffect(StatusEffectType.KnockedOut)) {
                removedSpecialEffects.push(StatusEffectType.KnockedOut);
            }
            if (player.statusEffects.hasEffect(StatusEffectType.Restrained) && player.statusEffects.removeEffect(StatusEffectType.Restrained)) {
                removedSpecialEffects.push(StatusEffectType.Restrained);
            }
            if (player.statusEffects.hasEffect(StatusEffectType.Eaten) && player.statusEffects.removeEffect(StatusEffectType.Eaten)) {
                removedSpecialEffects.push(StatusEffectType.Eaten);
            }
            if (player.statusEffects.hasEffect(StatusEffectType.Cocoon) && player.statusEffects.removeEffect(StatusEffectType.Cocoon)) {
                removedSpecialEffects.push(StatusEffectType.Cocoon);
            }
            if (player.statusEffects.hasEffect(StatusEffectType.Sleep) && player.statusEffects.removeEffect(StatusEffectType.Sleep)) {
                removedSpecialEffects.push(StatusEffectType.Sleep);
            }

            // Apply escape recovery passive skill
            player.battleActions?.applyEscapeRecovery();

            // Full heal
            const actualHealedHp = player.heal(player.maxHp);
            
            // Remove all debuff status effects using the new system
            const removedDebuffs = player.statusEffects.removeDebuffs();
            
            // Combine all removed effects
            const allRemovedEffects = [...removedSpecialEffects, ...removedDebuffs];
            
            player.itemManager.decrementItemCount('omamori');
            return { 
                success: true,
                healedHp: actualHealedHp,
                removedStatusEffects: allRemovedEffects
            };
        }
    }
];

/**
 * Update player items based on ability levels
 */
export function updatePlayerItems(player: Player): void {
    PLAYER_ITEMS.forEach(itemData => {
        const currentCount = itemData.getCount(player);
        
        // Update item in player's inventory
        const existingItem = player.itemManager.getItem(itemData.id);
        if (existingItem) {
            existingItem.count = currentCount;
            existingItem.use = itemData.use;
        } else if (currentCount > 0) {
            // Add new item if it should be available
            player.itemManager.addItem(itemData.id, {
                id: itemData.id,
                icon: itemData.icon,
                count: currentCount,
                use: itemData.use,
                experienceGain: itemData.experienceGain,
            });
        }
    });
}