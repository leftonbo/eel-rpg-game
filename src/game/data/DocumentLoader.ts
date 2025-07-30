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
    unlocked: boolean;
    isRead: boolean;
}

/**
 * 登録済みの文書の生データ
 */
const modules = import.meta.glob('./documents/*.md');

/**
 * 文書データのキャッシュ
 */
const documentCache: Map<string, LibraryDocument> = new Map();

/**
 * 全ての文書データを読み込む
 */
export async function loadAllDocuments(): Promise<void> {
    // 各文書モジュールを読み込み、メタデータとコンテンツを抽出
    const documents = await Promise.all(
        Object.entries(modules).map(async ([_path, loader]) => {
            const imported = await (loader as () => Promise<unknown>)();
            const module = imported as MarkdownModule;
            const docData: LibraryDocument = {
                ...(module.attributes as LibraryDocumentMetadata),
                content: module.markdown,
                unlocked: false,
                isRead: false
            };
            return docData;
        })
    );

    // 文書IDをキーにしてMapに格納
    documents.forEach(doc => {
        if (doc.id) {
            documentCache.set(doc.id, doc);
        } else {
            console.warn(`Document without ID found:`, doc);
        }
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
        return documentCache.get(id)!;
    }
    throw new Error(`Document ${id} not loaded. Call loadAllDocuments() first.`);
}

/**
 * 解禁済みで未読の文書数を取得
 * @returns 未読文書数
 */
export function getUnreadDocumentCount(): number {
    const allDocuments = getAllDocuments();
    return allDocuments.filter(doc => doc.unlocked && !doc.isRead).length;
}

/**
 * 解禁済みで未読の文書IDリストを取得
 * @returns 未読文書IDの配列
 */
export function getUnreadDocumentIds(): string[] {
    const allDocuments = getAllDocuments();
    return allDocuments
        .filter(doc => doc.unlocked && !doc.isRead)
        .map(doc => doc.id);
}