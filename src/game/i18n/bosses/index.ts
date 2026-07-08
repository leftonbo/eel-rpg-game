import { aquaSerpentTranslations } from './aqua-serpent';
import { batVampireTranslations } from './bat-vampire';
import { BossTranslationData } from '../types';
import { bossMessageTranslations } from './boss-message-translations';
import { cleanMasterTranslations } from './clean-master';
import { darkGhostTranslations } from './dark-ghost';
import { demonDragonTranslations } from './demon-dragon';
import { dreamDemonTranslations } from './dream-demon';
import { dualJesterTranslations } from './dual-jester';
import { fluffyDragonTranslations } from './fluffy-dragon';
import { fluffyNoirTranslations } from './fluffy-noir';
import { generatedActionTranslations } from './generated-action-translations';
import { mechSpiderTranslations } from './mech-spider';
import { mikanDragonTranslations } from './mikan-dragon';
import { otherworldCentipedeTranslations } from './otherworld-centipede';
import { scorpionCarrierTranslations } from './scorpion-carrier';
import { seaKrakenTranslations } from './sea-kraken';
import { seraphMascotTranslations } from './seraph-mascot';
import { slimeDragonTranslations } from './slime-dragon';
import { swampDragonTranslations } from './swamp-dragon';
import { thermalArchiverTranslations } from './thermal-archiver';
import { tongueDragonTranslations } from './tongue-dragon';
import { undergroundWormTranslations } from './underground-worm';
import { yumewataMellowTranslations } from './yumewata-mellow';

function mergeActions(
    ...actionMaps: Array<BossTranslationData['actions'] | undefined>
): BossTranslationData['actions'] {
    const merged: NonNullable<BossTranslationData['actions']> = {};

    actionMaps.forEach(actionMap => {
        Object.entries(actionMap ?? {}).forEach(([actionId, actionTranslation]) => {
            merged[actionId] = {
                ...merged[actionId],
                ...actionTranslation
            };
        });
    });

    return Object.keys(merged).length > 0 ? merged : undefined;
}

function mergeEnglishBossTranslation(bossId: string, translation: BossTranslationData): BossTranslationData {
    const generatedTranslation = generatedActionTranslations[bossId] ?? {};
    const messageTranslation = bossMessageTranslations[bossId] ?? {};

    return {
        ...generatedTranslation,
        ...messageTranslation,
        ...translation,
        actions: mergeActions(
            generatedTranslation.actions,
            messageTranslation.actions,
            translation.actions
        )
    };
}

export const bossTranslations = {
    ja: {
        'aqua-serpent': aquaSerpentTranslations.ja,
        'bat-vampire': batVampireTranslations.ja,
        'clean-master': cleanMasterTranslations.ja,
        'dark-ghost': darkGhostTranslations.ja,
        'demon-dragon': demonDragonTranslations.ja,
        'dream-demon': dreamDemonTranslations.ja,
        'dual-jester': dualJesterTranslations.ja,
        'fluffy-dragon': fluffyDragonTranslations.ja,
        'mech-spider': mechSpiderTranslations.ja,
        'mikan-dragon': mikanDragonTranslations.ja,
        'scorpion-carrier': scorpionCarrierTranslations.ja,
        'sea-kraken': seaKrakenTranslations.ja,
        'seraph-mascot': seraphMascotTranslations.ja,
        'slime-dragon': slimeDragonTranslations.ja,
        'swamp-dragon': swampDragonTranslations.ja,
        'thermal-archiver': thermalArchiverTranslations.ja,
        'tongue-dragon': tongueDragonTranslations.ja,
        'underground-worm': undergroundWormTranslations.ja,
        'otherworld-centipede': otherworldCentipedeTranslations.ja,
        'yumewata-mellow': yumewataMellowTranslations.ja,
        'fluffy-noir': fluffyNoirTranslations.ja
    },
    en: {
        'aqua-serpent': mergeEnglishBossTranslation('aqua-serpent', aquaSerpentTranslations.en),
        'bat-vampire': mergeEnglishBossTranslation('bat-vampire', batVampireTranslations.en),
        'clean-master': mergeEnglishBossTranslation('clean-master', cleanMasterTranslations.en),
        'dark-ghost': mergeEnglishBossTranslation('dark-ghost', darkGhostTranslations.en),
        'demon-dragon': mergeEnglishBossTranslation('demon-dragon', demonDragonTranslations.en),
        'dream-demon': mergeEnglishBossTranslation('dream-demon', dreamDemonTranslations.en),
        'dual-jester': mergeEnglishBossTranslation('dual-jester', dualJesterTranslations.en),
        'fluffy-dragon': mergeEnglishBossTranslation('fluffy-dragon', fluffyDragonTranslations.en),
        'mech-spider': mergeEnglishBossTranslation('mech-spider', mechSpiderTranslations.en),
        'mikan-dragon': mergeEnglishBossTranslation('mikan-dragon', mikanDragonTranslations.en),
        'scorpion-carrier': mergeEnglishBossTranslation('scorpion-carrier', scorpionCarrierTranslations.en),
        'sea-kraken': mergeEnglishBossTranslation('sea-kraken', seaKrakenTranslations.en),
        'seraph-mascot': mergeEnglishBossTranslation('seraph-mascot', seraphMascotTranslations.en),
        'slime-dragon': mergeEnglishBossTranslation('slime-dragon', slimeDragonTranslations.en),
        'swamp-dragon': mergeEnglishBossTranslation('swamp-dragon', swampDragonTranslations.en),
        'thermal-archiver': mergeEnglishBossTranslation('thermal-archiver', thermalArchiverTranslations.en),
        'tongue-dragon': mergeEnglishBossTranslation('tongue-dragon', tongueDragonTranslations.en),
        'underground-worm': mergeEnglishBossTranslation('underground-worm', undergroundWormTranslations.en),
        'otherworld-centipede': mergeEnglishBossTranslation('otherworld-centipede', otherworldCentipedeTranslations.en),
        'yumewata-mellow': mergeEnglishBossTranslation('yumewata-mellow', yumewataMellowTranslations.en),
        'fluffy-noir': mergeEnglishBossTranslation('fluffy-noir', fluffyNoirTranslations.en)
    }
};
