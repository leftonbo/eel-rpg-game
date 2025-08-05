import { StatusEffectType, StatusEffectConfig } from '../StatusEffectTypes';
import { coreStatesConfigs } from './core-states';
import { battleEffectsConfigs } from './battle-effects';
import { dreamDemonEffectsConfigs } from './dream-demon-effects';
import { batVampireEffectsConfigs } from './bat-vampire-effects';
import { fluffyDragonEffectsConfigs } from './fluffy-dragon-effects';
import { seraphMascotEffectsConfigs } from './seraph-mascot-effects';
import { dualJesterEffectsConfigs } from './dual-jester-effects';
import { demonDragonEffectsConfigs } from './demon-dragon-effects';
import { scorpionCarrierEffectsConfigs } from './scorpion-carrier-effects';
import { mikanDragonEffectsConfigs } from './mikan-dragon-effects';
import { seaKrakenEffectsConfigs } from './sea-kraken-effects';
import { aquaSerpentEffectsConfigs } from './aqua-serpent-effects';
import { cleanMasterEffectsConfigs } from './clean-master-effects';
import { darkGhostEffectsConfigs } from './dark-ghost-effects';
import { undergroundWormEffectsConfigs } from './underground-worm-effects';

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

    // Add scorpion carrier effects
    scorpionCarrierEffectsConfigs.forEach(config => {
        allConfigs.set(config.type, config);
    });

    // Add mikan dragon effects
    mikanDragonEffectsConfigs.forEach(config => {
        allConfigs.set(config.type, config);
    });

    // Add sea kraken effects
    seaKrakenEffectsConfigs.forEach(config => {
        allConfigs.set(config.type, config);
    });

    // Add aqua serpent effects
    aquaSerpentEffectsConfigs.forEach(config => {
        allConfigs.set(config.type, config);
    });

    // Add clean master effects
    cleanMasterEffectsConfigs.forEach(config => {
        allConfigs.set(config.type, config);
    });

    // Add dark ghost effects
    darkGhostEffectsConfigs.forEach(config => {
        allConfigs.set(config.type, config);
    });

    // Add underground worm effects
    undergroundWormEffectsConfigs.forEach(config => {
        allConfigs.set(config.type, config);
    });

    return allConfigs;
};
