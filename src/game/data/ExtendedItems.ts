import { AbilityType } from '../systems/AbilitySystem';
import { StatusEffectType } from '../systems/StatusEffect';
import { Player } from '../entities/Player';

export interface ExtendedItemData {
    id: string;
    name: string;
    description: string;
    requiredLevel: number;
    abilityType: AbilityType;
    experienceGain: number;
    getCount: (player: Player) => number;
    use: (player: Player) => boolean;
}

export const EXTENDED_ITEMS: ExtendedItemData[] = [
    // Healing Potion (base item, enhanced by CraftWork level)
    {
        id: 'heal-potion',
        name: '回復薬',
        description: 'ヘルスを80%回復し、状態異常を解除する',
        requiredLevel: 0,
        abilityType: AbilityType.CraftWork,
        experienceGain: 50,
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
            
            // Remove all negative status effects except knocked out, restrained, and eaten
            const effectsToRemove = [
                StatusEffectType.Fire,
                StatusEffectType.Charm,
                StatusEffectType.Slow,
                StatusEffectType.Poison
            ];
            
            effectsToRemove.forEach(effect => {
                player.statusEffects.removeEffect(effect);
            });
            
            player.items.get('heal-potion')!.count--;
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
        experienceGain: 75,
        getCount: (player: Player) => {
            const craftworkLevel = player.abilitySystem.getAbility(AbilityType.CraftWork)?.level || 0;
            if (craftworkLevel < 1) return 0;
            
            let count = 1; // Base count
            if (craftworkLevel >= 3) count++; // Level 3: +1
            if (craftworkLevel >= 5) count++; // Level 5: +1
            return count;
        },
        use: (player: Player) => {
            if (player.getItemCount('energy-drink') <= 0) return false;
            
            player.statusEffects.addEffect(StatusEffectType.Energized);
            player.items.get('energy-drink')!.count--;
            return true;
        }
    },
    
    // Grenade (unlocked at CraftWork level 2)
    {
        id: 'grenade',
        name: '手投げ爆弾',
        description: 'ターン消費せずにボスに攻撃力50のダメージを与える',
        requiredLevel: 2,
        abilityType: AbilityType.CraftWork,
        experienceGain: 100,
        getCount: (player: Player) => {
            const craftworkLevel = player.abilitySystem.getAbility(AbilityType.CraftWork)?.level || 0;
            if (craftworkLevel < 2) return 0;
            
            let count = 1; // Base count
            if (craftworkLevel >= 6) count++; // Level 6: +1
            return count;
        },
        use: (player: Player) => {
            // This will be handled specially in battle scene to damage boss
            if (player.getItemCount('grenade') <= 0) return false;
            player.items.get('grenade')!.count--;
            return true;
        }
    },
    
    // Adrenaline Shot (unlocked at CraftWork level 4)
    {
        id: 'adrenaline',
        name: 'アドレナリン注射',
        description: '次のターンまで無敵になる',
        requiredLevel: 4,
        abilityType: AbilityType.CraftWork,
        experienceGain: 75,
        getCount: (player: Player) => {
            const craftworkLevel = player.abilitySystem.getAbility(AbilityType.CraftWork)?.level || 0;
            if (craftworkLevel < 4) return 0;
            
            let count = 1; // Base count
            if (craftworkLevel >= 8) count++; // Level 8: +1
            if (craftworkLevel >= 9) count++; // Level 9: +1
            return count;
        },
        use: (player: Player) => {
            if (player.getItemCount('adrenaline') <= 0) return false;
            
            player.statusEffects.addEffect(StatusEffectType.Invincible);
            player.items.get('adrenaline')!.count--;
            return true;
        }
    },
    
    // Elixir (unlocked at CraftWork level 7)
    {
        id: 'elixir',
        name: 'エリクサー',
        description: 'HPを100%回復し、状態異常を解除、元気ドリンクの効果を得る',
        requiredLevel: 7,
        abilityType: AbilityType.CraftWork,
        experienceGain: 150,
        getCount: (player: Player) => {
            const craftworkLevel = player.abilitySystem.getAbility(AbilityType.CraftWork)?.level || 0;
            if (craftworkLevel < 7) return 0;
            return 1;
        },
        use: (player: Player) => {
            if (player.getItemCount('elixir') <= 0) return false;
            
            // Full heal
            player.heal(player.maxHp);
            
            // Remove all negative status effects
            const effectsToRemove = [
                StatusEffectType.Fire,
                StatusEffectType.Charm,
                StatusEffectType.Slow,
                StatusEffectType.Poison
            ];
            
            effectsToRemove.forEach(effect => {
                player.statusEffects.removeEffect(effect);
            });
            
            // Add energized effect
            player.statusEffects.addEffect(StatusEffectType.Energized);
            
            player.items.get('elixir')!.count--;
            return true;
        }
    },
    
    // Omamori (unlocked at CraftWork level 10)
    {
        id: 'omamori',
        name: 'おまもり',
        description: '行動不能状態・拘束中・食べられ中にのみ使える。即座にそれらの状態を解除し、HPを100%回復し、状態異常を解除',
        requiredLevel: 10,
        abilityType: AbilityType.CraftWork,
        experienceGain: 200,
        getCount: (player: Player) => {
            const craftworkLevel = player.abilitySystem.getAbility(AbilityType.CraftWork)?.level || 0;
            if (craftworkLevel < 10) return 0;
            return 1;
        },
        use: (player: Player) => {
            if (player.getItemCount('omamori') <= 0) return false;
            
            // Can only be used when knocked out, restrained, or eaten
            if (!player.isKnockedOut() && !player.isRestrained() && !player.isEaten()) {
                return false;
            }
            
            // Remove special states
            player.statusEffects.removeEffect(StatusEffectType.KnockedOut);
            player.statusEffects.removeEffect(StatusEffectType.Restrained);
            player.statusEffects.removeEffect(StatusEffectType.Eaten);
            
            // Full heal
            player.heal(player.maxHp);
            
            // Remove all negative status effects
            const effectsToRemove = [
                StatusEffectType.Fire,
                StatusEffectType.Charm,
                StatusEffectType.Slow,
                StatusEffectType.Poison
            ];
            
            effectsToRemove.forEach(effect => {
                player.statusEffects.removeEffect(effect);
            });
            
            player.items.get('omamori')!.count--;
            return true;
        }
    }
];

/**
 * Update player items based on ability levels
 */
export function updatePlayerItems(player: Player): void {
    EXTENDED_ITEMS.forEach(itemData => {
        const currentCount = itemData.getCount(player);
        
        // Update item in player's inventory
        const existingItem = player.items.get(itemData.id);
        if (existingItem) {
            existingItem.count = currentCount;
            existingItem.use = itemData.use;
        } else if (currentCount > 0) {
            // Add new item if it should be available
            player.items.set(itemData.id, {
                name: itemData.name,
                count: currentCount,
                description: itemData.description,
                use: itemData.use
            });
        }
    });
}