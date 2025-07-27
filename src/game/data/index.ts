import { BossData } from '../entities/Boss';

/**
 * 登録済みのボスの ID リスト
 */
export const registeredBossIds: string[] = [
    'swamp-dragon',
    'dark-ghost',
    'mech-spider',
    'dream-demon',
    'scorpion-carrier',
    'mikan-dragon',
    'sea-kraken',
    'aqua-serpent',
    'clean-master',
    'underground-worm',
    'bat-vampire',
    'fluffy-dragon'
];

/**
 * ボスデータのキャッシュ
 */
const bossDataCache: Map<string, BossData> = new Map();

export async function loadAllBossData(): Promise<void> {
    for (const bossId of registeredBossIds) {
        try {
            await loadBossData(bossId);
        } catch (error) {
            console.error(`Failed to load boss data for ID: ${bossId}`, error);
        }
    }
}

/**
 * ボスデータを非同期で読み込む関数
 * @param id ボスのID
 * @returns ボスデータ
 */
async function loadBossData(id: string): Promise<BossData> {
    // キャッシュを確認
    if (bossDataCache.has(id)) {
        return bossDataCache.get(id)!;
    }

    // ボスデータを動的にインポート
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
        case 'fluffy-dragon':
            bossData = (await import('./bosses/fluffy-dragon')).fluffyDragonData;
            break;
        default:
            throw new Error(`Unknown boss ID: ${id}`);
    }
    
    // キャッシュに保存
    bossDataCache.set(id, bossData);
    return bossData;
}

/**
 * 全てのボスデータを取得
 * @returns ボスデータの配列
 */
export function getAllBossData(): BossData[] {
    return Array.from(bossDataCache.values());
}

/**
 * 指定されたIDのボスデータを取得
 * @param id ボスのID
 * @returns 指定されたIDのボスデータ
 * @throws ボスデータが読み込まれていない場合
 */
export function getBossData(id: string): BossData {
    if (bossDataCache.has(id)) {
        return bossDataCache.get(id)!;
    } else {
        throw new Error(`Boss data for ID ${id} not loaded. Please ensure loadAllBossData() is called first.`);
    }
}
