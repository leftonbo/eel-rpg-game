import { Game, GameState } from '../Game';

/**
 * アウトゲームシーンの基底クラス
 * 共通のナビゲーション機能とフッター表示を提供
 */
export abstract class BaseOutGameScene {
    protected game: Game;
    protected sceneId: string;
    private static navigationListenersSetup: boolean = false;
    
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
        // 重複登録を防ぐため、既にリスナーが設定されているかチェック
        if (BaseOutGameScene.navigationListenersSetup) {
            return;
        }
        
        // ボス選択
        const bossSelectNavBtn = document.getElementById('nav-boss-select');
        if (bossSelectNavBtn) {
            bossSelectNavBtn.addEventListener('click', () => {
                this.game.setState(GameState.OutGameBossSelect);
            });
        }
        
        // プレイヤー詳細
        const playerDetailNavBtn = document.getElementById('nav-player-detail');
        if (playerDetailNavBtn) {
            playerDetailNavBtn.addEventListener('click', () => {
                this.game.setState(GameState.OutGamePlayerDetail);
            });
        }
        
        // 探検記録
        const explorationRecordNavBtn = document.getElementById('nav-exploration-record');
        if (explorationRecordNavBtn) {
            explorationRecordNavBtn.addEventListener('click', () => {
                this.game.setState(GameState.OutGameExplorationRecord);
            });
        }
        
        // 資料庫
        const libraryNavBtn = document.getElementById('nav-library');
        if (libraryNavBtn) {
            libraryNavBtn.addEventListener('click', () => {
                this.game.setState(GameState.OutGameLibrary);
            });
        }
        
        // オプション
        const optionNavBtn = document.getElementById('nav-option');
        if (optionNavBtn) {
            optionNavBtn.addEventListener('click', () => {
                this.game.setState(GameState.OutGameOption);
            });
        }
        
        BaseOutGameScene.navigationListenersSetup = true;
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
}