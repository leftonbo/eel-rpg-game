import { Player } from './entities/Player';
import { Boss } from './entities/Boss';
import { getBossData } from './data/index';
import { TitleScene } from './scenes/TitleScene';
import { BossSelectScene } from './scenes/BossSelectScene';
import { BattleScene } from './scenes/BattleScene';
import { BattleResultScene, BattleResult } from './scenes/BattleResultScene';

export enum GameState {
    Title = 'title',
    BossSelect = 'boss-select',
    Battle = 'battle',
    BattleResult = 'battle-result',
    Debug = 'debug'
}

export class Game {
    private currentState: GameState = GameState.Title;
    private player: Player = new Player();
    private currentBoss: Boss | null = null;
    private debugMode: boolean = false;
    
    private titleScene: TitleScene;
    private bossSelectScene: BossSelectScene;
    private battleScene: BattleScene;
    private battleResultScene: BattleResultScene;
    private debugScene: any; // Will be typed properly when DebugScene is created
    
    constructor() {
        // Check for debug mode from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        this.debugMode = urlParams.get('debug') === 'true';
        
        this.titleScene = new TitleScene(this);
        this.bossSelectScene = new BossSelectScene(this);
        this.battleScene = new BattleScene(this);
        this.battleResultScene = new BattleResultScene(this);
        // debugScene will be initialized lazily when needed
        
        this.init();
    }
    
    private init(): void {
        // Show initial title screen
        this.setState(GameState.Title);
    }
    
    setState(newState: GameState): void {
        // Hide all scenes
        document.getElementById('title-screen')?.classList.add('d-none');
        document.getElementById('boss-select-screen')?.classList.add('d-none');
        document.getElementById('battle-screen')?.classList.add('d-none');
        document.getElementById('battle-result-screen')?.classList.add('d-none');
        document.getElementById('debug-screen')?.classList.add('d-none');
        
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
                
            case GameState.Debug:
                document.getElementById('debug-screen')?.classList.remove('d-none');
                this.initializeDebugScene();
                this.debugScene?.enter();
                break;
        }
    }
    
    startGame(): void {
        // Reset player to initial state
        this.player = new Player();
        this.setState(GameState.BossSelect);
    }
    
    selectBoss(bossId: string): void {
        const bossData = getBossData(bossId);
        if (!bossData) {
            console.error(`Boss data not found for ID: ${bossId}`);
            return;
        }
        
        this.currentBoss = new Boss(bossData);
        this.setState(GameState.Battle);
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
    
    /**
     * Initialize debug scene lazily
     */
    private async initializeDebugScene(): Promise<void> {
        if (!this.debugScene) {
            // Dynamically import DebugScene to avoid circular dependencies
            const { DebugScene } = await import('./scenes/DebugScene');
            this.debugScene = new DebugScene(this);
        }
    }
    
    /**
     * Navigate to debug screen (only available in debug mode)
     */
    showDebugScreen(): void {
        if (this.debugMode) {
            this.setState(GameState.Debug);
        }
    }
    
    /**
     * Return to battle from debug screen
     */
    returnToBattle(): void {
        this.setState(GameState.Battle);
    }
}