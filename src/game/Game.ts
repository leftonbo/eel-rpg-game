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
    BattleResult = 'battle-result'
}

export class Game {
    private currentState: GameState = GameState.Title;
    private player: Player = new Player();
    private currentBoss: Boss | null = null;
    
    private titleScene: TitleScene;
    private bossSelectScene: BossSelectScene;
    private battleScene: BattleScene;
    private battleResultScene: BattleResultScene;
    
    constructor() {
        this.titleScene = new TitleScene(this);
        this.bossSelectScene = new BossSelectScene(this);
        this.battleScene = new BattleScene(this);
        this.battleResultScene = new BattleResultScene(this);
        
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
        // Don't reset player - keep progress
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
}