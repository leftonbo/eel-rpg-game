import { StatusEffectType, StatusEffectConfig } from '../StatusEffectTypes';
import { coreStatesConfigs } from './core-states';
import { battleEffectsConfigs } from './battle-effects';
import { dreamDemonEffectsConfigs } from './dream-demon-effects';

// Aggregate all status effect configurations
export const createStatusEffectConfigs = (): Map<StatusEffectType, StatusEffectConfig> => {
    const allConfigs = new Map<StatusEffectType, StatusEffectConfig>();

    // Add core states
    for (const [key, config] of coreStatesConfigs) {
        allConfigs.set(key, config);
    }

    // Add battle effects
    for (const [key, config] of battleEffectsConfigs) {
        allConfigs.set(key, config);
    }

    // Add dream demon effects
    for (const [key, config] of dreamDemonEffectsConfigs) {
        allConfigs.set(key, config);
    }

    return allConfigs;
};

// Export the individual config groups for potential future use
export { coreStatesConfigs, battleEffectsConfigs, dreamDemonEffectsConfigs };