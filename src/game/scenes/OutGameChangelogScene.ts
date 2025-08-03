import { BaseOutGameScene } from './BaseOutGameScene';
import { Game } from '../Game';
import { ChangelogMarkdownRenderer } from '../utils/ChangelogMarkdownRenderer';

/**
 * アウトゲーム更新履歴シーン
 * ゲームの変更履歴を表示する
 */
export class OutGameChangelogScene extends BaseOutGameScene {
    private changelogContent: string = '';
    
    constructor(game: Game) {
        super(game, 'out-game-changelog');
    }
    
    /**
     * シーンに入った時の処理
     */
    enter(): void {
        console.log('[OutGameChangelogScene] Entering changelog scene');
        
        // 更新履歴画面を表示
        const changelogScreen = document.getElementById('out-game-changelog-screen');
        if (changelogScreen) {
            changelogScreen.classList.remove('d-none');
        }
        
        // ナビゲーションバーのアクティブ状態を更新
        this.updateNavigationActiveState();
        
        // 更新履歴コンテンツを読み込み・表示
        this.loadAndDisplayChangelog();
    }
    
    /**
     * 更新履歴を読み込んで表示
     */
    private async loadAndDisplayChangelog(): Promise<void> {
        try {
            // 更新履歴ファイルを読み込み（開発環境では fetch を使用）
            const changelogUrl = 'changelog.md'; // public フォルダに配置予定
            const response = await fetch(changelogUrl);
            
            if (!response.ok) {
                throw new Error(`Failed to load changelog: ${response.status}`);
            }
            
            const markdownContent = await response.text();
            this.changelogContent = markdownContent;
            
            // Markdownを HTMLに変換
            const htmlContent = ChangelogMarkdownRenderer.convert(markdownContent);
            
            // HTMLを表示
            this.displayChangelogContent(htmlContent);
            
        } catch (error) {
            console.error('[OutGameChangelogScene] Failed to load changelog:', error);
            this.displayErrorContent();
        }
    }
    
    /**
     * 更新履歴コンテンツを表示
     */
    private displayChangelogContent(htmlContent: string): void {
        const contentContainer = document.getElementById('changelog-content');
        if (contentContainer) {
            contentContainer.innerHTML = htmlContent;
        }
        
        // 読み込み中インジケーターを非表示
        const loadingIndicator = document.getElementById('changelog-loading');
        if (loadingIndicator) {
            loadingIndicator.classList.add('d-none');
        }
    }
    
    /**
     * エラー時のコンテンツを表示
     */
    private displayErrorContent(): void {
        const contentContainer = document.getElementById('changelog-content');
        if (contentContainer) {
            contentContainer.innerHTML = `
                <div class="alert alert-warning" role="alert">
                    <h4 class="alert-heading">📋 更新履歴の読み込みエラー</h4>
                    <p class="mb-0">
                        更新履歴ファイルの読み込みに失敗しました。<br>
                        ファイルが存在しないか、ネットワークエラーが発生している可能性があります。
                    </p>
                </div>
                <div class="text-center mt-4">
                    <button class="btn btn-outline-primary" onclick="location.reload()">
                        🔄 再読み込み
                    </button>
                </div>
            `;
        }
        
        // 読み込み中インジケーターを非表示
        const loadingIndicator = document.getElementById('changelog-loading');
        if (loadingIndicator) {
            loadingIndicator.classList.add('d-none');
        }
    }
    
    /**
     * 更新履歴コンテンツをモーダルで表示（詳細表示用）
     */
    public async showChangelogModal(): Promise<void> {
        if (!this.changelogContent) {
            await this.loadAndDisplayChangelog();
        }
        
        const htmlContent = ChangelogMarkdownRenderer.convert(this.changelogContent);
        
        // カスタムモーダルを作成
        const modalHtml = `
            <div class="modal fade" id="changelogModal" tabindex="-1" aria-labelledby="changelogModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-xl modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="changelogModalLabel">
                                📋 更新履歴 - 詳細表示
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            ${htmlContent}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">閉じる</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 既存のモーダルを削除
        const existingModal = document.getElementById('changelogModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // 新しいモーダルを追加
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // モーダルを表示
        const modalElement = document.getElementById('changelogModal');
        if (modalElement) {
            // Bootstrap modal
            const modal = new window.bootstrap.Modal(modalElement);
            modal.show();
            
            // モーダルが閉じられた時にDOMから削除
            modalElement.addEventListener('hidden.bs.modal', () => {
                modalElement.remove();
            });
        }
    }
}