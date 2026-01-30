import { BossData } from '../entities/Boss';
import { t } from '../i18n';

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

function localizeBossData(bossData: BossData): BossData {
    const baseKey = `bosses.${bossData.id}`;

    return {
        ...bossData,
        displayName: t(`${baseKey}.displayName`, { defaultValue: bossData.displayName }),
        description: t(`${baseKey}.description`, { defaultValue: bossData.description }),
        questNote: t(`${baseKey}.questNote`, { defaultValue: bossData.questNote }),
        appearanceNote: bossData.appearanceNote
            ? t(`${baseKey}.appearanceNote`, { defaultValue: bossData.appearanceNote })
            : undefined,
        personality: bossData.personality
            ? bossData.personality.map((entry, index) => t(`${baseKey}.personality.${index}`, { defaultValue: entry }))
            : bossData.personality,
        guestCharacterInfo: bossData.guestCharacterInfo
            ? {
                ...bossData.guestCharacterInfo,
                characterName: bossData.guestCharacterInfo.characterName
                    ? t(`${baseKey}.guestCharacterInfo.characterName`, { defaultValue: bossData.guestCharacterInfo.characterName })
                    : undefined,
                creator: t(`${baseKey}.guestCharacterInfo.creator`, { defaultValue: bossData.guestCharacterInfo.creator })
            }
            : undefined,
        victoryTrophy: bossData.victoryTrophy
            ? {
                name: t(`${baseKey}.victoryTrophy.name`, { defaultValue: bossData.victoryTrophy.name }),
                description: t(`${baseKey}.victoryTrophy.description`, { defaultValue: bossData.victoryTrophy.description })
            }
            : undefined,
        defeatTrophy: bossData.defeatTrophy
            ? {
                name: t(`${baseKey}.defeatTrophy.name`, { defaultValue: bossData.defeatTrophy.name }),
                description: t(`${baseKey}.defeatTrophy.description`, { defaultValue: bossData.defeatTrophy.description })
            }
            : undefined,
        actions: bossData.actions.map(action => ({
            ...action,
            name: t(`${baseKey}.actions.${action.id}.name`, { defaultValue: action.name }),
            description: t(`${baseKey}.actions.${action.id}.description`, { defaultValue: action.description }),
            messages: action.messages?.map((message, index) => (
                t(`${baseKey}.actions.${action.id}.messages.${index}`, { defaultValue: message })
            ))
        })),
        battleStartMessages: bossData.battleStartMessages?.map((message, index) => ({
            ...message,
            text: t(`${baseKey}.battleStartMessages.${index}.text`, { defaultValue: message.text })
        })),
        victoryMessages: bossData.victoryMessages?.map((message, index) => ({
            ...message,
            text: t(`${baseKey}.victoryMessages.${index}.text`, { defaultValue: message.text })
        }))
    };
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
    return Array.from(bossDataCache.values()).map(localizeBossData);
}

/**
 * 指定されたIDのボスデータを取得
 * @param id ボスのID
 * @returns 指定されたIDのボスデータ
 * @throws ボスデータが読み込まれていない場合
 */
export function getBossData(id: string): BossData {
    if (bossDataCache.has(id)) {
        return localizeBossData(bossDataCache.get(id)!);
    } else {
        throw new Error(`Boss data for ID ${id} not loaded. Please ensure loadAllBossData() is called first.`);
    }
}
