import { Player } from './entities/Player';
import { Boss } from './entities/Boss';
import { getBossData, loadAllBossData } from './data/index';
import { TitleScene } from './scenes/TitleScene';
import { BattleScene } from './scenes/BattleScene';
import { BattleResultScene, BattleResult } from './scenes/BattleResultScene';
import { OutGameBossSelectScene } from './scenes/OutGameBossSelectScene';
import { OutGamePlayerDetailScene } from './scenes/OutGamePlayerDetailScene';
import { OutGameExplorationRecordScene } from './scenes/OutGameExplorationRecordScene';
import { OutGameLibraryScene } from './scenes/OutGameLibraryScene';
import { OutGameOptionScene } from './scenes/OutGameOptionScene';
import { OutGameChangelogScene } from './scenes/OutGameChangelogScene';
import { PlayerSaveManager } from './systems/PlayerSaveData';

/**
 * ゲームの状態を管理する列挙型
 */
export enum GameState {
    /**
     * 初期状態。ゲームがまだ開始されていない状態
     */
    Initial = 'initial',
    /**
     * エラー状態。致命的なエラーが発生した状態
     */
    FatalError = 'fatal-error',
    /**
     * タイトル画面。プレイヤーがゲームを開始できる状態
     */
    Title = 'title',
    /**
     * 戦闘画面。プレイヤーがボスと戦う状態
     */
    Battle = 'battle',
    /**
     * 戦闘結果画面。戦闘の結果が表示される状態
     */
    BattleResult = 'battle-result',
    /**
     * アウトゲーム - ボス選択画面
     */
    OutGameBossSelect = 'out-game-boss-select',
    /**
     * アウトゲーム - プレイヤー詳細画面
     */
    OutGamePlayerDetail = 'out-game-player-detail',
    /**
     * アウトゲーム - 探検記録画面
     */
    OutGameExplorationRecord = 'out-game-exploration-record',
    /**
     * アウトゲーム - 資料庫画面
     */
    OutGameLibrary = 'out-game-library',
    /**
     * アウトゲーム - オプション画面
     */
    OutGameOption = 'out-game-option',
    /**
     * アウトゲーム - 更新履歴画面
     */
    OutGameChangelog = 'out-game-changelog'
}

/**
 * ゲームのメインクラス
 */
export class Game {
    private currentState: GameState = GameState.Title;
    private player: Player;
    private currentBoss: Boss | null = null;
    private debugMode: boolean = false;
    
    private titleScene: TitleScene;
    private battleScene: BattleScene;
    private battleResultScene: BattleResultScene;
    
    // Out Game Scenes
    private outGameBossSelectScene: OutGameBossSelectScene;
    private outGamePlayerDetailScene: OutGamePlayerDetailScene;
    private outGameExplorationRecordScene: OutGameExplorationRecordScene;
    private outGameLibraryScene: OutGameLibraryScene;
    private outGameOptionScene: OutGameOptionScene;
    private outGameChangelogScene: OutGameChangelogScene;
    
    constructor() {
        // デバッグモード判定 (webpack environment, URL parameters, or localStorage)
        const urlParams = new URLSearchParams(window.location.search);
        this.debugMode = (typeof DEBUG !== 'undefined' && DEBUG) ||
                        urlParams.get('debug') === 'true' || 
                        localStorage.getItem('debug_mode') === 'true';

        // Player の初期化
        this.player = new Player();
        
        // シーンの初期化
        this.titleScene = new TitleScene(this);
        this.battleScene = new BattleScene(this);
        this.battleResultScene = new BattleResultScene(this);
        
        // Out Game シーンの初期化
        this.outGameBossSelectScene = new OutGameBossSelectScene(this);
        this.outGamePlayerDetailScene = new OutGamePlayerDetailScene(this);
        this.outGameExplorationRecordScene = new OutGameExplorationRecordScene(this);
        this.outGameLibraryScene = new OutGameLibraryScene(this);
        this.outGameOptionScene = new OutGameOptionScene(this);
        this.outGameChangelogScene = new OutGameChangelogScene(this);
        
        // 非同期読み込みを開始
        this.initAsync();
    }
    
    private async initAsync(): Promise<void> {
        try {
            console.log('[Game][initAsync] Initializing game...');

            // 初期状態を設定
            this.setState(GameState.Initial);
            
            // ボスデータを非同期で読み込み
            await loadAllBossData();
            console.log('[Game][initAsync] All boss data loaded');
            
            // プレイヤーの初期化
            this.player.lateInitialize();
            console.log('[Game][initAsync] Player initialized');
            
            // 各シーンの遅延初期化
            this.outGameBossSelectScene.lateInitialize();
            
            console.log('[Game][initAsync] Game initialized successfully');
            
            // Show initial title screen
            this.setState(GameState.Title);
        } catch (error) {
            // エラーが発生した場合は致命的なエラー状態に遷移
            console.error('[Game][initAsync] Failed to initialize game:', error);
            console.error('[Game][initAsync] Error details:', error);
            this.setState(GameState.FatalError);
        }
    }
    
