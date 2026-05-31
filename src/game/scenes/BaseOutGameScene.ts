import { IGameContext } from '../interfaces/IGameContext';

/**
 * アウトゲームシーンの基底クラス
 * 共通のナビゲーション機能とフッター表示を提供
 */
export abstract class BaseOutGameScene {
    protected game: IGameContext;
    protected sceneId: string;
    
    constructor(game: IGameContext, sceneId: string) {
        this.game = game;
        this.sceneId = sceneId;
        this.init();
    }
    
    /**
     * 基本初期化処理
     */
    private init(): void {
        // Navigation is rendered and handled by React.
    }
    
    /**
     * シーンに入った時の処理（各シーンで実装）
     */
    abstract enter(): void;
    
    /**
     * ナビゲーションバーのアクティブ状態を更新
     */
    protected updateNavigationActiveState(): void {
        // React controls active state and unread badges.
    }
}
