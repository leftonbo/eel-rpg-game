import { Player } from './entities/Player';
import { Boss } from './entities/Boss';
import { getBossData, loadAllBossData } from './data/index';
import { TitleScene } from './scenes/TitleScene';
import { BossSelectScene } from './scenes/BossSelectScene';
import { BattleScene } from './scenes/BattleScene';
import { BattleResultScene, BattleResult } from './scenes/BattleResultScene';

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
     * ボス選択画面。プレイヤーが挑戦するボスを選ぶ状態
     */
    BossSelect = 'boss-select',
    /**
     * 戦闘画面。プレイヤーがボスと戦う状態
     */
    Battle = 'battle',
    /**
     * 戦闘結果画面。戦闘の結果が表示される状態
     */
    BattleResult = 'battle-result'
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
    private bossSelectScene: BossSelectScene;
    private battleScene: BattleScene;
    private battleResultScene: BattleResultScene;
    
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
        this.bossSelectScene = new BossSelectScene(this);
        this.battleScene = new BattleScene(this);
        this.battleResultScene = new BattleResultScene(this);
        
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
            this.bossSelectScene.lateInitialize();
            
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
        
        this.currentState = newState;
        
        // Show appropriate scene
        switch (newState) {
            case GameState.Title:
                document.getElementById('title-screen')?.classList.remove('d-none');
                this.titleScene.enter();
                break;
                
            case GameState.BossSelect:
                document.getElementById('boss-select-screen')?.classList.remove('d-none');
                this.bossSelectScene.enter();
                break;
                
            case GameState.Battle:
                document.getElementById('battle-screen')?.classList.remove('d-none');
                this.battleScene.enter();
                break;
                
            case GameState.BattleResult:
                document.getElementById('battle-result-screen')?.classList.remove('d-none');
                // BattleResultScene.enter() will be called separately with result data
                break;
        }
    }

    reboot(): void {
        this.setState(GameState.Title);
    }
    
    startGame(): void {
        this.setState(GameState.BossSelect);
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
        this.setState(GameState.BossSelect);
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
}