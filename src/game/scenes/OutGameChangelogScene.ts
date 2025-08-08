import { BaseOutGameScene } from './BaseOutGameScene';
import { IGameContext } from '../interfaces/IGameContext';
import { GameState } from '../types/GameState';
import { ChangelogMarkdownRenderer } from '../utils/ChangelogMarkdownRenderer';
import { getAllChangelogs, getLatestChangelogIndex, getNewChangelogs, isChangelogLoaded } from '../data/ChangelogLoader';
import { ChangelogConstants } from '../constants/ChangelogConstants';

/**
 * アウトゲーム更新履歴シーン
 * ゲームの変更履歴を表示する
 */
export class OutGameChangelogScene extends BaseOutGameScene {
    private changelogContent: string = '';
    public static readonly CHANGELOG_INDEX_NONE = ChangelogConstants.CHANGELOG_INDEX_NONE;
    public static readonly CHANGELOG_INDEX_INITIAL = ChangelogConstants.CHANGELOG_INDEX_INITIAL;
    
    constructor(game: IGameContext) {
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
     * ChangeLog Modal を表示するべきかチェックする
     * @param shownLatest 最新の表示済み更新履歴インデックス
     */
    public shouldShowChangelog(shownLatest: number): boolean {
        // 更新履歴が読み込まれていない場合は表示しない
        if (!isChangelogLoaded()) {
            return false;
        }

        // 初期セーブデータ（shownLatest = CHANGELOG_INDEX_INITIAL）の場合は表示しない
        if (shownLatest === OutGameChangelogScene.CHANGELOG_INDEX_INITIAL) {
            return false;
        }
        
        // 最新の更新履歴インデックスを取得
        const latestIndex = getLatestChangelogIndex();
        
        // 最新の更新履歴インデックスが表示済みより大きい場合は表示
        return latestIndex > shownLatest;
    }
    
    /**
     * 更新履歴を読み込んで表示
     */
    private async loadAndDisplayChangelog(): Promise<void> {
        try {
            // 更新履歴が読み込まれていない場合はエラー
            if (!isChangelogLoaded()) {
                throw new Error('Changelogs are not loaded yet');
            }
            
            // 全ての更新履歴を取得（新しい順）
            const allChangelogs = getAllChangelogs();
            
            if (allChangelogs.length === 0) {
                throw new Error('No changelogs available');
            }
            
            // 全ての更新履歴を結合してMarkdownコンテンツを作成
            const markdownContent = allChangelogs.map(changelog => {
                return `${changelog.content}\n\n---\n\n`;
            }).join('');
            
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
        
        // モーダルがBootstrapで正しく初期化されているか確認
        if (!window.bootstrap || typeof window.bootstrap.Modal !== 'function') {
            console.error('Bootstrap modal is not available. Ensure Bootstrap JS is loaded.');
            return;
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
    
    /**
     * 新しい更新履歴をモーダルで表示
     * @param fromIndex 基準となるインデックス
     */
    public async showNewChangelogsModal(fromIndex: number): Promise<void> {
        try {
            // 更新履歴が読み込まれていない場合はエラー
            if (!isChangelogLoaded()) {
                console.error('[OutGameChangelogScene] Changelogs are not loaded yet');
                return;
            }
            
            // 新しい更新履歴を取得
            const newChangelogs = getNewChangelogs(fromIndex);
            
            if (newChangelogs.length === 0) {
                console.log('[OutGameChangelogScene] No new changelogs to show');
                return;
            }
            
            // 新しい更新履歴のMarkdownコンテンツを作成
            const markdownContent = newChangelogs.map(changelog => {
                return `${changelog.content}\n\n---\n\n`;
            }).join('');
            
            const htmlContent = ChangelogMarkdownRenderer.convert(markdownContent);
            
            // カスタムモーダルを作成
            const modalHtml = `
                <div class="modal fade" id="newChangelogModal" tabindex="-1" aria-labelledby="newChangelogModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-xl modal-dialog-scrollable">
                        <div class="modal-content">
                            <div class="modal-header bg-primary text-white">
                                <h5 class="modal-title" id="newChangelogModalLabel">
                                    🎉 新しい更新履歴
                                </h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="alert alert-info mb-4" role="alert">
                                    <h6 class="alert-heading">📋 更新履歴が追加されました！</h6>
                                    <p class="mb-0">ゲームが更新され、新しい機能や改善点が追加されました。</p>
                                </div>
                                ${htmlContent}
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">閉じる</button>
                                <button type="button" class="btn btn-primary" id="gotoChangelogPage">更新履歴ページへ</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // 既存のモーダルを削除
            const existingModal = document.getElementById('newChangelogModal');
            if (existingModal) {
                existingModal.remove();
            }
            
            // 新しいモーダルを追加
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            
            // モーダルを表示
            const modalElement = document.getElementById('newChangelogModal');
            if (modalElement) {
                // Bootstrap modal
                const modal = new window.bootstrap.Modal(modalElement);
                modal.show();
                
                // 更新履歴ページへのボタンのイベントリスナー
                const gotoChangelogBtn = document.getElementById('gotoChangelogPage');
                if (gotoChangelogBtn) {
                    gotoChangelogBtn.onclick = () => {
                        modal.hide();
                        // 更新履歴ページに遷移
                        this.game.setState(GameState.OutGameChangelog);
                    };
                }
                
                // モーダルが閉じられた時
                modalElement.addEventListener('hidden.bs.modal', () => {
                    // DOMから削除
                    modalElement.remove();

                    // プレイヤーの表示済み更新履歴インデックスを更新
                    const latestIndex = getLatestChangelogIndex();
                    const player = this.game.getPlayer();
                    player.updateShownChangelogIndex(latestIndex);
                    player.saveToStorage();
                });
            }
            
        } catch (error) {
            console.error('[OutGameChangelogScene] Failed to show new changelogs modal:', error);
        }
    }
}