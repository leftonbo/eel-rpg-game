import { BossAction, BossData } from '../entities/Boss';
import { getLanguage, t } from '../i18n';

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

function humanizeIdentifier(identifier: string): string {
    const upperCaseSegments = new Set(['ai', 'hp', 'ko', 'mp']);

    return identifier
        .split('-')
        .filter(Boolean)
        .map(segment => upperCaseSegments.has(segment)
            ? segment.toUpperCase()
            : segment.charAt(0).toUpperCase() + segment.slice(1)
        )
        .join(' ');
}

function localizedDefault(jaDefault: string, enDefault: string): string {
    return getLanguage() === 'en' ? enDefault : jaDefault;
}

function tWithLanguageFallback(key: string, jaDefault: string, enDefault: string): string {
    return t(key, { defaultValue: localizedDefault(jaDefault, enDefault) });
}

function defaultActionMessage(actionName: string, index: number): string {
    if (index === 0) {
        return `{boss} uses ${actionName}!`;
    }

    if (index === 1) {
        return `{player} is caught in ${actionName}.`;
    }

    return `${actionName} continues to affect {player}.`;
}

function defaultSequenceMessage(displayName: string, sequenceName: string, index: number): string {
    if (sequenceName === 'battleStartMessages') {
        return index === 0
            ? `${displayName} appears!`
            : `${displayName} prepares for battle.`;
    }

    if (sequenceName === 'victoryMessages') {
        return index === 0
            ? `${displayName} is defeated.`
            : `The battle with ${displayName} ends.`;
    }

    return `${displayName} continues the scene.`;
}

function localizeBossAction(baseKey: string, action: BossAction): BossAction {
    const fallbackName = humanizeIdentifier(action.id);
    const localizedName = tWithLanguageFallback(
        `${baseKey}.actions.${action.id}.name`,
        action.name,
        fallbackName
    );
    const localizedAction: BossAction = {
        ...action,
        name: localizedName,
        description: tWithLanguageFallback(
            `${baseKey}.actions.${action.id}.description`,
            action.description,
            `Uses ${localizedName}.`
        ),
        messages: action.messages?.map((message, index) => (
            tWithLanguageFallback(
                `${baseKey}.actions.${action.id}.messages.${index}`,
                message,
                defaultActionMessage(localizedName, index)
            )
        ))
    };

    if (action.onPreUse) {
        localizedAction.onPreUse = (currentAction, boss, player, turn) => {
            const modifiedAction = action.onPreUse?.(currentAction, boss, player, turn);
            return modifiedAction ? localizeBossAction(baseKey, modifiedAction) : null;
        };
    }

    if (action.onUse) {
        localizedAction.onUse = (boss, player, turn) => {
            const messages = action.onUse?.(boss, player, turn) ?? [];
            return messages.map((message, index) => (
                tWithLanguageFallback(
                    `${baseKey}.actions.${action.id}.onUseMessages.${index}`,
                    message,
                    defaultActionMessage(localizedName, index + (action.messages?.length ?? 0))
                )
            ));
        };
    }

    return localizedAction;
}

function localizeBossData(bossData: BossData): BossData {
    const baseKey = `bosses.${bossData.id}`;
    const fallbackDisplayName = humanizeIdentifier(bossData.id);
    const displayName = tWithLanguageFallback(`${baseKey}.displayName`, bossData.displayName, fallbackDisplayName);

    return {
        ...bossData,
        displayName,
        description: tWithLanguageFallback(
            `${baseKey}.description`,
            bossData.description,
            `A boss known as ${displayName}.`
        ),
        questNote: tWithLanguageFallback(
            `${baseKey}.questNote`,
            bossData.questNote,
            `A request has arrived to investigate and subdue ${displayName}.`
        ),
        appearanceNote: bossData.appearanceNote
            ? tWithLanguageFallback(
                `${baseKey}.appearanceNote`,
                bossData.appearanceNote,
                `${displayName}'s appearance is recorded in the guild notes.`
            )
            : undefined,
        personality: bossData.personality
            ? bossData.personality.map((entry, index) => tWithLanguageFallback(
                `${baseKey}.personality.${index}`,
                entry,
                `${displayName} watches carefully.`
            ))
            : bossData.personality,
        guestCharacterInfo: bossData.guestCharacterInfo
            ? {
                ...bossData.guestCharacterInfo,
                characterName: bossData.guestCharacterInfo.characterName
                    ? tWithLanguageFallback(
                        `${baseKey}.guestCharacterInfo.characterName`,
                        bossData.guestCharacterInfo.characterName,
                        bossData.guestCharacterInfo.characterName
                    )
                    : undefined,
                creator: tWithLanguageFallback(
                    `${baseKey}.guestCharacterInfo.creator`,
                    bossData.guestCharacterInfo.creator ?? '',
                    bossData.guestCharacterInfo.creator ?? ''
                )
            }
            : undefined,
        victoryTrophy: bossData.victoryTrophy
            ? {
                name: tWithLanguageFallback(
                    `${baseKey}.victoryTrophy.name`,
                    bossData.victoryTrophy.name,
                    `${displayName} Trophy`
                ),
                description: tWithLanguageFallback(
                    `${baseKey}.victoryTrophy.description`,
                    bossData.victoryTrophy.description,
                    `A trophy earned by defeating ${displayName}.`
                )
            }
            : undefined,
        defeatTrophy: bossData.defeatTrophy
            ? {
                name: tWithLanguageFallback(
                    `${baseKey}.defeatTrophy.name`,
                    bossData.defeatTrophy.name,
                    `${displayName} Keepsake`
                ),
                description: tWithLanguageFallback(
                    `${baseKey}.defeatTrophy.description`,
                    bossData.defeatTrophy.description,
                    `A keepsake tied to being defeated by ${displayName}.`
                )
            }
            : undefined,
        actions: bossData.actions.map(action => localizeBossAction(baseKey, action)),
        aiStrategy: bossData.aiStrategy
            ? (boss, player, turn) => localizeBossAction(baseKey, bossData.aiStrategy!(boss, player, turn))
            : undefined,
        finishingMove: bossData.finishingMove
            ? () => bossData.finishingMove!().map((message, index) => tWithLanguageFallback(
                `${baseKey}.finishingMove.${index}`,
                message,
                index === 0
                    ? `${displayName} performs a finishing move.`
                    : `${displayName}'s finishing move continues.`
            ))
            : undefined,
        getDialogue: bossData.getDialogue
            ? (situation) => {
                const originalDialogue = bossData.getDialogue!(situation);
                return tWithLanguageFallback(
                    `${baseKey}.dialogues.${situation}`,
                    originalDialogue,
                    `${displayName} reacts to the battle.`
                );
            }
            : undefined,
        battleStartMessages: bossData.battleStartMessages?.map((message, index) => ({
            ...message,
            text: tWithLanguageFallback(
                `${baseKey}.battleStartMessages.${index}.text`,
                message.text,
                defaultSequenceMessage(displayName, 'battleStartMessages', index)
            )
        })),
        victoryMessages: bossData.victoryMessages?.map((message, index) => ({
            ...message,
            text: tWithLanguageFallback(
                `${baseKey}.victoryMessages.${index}.text`,
                message.text,
                defaultSequenceMessage(displayName, 'victoryMessages', index)
            )
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
