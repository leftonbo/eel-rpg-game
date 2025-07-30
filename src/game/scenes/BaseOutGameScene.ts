import { Game, GameState } from '../Game';
import { getUnreadCountForPlayer } from '../data/DocumentLoader';

/**
 * アウトゲームシーンの基底クラス
 * 共通のナビゲーション機能とフッター表示を提供
 */
export abstract class BaseOutGameScene {
    protected game: Game;
    protected sceneId: string;
    
    constructor(game: Game, sceneId: string) {
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
        // 共通ナビゲーションに一度だけイベントリスナーを設定
        // ボス選択
        const bossSelectNavBtn = document.getElementById('nav-boss-select');
        if (bossSelectNavBtn && !bossSelectNavBtn.dataset.listenerAdded) {
            bossSelectNavBtn.addEventListener('click', () => {
                this.game.setState(GameState.OutGameBossSelect);
            });
            bossSelectNavBtn.dataset.listenerAdded = 'true';
        }
        
        // プレイヤー詳細
        const playerDetailNavBtn = document.getElementById('nav-player-detail');
        if (playerDetailNavBtn && !playerDetailNavBtn.dataset.listenerAdded) {
            playerDetailNavBtn.addEventListener('click', () => {
                this.game.setState(GameState.OutGamePlayerDetail);
            });
            playerDetailNavBtn.dataset.listenerAdded = 'true';
        }
        
        // 探検記録
        const explorationRecordNavBtn = document.getElementById('nav-exploration-record');
        if (explorationRecordNavBtn && !explorationRecordNavBtn.dataset.listenerAdded) {
            explorationRecordNavBtn.addEventListener('click', () => {
                this.game.setState(GameState.OutGameExplorationRecord);
            });
            explorationRecordNavBtn.dataset.listenerAdded = 'true';
        }
        
        // 資料庫
        const libraryNavBtn = document.getElementById('nav-library');
        if (libraryNavBtn && !libraryNavBtn.dataset.listenerAdded) {
            libraryNavBtn.addEventListener('click', () => {
                this.game.setState(GameState.OutGameLibrary);
            });
            libraryNavBtn.dataset.listenerAdded = 'true';
        }
        
        // オプション
        const optionNavBtn = document.getElementById('nav-option');
        if (optionNavBtn && !optionNavBtn.dataset.listenerAdded) {
            optionNavBtn.addEventListener('click', () => {
                this.game.setState(GameState.OutGameOption);
            });
            optionNavBtn.dataset.listenerAdded = 'true';
        }
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
            'nav-option'
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
            const unreadCount = getUnreadCountForPlayer(explorerLevel, defeatedBosses, lostToBosses);
            
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