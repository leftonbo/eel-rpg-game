import { Game } from '../Game';
import { BaseOutGameScene } from './BaseOutGameScene';
import { getBossData } from '../data';
import { BootstrapMarkdownRenderer } from '../utils/BootstrapMarkdownRenderer';
import { getAllDocuments, LibraryDocument, loadAllDocuments } from '../data/DocumentLoader';
import { Player } from '../entities/Player';


interface LibraryDocumentStatus extends LibraryDocument {
    unlocked: boolean; // 文書が解禁されているか
    isRead: boolean; // 既読状態
}

export class OutGameLibraryScene extends BaseOutGameScene {
    private documents: LibraryDocumentStatus[] = [];
    
    constructor(game: Game) {
        super(game, 'out-game-library-screen');
        this.initializeDocuments().then(() => {
            this.setupEventListeners();
        });
    }
    
    /**
     * シーンに入った時の処理
     */
    enter(): void {
        console.log('Entered OutGameLibraryScene');
        
        // ナビゲーションバーのアクティブ状態更新
        this.updateNavigationActiveState();
        
        // 資料庫を更新
        this.updateLibrary();
        
        // 上部メニューの未読バッジを更新
        this.updateNavigationUnreadBadge();
    }
    
    /**
     * 文書データの初期化（Markdownファイルからの動的読み込み）
     */
    private async initializeDocuments(): Promise<void> {
        try {
            await loadAllDocuments();
            this.documents = this.getAllDocuments();
        } catch (error) {
            console.error('Failed to load documents:', error);
            this.documents = [];
        }
    }
    
    private getAllDocuments(): LibraryDocumentStatus[] {
        return getAllDocuments().map(doc => ({
            ...doc,
            // この時点では Player は初期化されていないため、一旦フラグを全て false に設定
            unlocked: false,
            isRead: false,
        }));
    }
    
