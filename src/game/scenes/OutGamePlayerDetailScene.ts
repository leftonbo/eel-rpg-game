import { Game } from "../Game";
import { BaseOutGameScene } from "./BaseOutGameScene";

export class OutGamePlayerDetailScene extends BaseOutGameScene {
    constructor(game: Game) {
        super(game, "out-game-player-detail-screen");
    }

    /**
     * シーンに入った時の処理
     */
    enter(): void {
        console.log("Entered OutGamePlayerDetailScene");

        // ナビゲーションバーのアクティブ状態更新
        this.updateNavigationActiveState();
        // プレイヤー詳細・装備・スキル・アイテムは React コンポーネントで管理
    }
}
