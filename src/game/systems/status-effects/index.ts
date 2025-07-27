import { StatusEffectType, StatusEffectConfig } from '../StatusEffectTypes';
import { coreStatesConfigs } from './core-states';
import { battleEffectsConfigs } from './battle-effects';
import { dreamDemonEffectsConfigs } from './dream-demon-effects';
import { batVampireEffectsConfigs } from './bat-vampire-effects';
import { fluffyDragonEffectsConfigs } from './fluffy-dragon-effects';
import { seraphMascotEffectsConfigs } from './seraph-mascot-effects';
import { dualJesterEffectsConfigs } from './dual-jester-effects';

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

    // Add bat vampire effects
    for (const [key, config] of batVampireEffectsConfigs) {
        allConfigs.set(key, config);
    }

    // Add fluffy dragon effects
    for (const [key, config] of fluffyDragonEffectsConfigs) {
        allConfigs.set(key, config);
    }

    // Add seraph mascot effects
    for (const [key, config] of seraphMascotEffectsConfigs) {
        allConfigs.set(key, config);
    }

    // Add dual jester effects
    for (const [key, config] of dualJesterEffectsConfigs) {
        allConfigs.set(key, config);
    }

    return allConfigs;
};

// Export the individual config groups for potential future use
export { coreStatesConfigs, battleEffectsConfigs, dreamDemonEffectsConfigs, batVampireEffectsConfigs, fluffyDragonEffectsConfigs, seraphMascotEffectsConfigs, dualJesterEffectsConfigs };
