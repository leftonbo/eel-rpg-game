import { GameState } from '../types/GameState';
import { Player } from '../entities/Player';

/**
 * BaseOutGameSceneで必要なGameのインターフェース
 * 循環参照を避けるために最小限のメソッドのみを定義
 */
export interface IGameContext {
    /**
     * ゲームの状態を設定する
     */
    setState(newState: GameState): void;
    
    /**
     * 現在のゲーム状態を取得する
     */
    getCurrentState(): GameState;
    
    /**
     * プレイヤーオブジェクトを取得する
     */
    getPlayer(): Player;
}