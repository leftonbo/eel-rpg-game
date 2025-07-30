import { Player } from '../entities/Player';

export interface LibraryDocumentMetadata {
    id: string;
    title: string;
    type: 'diary' | 'strategy' | 'reflection' | 'default';
    requiredExplorerLevel?: number;
    requiredBossDefeats?: string[];
    requiredBossLosses?: string[];
}

interface MarkdownModule {
    attributes: LibraryDocumentMetadata;
    markdown: string;
}

/**
 * 文書データの完全版インターフェース（メタデータ + コンテンツ）
 */
export interface LibraryDocument extends LibraryDocumentMetadata {
    content: string;
}

/**
 * ドキュメントモジュールloaderの型定義
 */
type DocumentModuleLoader = () => Promise<MarkdownModule>;

/**
 * 登録済みの文書の生データ
 */
const modules = import.meta.glob('./documents/*.md') as Record<string, DocumentModuleLoader>;

/**
 * 文書データのキャッシュ
 */
const documentCache: Map<string, LibraryDocument> = new Map();

/**
 * LibraryDocumentMetadata型チェック関数
 * @param obj チェック対象のオブジェクト
 * @returns LibraryDocumentMetadataかどうか
 */
function isLibraryDocumentMetadata(obj: unknown): obj is LibraryDocumentMetadata {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }
    
    const candidate = obj as Record<string, unknown>;
    
    return (
        typeof candidate.id === 'string' &&
        typeof candidate.title === 'string' &&
        typeof candidate.type === 'string'
    );
}

/**
 * MarkdownModule型チェック関数
 * @param obj チェック対象のオブジェクト
 * @returns MarkdownModuleかどうか
 */
function isMarkdownModule(obj: unknown): obj is MarkdownModule {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }
    
    const candidate = obj as Record<string, unknown>;
    
    return (
        typeof candidate.markdown === 'string' &&
        typeof candidate.attributes === 'object' &&
        candidate.attributes !== null &&
        isLibraryDocumentMetadata(candidate.attributes)
    );
}

/**
 * 全ての文書データを読み込む
 */
export async function loadAllDocuments(): Promise<void> {
    // 各文書モジュールを読み込み、メタデータとコンテンツを抽出
    const documents = await Promise.all(
        Object.entries(modules).map(async ([filePath, loader]) => {
            try {
                const imported = await loader();
                
                if (!isMarkdownModule(imported)) {
                    throw new Error(`Invalid markdown module in ${filePath}: does not match MarkdownModule interface`);
                }
                
                const docData: LibraryDocument = {
                    ...imported.attributes,
                    content: imported.markdown
                };
                
                if (!docData.id) {
                    throw new Error(`Document without ID found in ${filePath}`);
                }
                
                return docData;
            } catch (error) {
                console.error(`Failed to load document from ${filePath}:`, error);
                throw error;
            }
        })
    );

    // 文書IDをキーにしてMapに格納
    documents.forEach(doc => {
        documentCache.set(doc.id, doc);
    });
}

/**
 * 全ての文書データを取得
 * @returns 文書データの配列
 */
export function getAllDocuments(): LibraryDocument[] {
    return Array.from(documentCache.values());
}

/**
 * 指定されたIDの文書データを取得
 * @param id 文書ID
 * @returns 指定されたIDの文書データ
 * @throws 文書データが読み込まれていない場合
 */
export function getDocument(id: string): LibraryDocument {
    if (documentCache.has(id)) {
        const doc = documentCache.get(id)!;
        if (doc) {
            return doc;
        }
        throw new Error(`Document ${id} is invalid.`);
    }
    
    throw new Error(`Document ${id} not loaded. Call loadAllDocuments() first.`);
}

/**
 * プレイヤーの状態に基づいて未読文書数を計算
 * @param explorerLevel エクスプローラーレベル
 * @param defeatedBosses 撃破済みボスID配列
 * @param lostToBosses 敗北済みボスID配列
 * @returns 未読文書数
 */
export function getUnreadCountForPlayer(
    player: Player,
    explorerLevel: number,
    defeatedBosses: string[],
    lostToBosses: string[]
): number {
    const allDocuments = getAllDocuments();
    
    // 解禁済み文書をフィルタ
    const unlockedDocuments = allDocuments.filter(doc => {
        const levelOk = !doc.requiredExplorerLevel || explorerLevel >= doc.requiredExplorerLevel;
        let bossDefeatsOk = true;
        if (doc.requiredBossDefeats && doc.requiredBossDefeats.length > 0) {
            bossDefeatsOk = doc.requiredBossDefeats.every(bossId => 
                defeatedBosses.includes(bossId)
            );
        }
        let bossLossesOk = true;
        if (doc.requiredBossLosses && doc.requiredBossLosses.length > 0) {
            bossLossesOk = doc.requiredBossLosses.every(bossId => 
                lostToBosses.includes(bossId)
            );
        }
        return levelOk && bossDefeatsOk && bossLossesOk;
    });

    var readDocuments = player.getReadDocuments();
    
    // 未読文書数を計算
    return unlockedDocuments.filter(doc => !readDocuments.has(doc.id)).length;
}