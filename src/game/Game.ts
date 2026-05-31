import { Player } from './entities/Player';
import { Boss } from './entities/Boss';
import { getBossData, loadAllBossData } from './data/index';
import { loadAllChangelogs } from './data/ChangelogLoader';
import { loadAllDocuments } from './data/DocumentLoader';
import { TitleScene } from './scenes/TitleScene';
import { BattleScene } from './scenes/BattleScene';
import { BattleResultScene, BattleResult } from './scenes/BattleResultScene';
import { OutGameBossSelectScene } from './scenes/OutGameBossSelectScene';
import { OutGamePlayerDetailScene } from './scenes/OutGamePlayerDetailScene';
import { OutGameExplorationRecordScene } from './scenes/OutGameExplorationRecordScene';
import { OutGameLibraryScene } from './scenes/OutGameLibraryScene';
import { OutGameOptionScene } from './scenes/OutGameOptionScene';
import { OutGameChangelogScene } from './scenes/OutGameChangelogScene';
import { GameState } from './types/GameState';
import { IGameContext } from './interfaces/IGameContext';

/**
 * ゲームのメインクラス
 */
export class Game implements IGameContext {
    private currentState: GameState = GameState.Title;
    private player: Player;
    private currentBoss: Boss | null = null;
    private debugMode: boolean = false;

    /** React から登録される状態変化コールバック */
    private reactStateCallback?: (state: GameState) => void;
    
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
            
            // 更新履歴データを非同期で読み込み
            await loadAllChangelogs();
            console.log('[Game][initAsync] All changelog data loaded');
            
            // ドキュメントデータを非同期で読み込み
            await loadAllDocuments();
            console.log('[Game][initAsync] All document data loaded');
            
            // プレイヤーの初期化
            this.player.lateInitialize();
            console.log('[Game][initAsync] Player initialized');
            
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
        this.currentState = newState;
        
        // 状態に応じた副作用のみ実行（表示はReact側が担当）
        switch (newState) {
            case GameState.Title:
                this.titleScene.enter();
                break;
                
            case GameState.Battle:
                this.battleScene.enter();
                break;
                
            case GameState.BattleResult:
                // BattleResultScene.enter() will be called separately with result data
                break;
                
            // Out Game Scenes
            case GameState.OutGameBossSelect:
                this.outGameBossSelectScene.enter();
                break;
                
            case GameState.OutGamePlayerDetail:
                this.outGamePlayerDetailScene.enter();
                break;
                
            // 以下は React で管理（ナビゲーションの active 状態更新のみ）
            case GameState.OutGameExplorationRecord:
                this.outGameExplorationRecordScene.enter();
                break;
                
            case GameState.OutGameLibrary:
                this.outGameLibraryScene.enter();
                break;
                
            case GameState.OutGameOption:
                this.outGameOptionScene.enter();
                break;
                
            case GameState.OutGameChangelog:
                this.outGameChangelogScene.enter();
                break;
        }

        // React に状態変化を通知
        this.reactStateCallback?.(newState);
    }

    /**
     * React から状態変化コールバックを登録/解除する
     */
    setReactStateCallback(cb: ((state: GameState) => void) | undefined): void {
        this.reactStateCallback = cb;
    }

    reboot(): void {
        // Reset player state and current boss
        this.player.onReboot();
        
        this.setState(GameState.Title);
    }
    
    startGame(): void {
        this.setState(GameState.OutGameBossSelect);
        // Check if changelog should be shown
        const playerChangelogIndex = this.player.getLatestChangelogIndex();
        if (this.outGameChangelogScene.shouldShowChangelog(playerChangelogIndex)) {
            // Show new changelogs modal
            this.outGameChangelogScene.showNewChangelogsModal(playerChangelogIndex);
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

    refreshLocalization(): void {
        if (this.currentBoss) {
            const localizedBoss = getBossData(this.currentBoss.id);
            this.currentBoss.applyLocalizedData(localizedBoss);
        }

        this.outGameBossSelectScene.refreshLocalization();
    }
    
    /**
     * Check if debug mode is enabled
     */
    isDebugMode(): boolean {
        return this.debugMode;
    }
    
}
