import { BaseOutGameScene } from './BaseOutGameScene';
import { IGameContext } from '../interfaces/IGameContext';
import { GameState } from '../types/GameState';
import { ChangelogMarkdownRenderer } from '../utils/ChangelogMarkdownRenderer';
import { getLatestChangelogIndex, getNewChangelogs, isChangelogLoaded } from '../data/ChangelogLoader';
import { ChangelogConstants } from '../constants/ChangelogConstants';
import { ModalUtils } from '../utils/ModalUtils';

export class OutGameChangelogScene extends BaseOutGameScene {
    public static readonly CHANGELOG_INDEX_NONE = ChangelogConstants.CHANGELOG_INDEX_NONE;
    public static readonly CHANGELOG_INDEX_INITIAL = ChangelogConstants.CHANGELOG_INDEX_INITIAL;
    
    constructor(game: IGameContext) {
        super(game, 'out-game-changelog');
    }
    
    enter(): void {
        this.updateNavigationActiveState();
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
            
            const result = await ModalUtils.showChangelogModal({ htmlContent });

            const latestIndex = getLatestChangelogIndex();
            const player = this.game.getPlayer();
            player.updateShownChangelogIndex(latestIndex);
            player.saveToStorage();

            if (result === 'goto') {
                this.game.setState(GameState.OutGameChangelog);
            }
            
        } catch (error) {
            console.error('[OutGameChangelogScene] Failed to show new changelogs modal:', error);
        }
    }
}
