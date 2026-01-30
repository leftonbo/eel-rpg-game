import { BossData } from '../entities/Boss';
import { getBossText } from '../i18n';

/**
 * ボスモジュールの型定義
 */
interface BossModule {
    [key: string]: BossData;
}

/**
 * Glob loaderの型定義
 */
type BossModuleLoader = () => Promise<BossModule>;

/**
 * 登録済みのボスモジュール（glob import）
 */
const modules = import.meta.glob('./bosses/*.ts') as Record<string, BossModuleLoader>;

/**
 * ボスデータのキャッシュ
 */
const bossDataCache: Map<string, BossData> = new Map();

type BossTextOverrides = Partial<{
    displayName: BossData['displayName'];
    description: BossData['description'];
    questNote: BossData['questNote'];
    appearanceNote: BossData['appearanceNote'];
    battleStartMessages: BossData['battleStartMessages'];
    victoryMessages: BossData['victoryMessages'];
    victoryTrophy: BossData['victoryTrophy'];
    defeatTrophy: BossData['defeatTrophy'];
    personality: BossData['personality'];
}>;

function applyBossTextOverrides(bossData: BossData, bossId: string): void {
    const text = getBossText<BossTextOverrides>(bossId);
    if (!text || typeof text !== 'object' || Array.isArray(text)) {
        return;
    }

    if (text.displayName) bossData.displayName = text.displayName;
    if (text.description) bossData.description = text.description;
    if (text.questNote) bossData.questNote = text.questNote;
    if (text.appearanceNote) bossData.appearanceNote = text.appearanceNote;
    if (text.battleStartMessages) bossData.battleStartMessages = text.battleStartMessages;
    if (text.victoryMessages) bossData.victoryMessages = text.victoryMessages;
    if (text.victoryTrophy) bossData.victoryTrophy = text.victoryTrophy;
    if (text.defeatTrophy) bossData.defeatTrophy = text.defeatTrophy;
    if (text.personality) bossData.personality = text.personality;
}

/**
 * BossData型チェック関数
 * @param obj チェック対象のオブジェクト
 * @returns BossDataかどうか
 */
function isBossData(obj: unknown): obj is BossData {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }
    
    const candidate = obj as Record<string, unknown>;
    
    return (
        typeof candidate.id === 'string' &&
        typeof candidate.displayName === 'string' &&
        typeof candidate.name === 'string' &&
        typeof candidate.description === 'string' &&
        typeof candidate.questNote === 'string' &&
        typeof candidate.maxHp === 'number' &&
        typeof candidate.attackPower === 'number' &&
        Array.isArray(candidate.actions)
    );
}

/**
 * ファイルパスからボスIDを抽出する関数
 * @param filePath ファイルパス (例: "./bosses/swamp-dragon.ts")
 * @returns ボスID (例: "swamp-dragon")
 */
function extractBossIdFromPath(filePath: string): string {
    const match = filePath.match(/\/bosses\/(.*?)\.ts$/);
    if (!match) {
        throw new Error(`Invalid boss file path: ${filePath}`);
    }
    return match[1];
}

/**
 * ボスIDからエクスポート名を生成する関数
 * @param bossId ボスID (例: "swamp-dragon")
 * @returns エクスポート名 (例: "swampDragonData")
 */
function generateExportName(bossId: string): string {
    return bossId
        .split('-')
        .map((word, index) => {
            if (index === 0) {
                return word;
            }
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join('') + 'Data';
}

/**
 * 全てのボスデータを非同期で読み込む関数
 */
export async function loadAllBossData(): Promise<void> {
    const bossEntries = await Promise.all(
        Object.entries(modules).map(async ([filePath, loader]) => {
            try {
                const bossId = extractBossIdFromPath(filePath);
                const exportName = generateExportName(bossId);
                
                const imported = await loader();
                
                if (!(exportName in imported)) {
                    throw new Error(`Export '${exportName}' not found in ${filePath}`);
                }
                
                const bossData = imported[exportName];
                
                if (!isBossData(bossData)) {
                    throw new Error(`Invalid boss data in ${filePath}: does not match BossData interface`);
                }

                applyBossTextOverrides(bossData, bossId);
                
                return { bossId, bossData };
            } catch (error) {
                console.error(`Failed to load boss data from ${filePath}:`, error);
                throw error;
            }
        })
    );
    
    // ボスデータをキャッシュに保存
    bossEntries.forEach(({ bossId, bossData }) => {
        bossDataCache.set(bossId, bossData);
    });
}

/**
 * 登録済みのボスIDリストを取得
 * @returns ボスIDの配列
 */
export function getRegisteredBossIds(): string[] {
    return Array.from(bossDataCache.keys());
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
