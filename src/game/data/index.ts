import { BossData } from '../entities/Boss';
import { swampDragonData } from './bosses/swamp-dragon';
import { darkGhostData } from './bosses/dark-ghost';
import { mechSpiderData } from './bosses/mech-spider';
import { dreamDemonData } from './bosses/dream-demon';

export const bosses: Map<string, BossData> = new Map([
    ['swamp-dragon', swampDragonData],
    ['dark-ghost', darkGhostData],
    ['mech-spider', mechSpiderData],
    ['dream-demon', dreamDemonData]
]);

export function getBossData(id: string): BossData | undefined {
    return bosses.get(id);
}

export function getAllBossData(): BossData[] {
    return Array.from(bosses.values());
}

export { swampDragonData, darkGhostData, mechSpiderData, dreamDemonData };