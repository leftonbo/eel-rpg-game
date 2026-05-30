import { IGameContext } from '../interfaces/IGameContext';
import { GameState } from '../types/GameState';
import { getUnreadCountForPlayer } from '../data/DocumentLoader';

/**
 * アウトゲームシーンの基底クラス
 * 共通のナビゲーション機能とフッター表示を提供
 */
export abstract class BaseOutGameScene {
    protected game: IGameContext;
    protected sceneId: string;
    private static navigationListenerInitialized = false;
    
    constructor(game: IGameContext, sceneId: string) {
        this.game = game;
        this.sceneId = sceneId;
        this.init();
    }
    
    /**
     * 基本初期化処理
     */
    private init(): void {
        this.setupNavigationListeners();
    }
    
    /**
     * シーンに入った時の処理（各シーンで実装）
     */
    abstract enter(): void;
    
    /**
     * ナビゲーションバーのイベントリスナー設定
     */
    private setupNavigationListeners(): void {
        // React の再描画で要素が差し替わっても反応するよう委譲で一度だけ登録
        if (BaseOutGameScene.navigationListenerInitialized) {
            return;
        }

        document.addEventListener('click', (event) => {
            const target = event.target as HTMLElement | null;
            if (!target) return;

            const navButton = target.closest('#nav-boss-select, #nav-player-detail, #nav-exploration-record, #nav-library, #nav-option, #nav-changelog') as HTMLElement | null;
            if (!navButton) return;

            switch (navButton.id) {
                case 'nav-boss-select':
                    this.game.setState(GameState.OutGameBossSelect);
                    break;
                case 'nav-player-detail':
                    this.game.setState(GameState.OutGamePlayerDetail);
                    break;
                case 'nav-exploration-record':
                    this.game.setState(GameState.OutGameExplorationRecord);
                    break;
                case 'nav-library':
                    this.game.setState(GameState.OutGameLibrary);
                    break;
                case 'nav-option':
                    this.game.setState(GameState.OutGameOption);
                    break;
                case 'nav-changelog':
                    this.game.setState(GameState.OutGameChangelog);
                    break;
            }
        });

        BaseOutGameScene.navigationListenerInitialized = true;
    }
    
    /**
     * ナビゲーションバーのアクティブ状態を更新
     */
    protected updateNavigationActiveState(): void {
        // 全てのナビゲーションボタンから active クラスを削除
        const navButtons = [
            'nav-boss-select',
            'nav-player-detail', 
            'nav-exploration-record',
            'nav-library',
            'nav-option',
            'nav-changelog'
        ];
        
        navButtons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.classList.remove('active');
            }
        });
        
        // 現在のシーンに対応するボタンにactiveクラスを追加
        const currentNavBtn = this.getCurrentNavigationButtonId();
        if (currentNavBtn) {
            const activeBtn = document.getElementById(currentNavBtn);
            if (activeBtn) {
                activeBtn.classList.add('active');
            }
        }
        
        // 資料庫の未読バッジを更新
        this.updateLibraryUnreadBadge();
    }
    
    /**
     * 現在のシーンに対応するナビゲーションボタンIDを取得
     */
    private getCurrentNavigationButtonId(): string | null {
        const currentState = this.game.getCurrentState();
        
        switch (currentState) {
            case GameState.OutGameBossSelect:
                return 'nav-boss-select';
            case GameState.OutGamePlayerDetail:
                return 'nav-player-detail';
            case GameState.OutGameExplorationRecord:
                return 'nav-exploration-record';
            case GameState.OutGameLibrary:
                return 'nav-library';
            case GameState.OutGameOption:
                return 'nav-option';
            case GameState.OutGameChangelog:
                return 'nav-changelog';
            default:
                return null;
        }
    }

    /**
     * 資料庫の未読バッジを更新
     */
    protected updateLibraryUnreadBadge(): void {
        const libraryNavBtn = document.getElementById('nav-library');
        if (!libraryNavBtn) return;

        // 既存の未読バッジを削除
        const existingBadge = libraryNavBtn.querySelector('.unread-badge');
        if (existingBadge) {
            existingBadge.remove();
        }

        try {
            const player = this.game.getPlayer();
            const explorerLevel = player.getExplorerLevel();
            const defeatedBosses = player.memorialSystem.getVictoriousBossIds();
            const lostToBosses = player.memorialSystem.getDefeatedBossIds();

            // 共通化された関数を使用して未読数を計算
            const unreadCount = getUnreadCountForPlayer(
                player,
                explorerLevel,
                defeatedBosses,
                lostToBosses
            );

            // 未読文書がある場合はバッジを追加
            if (unreadCount > 0) {
                const badge = document.createElement('span');
                badge.className = 'badge bg-danger unread-badge ms-1';
                badge.textContent = unreadCount.toString();
                libraryNavBtn.appendChild(badge);
            }
        } catch (error) {
            console.error('Failed to update library unread badge:', error);
        }
    }
}