    setState(newState: GameState): void {
        // Hide all scenes
        document.getElementById('title-screen')?.classList.add('d-none');
        document.getElementById('boss-select-screen')?.classList.add('d-none');
        document.getElementById('battle-screen')?.classList.add('d-none');
        document.getElementById('battle-result-screen')?.classList.add('d-none');
        
        // Hide Out Game scenes
        document.getElementById('out-game-boss-select-screen')?.classList.add('d-none');
        document.getElementById('out-game-player-detail-screen')?.classList.add('d-none');
        document.getElementById('out-game-exploration-record-screen')?.classList.add('d-none');
        document.getElementById('out-game-library-screen')?.classList.add('d-none');
        document.getElementById('out-game-option-screen')?.classList.add('d-none');
        document.getElementById('out-game-changelog-screen')?.classList.add('d-none');
        
        // Hide/Show out-game navigation based on scene type
        const outGameNavigation = document.getElementById('out-game-navigation-container');
        const isOutGameScene = this.isOutGameState(newState);
        if (outGameNavigation) {
            if (isOutGameScene) {
                outGameNavigation.classList.remove('d-none');
            } else {
                outGameNavigation.classList.add('d-none');
            }
        }
        
        // Hide/Show out-game footer based on scene type
        const outGameFooter = document.getElementById('out-game-footer-container');
        if (outGameFooter) {
            if (isOutGameScene) {
                outGameFooter.classList.remove('d-none');
            } else {
                outGameFooter.classList.add('d-none');
            }
        }
        
        this.currentState = newState;
        
        // Show appropriate scene
        switch (newState) {
            case GameState.Title:
                document.getElementById('title-screen')?.classList.remove('d-none');
                this.titleScene.enter();
                break;
                
            case GameState.Battle:
                document.getElementById('battle-screen')?.classList.remove('d-none');
                this.battleScene.enter();
                break;
                
            case GameState.BattleResult:
                document.getElementById('battle-result-screen')?.classList.remove('d-none');
                // BattleResultScene.enter() will be called separately with result data
                break;
                
            // Out Game Scenes
            case GameState.OutGameBossSelect:
                document.getElementById('out-game-boss-select-screen')?.classList.remove('d-none');
                this.outGameBossSelectScene.enter();
                break;
                
            case GameState.OutGamePlayerDetail:
                document.getElementById('out-game-player-detail-screen')?.classList.remove('d-none');
                this.outGamePlayerDetailScene.enter();
                break;
                
            case GameState.OutGameExplorationRecord:
                document.getElementById('out-game-exploration-record-screen')?.classList.remove('d-none');
                this.outGameExplorationRecordScene.enter();
                break;
                
            case GameState.OutGameLibrary:
                document.getElementById('out-game-library-screen')?.classList.remove('d-none');
                this.outGameLibraryScene.enter();
                break;
                
            case GameState.OutGameOption:
                document.getElementById('out-game-option-screen')?.classList.remove('d-none');
                this.outGameOptionScene.enter();
                break;
                
            case GameState.OutGameChangelog:
                document.getElementById('out-game-changelog-screen')?.classList.remove('d-none');
                this.outGameChangelogScene.enter();
                break;
        }
    }

    reboot(): void {
        // Reset player state and current boss
        this.player.onReboot();
        
        this.setState(GameState.Title);
    }
    
    startGame(): void {
        // Check if game version was upgraded since last save
        if (PlayerSaveManager.isGameVersionUpgraded()) {
            console.log('[Game] Game version upgraded, showing changelog');
            // Update the game version in save data
            PlayerSaveManager.updateGameVersion();
            // Show changelog first
            this.setState(GameState.OutGameChangelog);
        } else {
            // Normal flow - go to boss select
            this.setState(GameState.OutGameBossSelect);
        }
    }
    
    selectBoss(bossId: string): void {
        try {
            const bossData = getBossData(bossId);
            this.currentBoss = new Boss(bossData);
            this.setState(GameState.Battle);
        } catch (error) {
            console.error(`Failed to load boss data for ID: ${bossId}`, error);
        }
    }
    
    returnToBossSelect(): void {
        // Reset battle-specific state while keeping progress
        this.player.resetBattleState();
        this.currentBoss = null;
        this.setState(GameState.OutGameBossSelect);
    }
    
    /**
     * Transition to battle result scene with result data
     */
    showBattleResult(result: BattleResult): void {
        this.setState(GameState.BattleResult);
        this.battleResultScene.enter(result);
    }
    
    getPlayer(): Player {
        return this.player;
    }
    
    getCurrentBoss(): Boss | null {
        return this.currentBoss;
    }
    
    getCurrentState(): GameState {
        return this.currentState;
    }
    
    /**
     * Check if debug mode is enabled
     */
    isDebugMode(): boolean {
        return this.debugMode;
    }
    
    /**
     * Check if the given state is an out-game state
     */
    private isOutGameState(state: GameState): boolean {
        return state === GameState.OutGameBossSelect ||
               state === GameState.OutGamePlayerDetail ||
               state === GameState.OutGameExplorationRecord ||
               state === GameState.OutGameLibrary ||
               state === GameState.OutGameOption ||
               state === GameState.OutGameChangelog;
    }
}