import { AbilityType } from '../systems/AbilitySystem';
import { StatusEffectType, StatusEffectManager } from '../systems/StatusEffect';
import { Player } from '../entities/Player';

export interface PlayerItemData {
    id: string;
    name: string;
    description: string;
    requiredLevel: number;
    abilityType: AbilityType;
    experienceGain: number;
    getCount: (player: Player) => number;
    use: (player: Player) => boolean;
}

export const PLAYER_ITEMS: PlayerItemData[] = [
    // Healing Potion (base item, enhanced by CraftWork level)
    {
        id: 'heal-potion',
        name: '回復薬',
        description: 'ヘルスを80%回復し、状態異常を解除する',
        requiredLevel: 0,
        abilityType: AbilityType.CraftWork,
        experienceGain: 20,
        getCount: (player: Player) => {
            const baseCount = 5;
            const craftworkLevel = player.abilitySystem.getAbility(AbilityType.CraftWork)?.level || 0;
            return baseCount + craftworkLevel;
        },
        use: (player: Player) => {
            if (player.getItemCount('heal-potion') <= 0) return false;
            
            // Heal 80% of max HP
            const healAmount = Math.floor(player.maxHp * 0.8);
            player.heal(healAmount);
            
            // Remove all debuff status effects using the new system
            const removedDebuffs = player.statusEffects.removeDebuffs();
            if (removedDebuffs.length > 0) {
                console.log('回復薬で解除されたデバフ:', removedDebuffs.map(type => StatusEffectManager.getEffectName(type)).join(', '));
            }
            
            player.itemManager.decrementItemCount('heal-potion');
            return true;
        }
    },
    
    // Energy Drink (unlocked at CraftWork level 1)
    {
        id: 'energy-drink',
        name: '元気ドリンク',
        description: '3ターンの間、MPが常に満タンになる',
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
            if (player.getItemCount('energy-drink') <= 0) return false;
            
            // Set MP to max
            player.recoverMp(player.maxMp);
            
            // Add energized effect for 3 turns
            player.statusEffects.removeEffect(StatusEffectType.Exhausted);
            player.statusEffects.addEffect(StatusEffectType.Energized);
            player.itemManager.decrementItemCount('energy-drink');
            return true;
        }
    },
    
    // Adrenaline Shot (unlocked at CraftWork level 3)
    {
        id: 'adrenaline',
        name: 'アドレナリン注射',
        description: '3ターンの間、無敵になる',
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
            if (player.getItemCount('adrenaline') <= 0) return false;
            
            player.statusEffects.addEffect(StatusEffectType.Invincible);
            player.itemManager.decrementItemCount('adrenaline');
            return true;
        }
    },
    
    // Elixir (unlocked at CraftWork level 5)
    {
        id: 'elixir',
        name: 'エリクサー',
        description: 'HPを100%回復し、状態異常を解除、元気ドリンクの効果を得る',
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
            if (player.getItemCount('elixir') <= 0) return false;
            
            // Full heal
            player.heal(player.maxHp);
            player.recoverMp(player.maxMp);
            
            // Remove all debuff status effects using the new system
            const removedDebuffs = player.statusEffects.removeDebuffs();
            if (removedDebuffs.length > 0) {
                console.log('エリクサーで解除されたデバフ:', removedDebuffs.map(type => StatusEffectManager.getEffectName(type)).join(', '));
            }
            
            // Add energized effect
            player.statusEffects.removeEffect(StatusEffectType.Exhausted);
            player.statusEffects.addEffect(StatusEffectType.Energized);
            
            player.itemManager.decrementItemCount('elixir');
            return true;
        }
    },
    
    // Omamori (unlocked at CraftWork level 7)
    {
        id: 'omamori',
        name: 'おまもり',
        description: '行動不能状態・拘束中・食べられ中にのみ使える。即座にそれらの状態を解除し、HPを100%回復し、状態異常を解除',
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
            if (player.getItemCount('omamori') <= 0) return false;
            
            // Can only be used when knocked out, restrained, or eaten, or in special states
            if (!player.isKnockedOut()
                && !player.isRestrained()
                && !player.isEaten()
                && !player.statusEffects.hasEffect(StatusEffectType.Cocoon)
                && !player.statusEffects.hasEffect(StatusEffectType.Sleep)) {
                return false;
            }
            
            // Remove special states
            player.statusEffects.removeEffect(StatusEffectType.KnockedOut);
            player.statusEffects.removeEffect(StatusEffectType.Restrained);
            player.statusEffects.removeEffect(StatusEffectType.Eaten);
            
            // and also special restraints
            player.statusEffects.removeEffect(StatusEffectType.Cocoon);
            player.statusEffects.removeEffect(StatusEffectType.Sleep);

            // Full heal
            player.heal(player.maxHp);
            
            // Remove all debuff status effects using the new system
            const removedDebuffs = player.statusEffects.removeDebuffs();
            if (removedDebuffs.length > 0) {
                console.log('おまもりで解除されたデバフ:', removedDebuffs.map(type => StatusEffectManager.getEffectName(type)).join(', '));
            }
            
            player.itemManager.decrementItemCount('omamori');
            return true;
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
                name: itemData.name,
                count: currentCount,
                description: itemData.description,
                use: itemData.use,
                experienceGain: itemData.experienceGain,
            });
        }
    });
}