    /**
     * イベントリスナーの設定
     */
    private setupEventListeners(): void {
        // 文書選択イベント（動的に追加される要素用）
        document.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            // クリックされた要素から最も近い .library-document-btn を探す
            const button = target.closest('.library-document-btn') as HTMLElement;
            if (button) {
                const documentId = button.dataset.documentId;
                if (documentId) {
                    this.showDocument(documentId);
                }
            }
        });
    }
    
    /**
     * 資料庫の更新
     */
    private updateLibrary(): void {
        this.updateDocumentAvailability();
        this.renderDocumentList();
        this.clearDocumentContent();
    }
    
    /**
     * 文書の利用可能性を更新
     */
    private updateDocumentAvailability(): void {
        const player = this.game.getPlayer();
        const explorerLevel = player.getExplorerLevel();
        const defeatedBosses = player.memorialSystem.getVictoriousBossIds();
        const lostToBosses = player.memorialSystem.getDefeatedBossIds();
        
        this.documents.forEach(doc => {
            doc.unlocked = this.checkDocumentUnlockConditions(
                doc, explorerLevel, defeatedBosses, lostToBosses
            );
            
            doc.isRead = this.checkDocumentReadStatus(doc.id, player);
        });
    }
    
    /**
     * 文書のロック解除条件をチェック
     * @param doc 文書データ
     * @param explorerLevel エクスプローラーレベル
     * @param defeatedBosses 敵ボス撃破リスト
     * @param lostToBosses 敵ボス敗北リスト
     * @returns ロック解除されているかどうか
     */
    private checkDocumentUnlockConditions(
        doc: LibraryDocumentStatus,
        explorerLevel: number,
        defeatedBosses: string[],
        lostToBosses: string[]
    ): boolean {
        // エクスプローラーレベル要求チェック
        const levelOk = !doc.requiredExplorerLevel || explorerLevel >= doc.requiredExplorerLevel;

        // 必要ボス撃破チェック
        let bossDefeatsOk = true;
        if (doc.requiredBossDefeats && doc.requiredBossDefeats.length > 0) {
            bossDefeatsOk = doc.requiredBossDefeats.every(bossId => defeatedBosses.includes(bossId)
            );
        }

        // 必要ボス敗北チェック
        let bossLossesOk = true;
        if (doc.requiredBossLosses && doc.requiredBossLosses.length > 0) {
            bossLossesOk = doc.requiredBossLosses.every(bossId => lostToBosses.includes(bossId)
            );
        }

        return levelOk && bossDefeatsOk && bossLossesOk;
    }
    
    /**
     * 文書の既読状態をチェック
     * @param documentId 文書ID
     * @param player プレイヤーインスタンス
     * @returns 既読かどうか
     */
    private checkDocumentReadStatus(documentId: string, player: Player): boolean {
        return player.getReadDocuments().has(documentId);
    }

    /**
     * ボス要求条件を表示用文字列に変換
     * @param bossIds ボスIDの配列
     * @param type 条件の種類（defeat: 敗北, victory: 撃破）
     * @returns 表示用文字列
     */
    private renderBossRequirements(bossIds: string[], type: 'defeat' | 'victory'): string {
        return bossIds.map(bossId => {
            try {
                const bossData = getBossData(bossId);
                return `${bossData.name}${type === 'defeat' ? '敗北' : '撃破'}`;
            } catch (error) {
                console.error(`Error fetching boss data for ID "${bossId}":`, error);
                return `${bossId}${type === 'defeat' ? '敗北' : '撃破'}(データ不明)`;
            }
        }).join(', ');
    }
    
    /**
     * 文書IDから文書タイプを判定
     * @param documentId 文書ID
     * @returns 文書タイプ
     */
    private getDocumentType(documentId: string): string {
        const doc = this.documents.find(d => d.id === documentId);
        return doc?.type || 'default';
    }
    
    /**
     * 文書リストの描画
     */
    private renderDocumentList(): void {
        const container = document.getElementById('library-document-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.documents.forEach(doc => {
            const button = document.createElement('button');
            button.className = `btn btn-outline-secondary mb-2 w-100 text-start library-document-btn`;
            button.dataset.documentId = doc.id;
            
            if (doc.unlocked) {
                button.classList.remove('btn-outline-secondary');
                button.classList.add('btn-outline-info');
                
                // 未読の場合は未読バッジも表示
                const unreadBadge = doc.isRead ? '' : '<span class="badge bg-danger text-dark me-2">未読</span>';
                button.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <span>${doc.title}</span>
                        <div>
                            ${unreadBadge}
                        </div>
                    </div>
                `;
            } else {
                button.disabled = true;
                button.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="text-muted">？？？？？</span>
                    </div>
                    <small class="text-muted d-block mt-1">
                        🔒️ ${doc.requiredExplorerLevel ? `エクスプローラー Lv. ${doc.requiredExplorerLevel}` : ''}
                        ${doc.requiredBossDefeats ? `, ${this.renderBossRequirements(doc.requiredBossDefeats, 'victory')}` : ''}
                        ${doc.requiredBossLosses ? `, ${this.renderBossRequirements(doc.requiredBossLosses, 'defeat')}` : ''}
                    </small>
                `;
            }
            
            container.appendChild(button);
        });
    }
    
    /**
     * 文書内容の表示
     */
    private showDocument(documentId: string): void {
        const doc = this.documents.find(d => d.id === documentId);
        if (!doc || !doc.unlocked) {
            return;
        }
        
        const contentContainer = document.getElementById('library-document-content');
        if (!contentContainer) {
            return;
        }
        
        // 文書を既読としてマーク
        if (!doc.isRead) {
            const player = this.game.getPlayer();
            player.markDocumentAsRead(documentId);
            
            // 資料庫全体を更新（最新の既読状態を反映）
            this.updateLibrary();
            
            // 上部メニューの未読カウントも更新
            this.updateNavigationUnreadBadge();
        }
        
        // Bootstrap 5対応MarkdownレンダラーでHTML変換
        const documentType = this.getDocumentType(doc.id);
        const htmlContent = BootstrapMarkdownRenderer.convertWithType(doc.content, documentType);
        
        contentContainer.innerHTML = `
            <div class="card h-100">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0">${doc.title}</h5>
                </div>
                <div class="card-body overflow-auto" style="max-height: 70vh;">
                    ${htmlContent}
                </div>
            </div>
        `;
    }
    
    /**
     * 文書内容のクリア
     */
    private clearDocumentContent(): void {
        const contentContainer = document.getElementById('library-document-content');
        if (contentContainer) {
            contentContainer.innerHTML = `
                <div class="text-center text-muted">
                    <p class="mb-0">左から資料を選択してください</p>
                </div>
            `;
        }
    }

    /**
     * 上部メニューの未読バッジを更新（BaseOutGameSceneの共通メソッドを呼び出し）
     */
    private updateNavigationUnreadBadge(): void {
        this.updateLibraryUnreadBadge();
    }
}