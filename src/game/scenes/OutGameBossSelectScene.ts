import { Game } from '../Game';
import { BaseOutGameScene } from './BaseOutGameScene';

export class OutGameBossSelectScene extends BaseOutGameScene {
    constructor(game: Game) {
        super(game, 'out-game-boss-select-screen');
    }
    
    /**
     * シーン初期化後の遅延処理
     */
    public lateInitialize(): void {
        // React component renders boss cards.
    }
    
    /**
     * シーンに入った時の処理
     */
    enter(): void {
        console.log('Entered OutGameBossSelectScene');
        
        // ナビゲーションバーのアクティブ状態更新
        this.updateNavigationActiveState();
        
        // ボスカード情報・プレイヤー情報はReactコンポーネントで管理
    }

    refreshLocalization(): void {
        // React component reads localized boss data on render.
    }
}
