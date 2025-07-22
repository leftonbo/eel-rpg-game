import { BossData } from '../entities/Boss';
import { swampDragonData } from './bosses/swamp-dragon';
import { darkGhostData } from './bosses/dark-ghost';
import { mechSpiderData } from './bosses/mech-spider';
import { dreamDemonData } from './bosses/dream-demon';
import { scorpionCarrierData } from './bosses/scorpion-carrier';
import { mikanDragonData } from './bosses/mikan-dragon';
import { seaKrakenData } from './bosses/sea-kraken';
import { aquaSerpentData } from './bosses/aqua-serpent';
import { cleanMasterData } from './bosses/clean-master';
import { batVampireData } from './bosses/bat-vampire';

export const bosses: Map<string, BossData> = new Map([
    ['swamp-dragon', swampDragonData],
    ['dark-ghost', darkGhostData],
    ['mech-spider', mechSpiderData],
    ['dream-demon', dreamDemonData],
    ['scorpion-carrier', scorpionCarrierData],
    ['mikan-dragon', mikanDragonData],
    ['sea-kraken', seaKrakenData],
    ['aqua-serpent', aquaSerpentData],
    ['clean-master', cleanMasterData],
    ['bat-vampire', batVampireData]
]);

export function getBossData(id: string): BossData | undefined {
    return bosses.get(id);
}

export function getAllBossData(): BossData[] {
    return Array.from(bosses.values());
}

export { swampDragonData, darkGhostData, mechSpiderData, dreamDemonData, scorpionCarrierData, mikanDragonData, seaKrakenData, aquaSerpentData, cleanMasterData, batVampireData };