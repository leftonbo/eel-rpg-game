import { BossData } from '../entities/Boss';

// Dynamic boss data loader cache
const bossDataCache: Map<string, BossData> = new Map();

// Boss metadata cache
const bossMetadataCache: Map<string, BossMetadata> = new Map();

// Boss metadata for display purposes (lightweight data only)
export interface BossMetadata {
    id: string;
    name: string;
    displayName: string;
    description: string;
    questNote: string;
    maxHp: number;
    attackPower: number;
    icon: string;
    explorerLevelRequired: number;
    victoryTrophy?: {
        name: string;
        description: string;
    };
    defeatTrophy?: {
        name: string;
        description: string;
    };
    guestCharacterInfo?: {
        creator: string;
    };
}

// Auto-generate metadata from boss data
async function generateBossMetadata(id: string): Promise<BossMetadata> {
    const bossData = await loadBossData(id);
    
    return {
        id: bossData.id,
        name: bossData.name,
        displayName: bossData.displayName,
        description: bossData.description,
        questNote: bossData.questNote || '',
        maxHp: bossData.maxHp,
        attackPower: bossData.attackPower,
        icon: bossData.icon || '',
        explorerLevelRequired: bossData.explorerLevelRequired || 0,
        victoryTrophy: bossData.victoryTrophy,
        defeatTrophy: bossData.defeatTrophy,
        guestCharacterInfo: bossData.guestCharacterInfo
    };
}

// Dynamic boss data loader
async function loadBossData(id: string): Promise<BossData> {
    if (bossDataCache.has(id)) {
        return bossDataCache.get(id)!;
    }

    let bossData: BossData;
    switch (id) {
        case 'swamp-dragon':
            bossData = (await import('./bosses/swamp-dragon')).swampDragonData;
            break;
        case 'dark-ghost':
            bossData = (await import('./bosses/dark-ghost')).darkGhostData;
            break;
        case 'mech-spider':
            bossData = (await import('./bosses/mech-spider')).mechSpiderData;
            break;
        case 'dream-demon':
            bossData = (await import('./bosses/dream-demon')).dreamDemonData;
            break;
        case 'scorpion-carrier':
            bossData = (await import('./bosses/scorpion-carrier')).scorpionCarrierData;
            break;
        case 'mikan-dragon':
            bossData = (await import('./bosses/mikan-dragon')).mikanDragonData;
            break;
        case 'sea-kraken':
            bossData = (await import('./bosses/sea-kraken')).seaKrakenData;
            break;
        case 'aqua-serpent':
            bossData = (await import('./bosses/aqua-serpent')).aquaSerpentData;
            break;
        case 'clean-master':
            bossData = (await import('./bosses/clean-master')).cleanMasterData;
            break;
        case 'underground-worm':
            bossData = (await import('./bosses/underground-worm')).undergroundWormData;
            break;
        case 'bat-vampire':
            bossData = (await import('./bosses/bat-vampire')).batVampireData;
            break;
        default:
            throw new Error(`Unknown boss ID: ${id}`);
    }

    bossDataCache.set(id, bossData);
    return bossData;
}

// Updated synchronous function - now async
export async function getBossData(id: string): Promise<BossData> {
    return await loadBossData(id);
}

// Get boss metadata for selection screen (lightweight)
export async function getBossMetadata(id: string): Promise<BossMetadata | undefined> {
    if (bossMetadataCache.has(id)) {
        return bossMetadataCache.get(id);
    }
    
    try {
        const metadata = await generateBossMetadata(id);
        bossMetadataCache.set(id, metadata);
        return metadata;
    } catch (error) {
        console.error(`Failed to generate metadata for boss: ${id}`, error);
        return undefined;
    }
}

// Get all boss metadata for selection screen
export async function getAllBossMetadata(): Promise<BossMetadata[]> {
    const bossIds = [
        'swamp-dragon', 'dark-ghost', 'mech-spider', 'dream-demon',
        'scorpion-carrier', 'mikan-dragon', 'sea-kraken', 'aqua-serpent',
        'clean-master', 'underground-worm', 'bat-vampire'
    ];
    
    const metadataPromises = bossIds.map(id => getBossMetadata(id));
    const metadataResults = await Promise.all(metadataPromises);
    
    return metadataResults.filter((metadata): metadata is BossMetadata => metadata !== undefined);
}

/**
 * @deprecated Use getBossData() instead. This synchronous function only returns cached data.
 * Legacy synchronous function for backward compatibility.
 * @param id Boss ID
 * @returns Boss data if cached, undefined otherwise
 */
export function getBossDataSync(id: string): BossData | undefined {
    return bossDataCache.get(id);
}

/**
 * @deprecated Use getAllBossMetadata() for boss selection or ensure boss data is loaded first.
 * Legacy synchronous function that only returns cached data.
 * @returns Array of cached boss data
 */
export function getAllBossDataSync(): BossData[] {
    return Array.from(bossDataCache.values());
}