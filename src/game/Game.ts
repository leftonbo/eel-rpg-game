import { Player } from './entities/Player';
import { Boss } from './entities/Boss';
import { getBossData } from './data/index';
import { TitleScene } from './scenes/TitleScene';
import { BossSelectScene } from './scenes/BossSelectScene';
import { BattleScene } from './scenes/BattleScene';
import { BattleResultScene, BattleResult } from './scenes/BattleResultScene';
import { PlayerSaveManager } from './systems/PlayerSaveData';

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
    private debugMode: boolean = false;
    
    private titleScene: TitleScene;
    private bossSelectScene: BossSelectScene;
    private battleScene: BattleScene;
    private battleResultScene: BattleResultScene;
    
    constructor() {
        // Check for debug mode from webpack environment, URL parameters, or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        this.debugMode = (typeof DEBUG !== 'undefined' && DEBUG) ||
                        urlParams.get('debug') === 'true' || 
                        localStorage.getItem('debug_mode') === 'true';
        
        this.titleScene = new TitleScene(this);
        this.bossSelectScene = new BossSelectScene(this);
        this.battleScene = new BattleScene(this);
        this.battleResultScene = new BattleResultScene(this);
        
        this.init();
    }
    
    private init(): void {
        // Restore player data from persistence when entering instance
        this.restorePlayerData();
        
        // Show initial title screen
        this.setState(GameState.Title);
    }
    
    /**
     * プレイヤーがインスタンスに入ったときにデータを復元
     */
    private restorePlayerData(): void {
        try {
            // PlayerSaveManagerから保存データを読み込み
            const saveData = PlayerSaveManager.loadPlayerData();
            
            if (saveData) {
                console.log('Player data restored from persistence');
                console.log(`Orbs: ${saveData.orbs}`);
                console.log(`Shop purchased items: ${saveData.shopPurchasedItems.length} items`);
                
                // プレイヤーのデータは既にPlayerクラスのコンストラクタで復元済み
                // ここではログ出力やUI更新などの後処理を行う
                
                // オーブとショップの状態をUIに反映（将来的にUI実装時）
                this.updateOrbDisplay();
                this.updateShopDisplay();
            } else {
                console.log('No saved player data found, using default values');
            }
        } catch (error) {
            console.error('Error restoring player data:', error);
        }
    }
    
    /**
     * オーブ表示の更新（将来的なUI実装用）
     */
    private updateOrbDisplay(): void {
        // TODO: UIでオーブ数を表示する要素があれば更新
        const orbDisplay = document.getElementById('orb-count');
        if (orbDisplay) {
            orbDisplay.textContent = this.player.getOrbs().toString();
        }
    }
    
    /**
     * ショップ表示の更新（将来的なUI実装用）
     */
    private updateShopDisplay(): void {
        // TODO: ショップUIがあれば購入済みアイテムの状態を更新
        console.log('Shop display updated');
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