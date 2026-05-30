import { Game } from "../Game";
import { BaseOutGameScene } from "./BaseOutGameScene";
import { PlayerInfoEditManager } from "./managers/PlayerInfoEditManager";

export class OutGamePlayerDetailScene extends BaseOutGameScene {

    private playerInfoEditManager: PlayerInfoEditManager;

    constructor(game: Game) {
        super(game, "out-game-player-detail-screen");
        this.playerInfoEditManager = new PlayerInfoEditManager(game);

        // PlayerInfoEditManager は showPlayerInfoEdit イベントを購読して
        // プレイヤー情報編集モーダルを管理する
        void this.playerInfoEditManager;
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
