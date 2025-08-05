import { StatusEffectType, StatusEffectConfig } from '../StatusEffectTypes';
import { coreStatesConfigs } from './core-states';
import { battleEffectsConfigs } from './battle-effects';
import { dreamDemonEffectsConfigs } from './dream-demon-effects';
import { batVampireEffectsConfigs } from './bat-vampire-effects';
import { fluffyDragonEffectsConfigs } from './fluffy-dragon-effects';
import { seraphMascotEffectsConfigs } from './seraph-mascot-effects';
import { dualJesterEffectsConfigs } from './dual-jester-effects';
import { demonDragonEffectsConfigs } from './demon-dragon-effects';

// Aggregate all status effect configurations
export const createStatusEffectConfigs = (): Map<StatusEffectType, StatusEffectConfig> => {
    const allConfigs = new Map<StatusEffectType, StatusEffectConfig>();

    // Add core states
    coreStatesConfigs.forEach(config => {
        allConfigs.set(config.type, config);
    });

    // Add battle effects
    battleEffectsConfigs.forEach(config => {
        allConfigs.set(config.type, config);
    });

    // Add dream demon effects
    dreamDemonEffectsConfigs.forEach(config => {
        allConfigs.set(config.type, config);
    });

    // Add bat vampire effects
    batVampireEffectsConfigs.forEach(config => {
        allConfigs.set(config.type, config);
    });

    // Add fluffy dragon effects
    fluffyDragonEffectsConfigs.forEach(config => {
        allConfigs.set(config.type, config);
    });

    // Add seraph mascot effects
    seraphMascotEffectsConfigs.forEach(config => {
        allConfigs.set(config.type, config);
    });

    // Add dual jester effects
    dualJesterEffectsConfigs.forEach(config => {
        allConfigs.set(config.type, config);
    });

    // Add demon dragon effects
    demonDragonEffectsConfigs.forEach(config => {
        allConfigs.set(config.type, config);
    });

    return allConfigs;
};
