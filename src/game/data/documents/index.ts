import { LibraryDocumentMetadata } from '../../../types/markdown';

/**
 * 文書データの完全版インターフェース（メタデータ + コンテンツ）
 */
export interface LibraryDocument extends LibraryDocumentMetadata {
    content: string;
    unlocked: boolean;
}

/**
 * 登録済みの文書IDリスト
 */
export const registeredDocumentIds: string[] = [
    'welcome-document',
    'defeat-reflection'
];

/**
 * 文書データのキャッシュ
 */
const documentCache: Map<string, LibraryDocument> = new Map();

/**
 * 全ての文書データを読み込む
 */
export async function loadAllDocuments(): Promise<void> {
    for (const docId of registeredDocumentIds) {
        try {
            await loadDocument(docId);
        } catch (error) {
            console.error(`Failed to load document: ${docId}`, error);
        }
    }
}

/**
 * 指定された文書を動的に読み込む
 * @param id 文書ID
 * @returns 文書データ
 */
async function loadDocument(id: string): Promise<LibraryDocument> {
    // キャッシュを確認
    if (documentCache.has(id)) {
        return documentCache.get(id)!;
    }

    // 文書データを動的にインポート
    let docData: LibraryDocument;
    switch (id) {
        case 'welcome-document':
            const welcomeDoc = await import('./welcome-document.md');
            docData = {
                ...(welcomeDoc.attributes as LibraryDocumentMetadata),
                content: welcomeDoc.markdown,
                unlocked: false
            };
            break;
        case 'defeat-reflection':
            const defeatDoc = await import('./defeat-reflection.md');
            docData = {
                ...(defeatDoc.attributes as LibraryDocumentMetadata),
                content: defeatDoc.markdown,
                unlocked: false
            };
            break;
        default:
            throw new Error(`Unknown document ID: ${id}`);
    }
    
    // キャッシュに保存
    documentCache.set(id, docData);
    return docData;
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