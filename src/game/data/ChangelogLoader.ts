export interface ChangelogMetadata {
    index: number;
    title: string;
    version: string;
    date: string;
    type: 'major' | 'minor' | 'patch' | 'hotfix';
}

interface ChangelogMarkdownModule {
    attributes: ChangelogMetadata;
    markdown: string;
}

/**
 * 更新履歴データの完全版インターフェース（メタデータ + コンテンツ）
 */
export interface ChangelogDocument extends ChangelogMetadata {
    content: string;
}

/**
 * 更新履歴モジュールloaderの型定義
 */
type ChangelogModuleLoader = () => Promise<ChangelogMarkdownModule>;

/**
 * 登録済みの更新履歴の生データ
 */
const modules = import.meta.glob('./changelogs/changelog-*.md') as Record<string, ChangelogModuleLoader>;

/**
 * 更新履歴データのキャッシュ
 */
const changelogCache: Map<number, ChangelogDocument> = new Map();

/**
 * ChangelogMetadata型チェック関数
 * @param obj チェック対象のオブジェクト
 * @returns ChangelogMetadataかどうか
 */
function isChangelogMetadata(obj: unknown): obj is ChangelogMetadata {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }
    
    const candidate = obj as Record<string, unknown>;
    
    return (
        typeof candidate.index === 'number' &&
        typeof candidate.title === 'string' &&
        typeof candidate.version === 'string' &&
        typeof candidate.date === 'string' &&
        typeof candidate.type === 'string' &&
        ['major', 'minor', 'patch', 'hotfix'].includes(candidate.type as string)
    );
}

/**
 * ChangelogMarkdownModule型チェック関数
 * @param obj チェック対象のオブジェクト
 * @returns ChangelogMarkdownModuleかどうか
 */
function isChangelogMarkdownModule(obj: unknown): obj is ChangelogMarkdownModule {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }
    
    const candidate = obj as Record<string, unknown>;
    
    return (
        typeof candidate.markdown === 'string' &&
        typeof candidate.attributes === 'object' &&
        candidate.attributes !== null &&
        isChangelogMetadata(candidate.attributes)
    );
}

/**
 * 全ての更新履歴データを読み込む
 */
export async function loadAllChangelogs(): Promise<void> {
    // 各更新履歴モジュールを読み込み、メタデータとコンテンツを抽出
    const changelogs = await Promise.all(
        Object.entries(modules).map(async ([filePath, loader]) => {
            try {
                const imported = await loader();
                
                if (!isChangelogMarkdownModule(imported)) {
                    throw new Error(`Invalid changelog module in ${filePath}: does not match ChangelogMarkdownModule interface`);
                }
                
                const changelogData: ChangelogDocument = {
                    ...imported.attributes,
                    content: imported.markdown
                };
                
                if (typeof changelogData.index !== 'number') {
                    throw new Error(`Changelog without valid index found in ${filePath}`);
                }
                
                return changelogData;
            } catch (error) {
                console.error(`Failed to load changelog from ${filePath}:`, error);
                throw error;
            }
        })
    );

    // 更新履歴インデックスをキーにしてMapに格納
    changelogs.forEach(changelog => {
        changelogCache.set(changelog.index, changelog);
    });
    
    console.log(`[ChangelogLoader] Loaded ${changelogs.length} changelog entries`);
}

/**
 * 全ての更新履歴データを取得（インデックス順でソート）
 * @returns 更新履歴データの配列
 */
export function getAllChangelogs(): ChangelogDocument[] {
    return Array.from(changelogCache.values()).sort((a, b) => b.index - a.index); // 新しい順
}

/**
 * 指定されたインデックスの更新履歴データを取得
 * @param index 更新履歴インデックス
 * @returns 指定されたインデックスの更新履歴データ
 * @throws 更新履歴データが読み込まれていない場合
 */
export function getChangelog(index: number): ChangelogDocument {
    if (changelogCache.has(index)) {
        const changelog = changelogCache.get(index)!;
        if (changelog) {
            return changelog;
        }
        throw new Error(`Changelog ${index} is invalid.`);
    }
    
    throw new Error(`Changelog ${index} not loaded. Call loadAllChangelogs() first.`);
}

/**
 * 最新の更新履歴インデックスを取得
 * @returns 最新の更新履歴インデックス
 */
export function getLatestChangelogIndex(): number {
    if (changelogCache.size === 0) {
        return -1; // 更新履歴がない場合
    }
    
    return Math.max(...changelogCache.keys());
}

/**
 * 指定されたインデックスより新しい更新履歴を取得
 * @param fromIndex 基準となるインデックス
 * @returns 指定されたインデックスより新しい更新履歴データの配列
 */
export function getNewChangelogs(fromIndex: number): ChangelogDocument[] {
    return getAllChangelogs().filter(changelog => changelog.index > fromIndex);
}

/**
 * 更新履歴が読み込まれているかチェック
 * @returns 更新履歴が読み込まれているかどうか
 */
export function isChangelogLoaded(): boolean {
    return changelogCache.size > 0;
}