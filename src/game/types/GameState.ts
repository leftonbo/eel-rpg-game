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
     * 戦闘画面。プレイヤーがボスと戦う状態
     */
    Battle = 'battle',
    /**
     * 戦闘結果画面。戦闘の結果が表示される状態
     */
    BattleResult = 'battle-result',
    /**
     * アウトゲーム - ボス選択画面
     */
    OutGameBossSelect = 'out-game-boss-select',
    /**
     * アウトゲーム - プレイヤー詳細画面
     */
    OutGamePlayerDetail = 'out-game-player-detail',
    /**
     * アウトゲーム - 探検記録画面
     */
    OutGameExplorationRecord = 'out-game-exploration-record',
    /**
     * アウトゲーム - 資料庫画面
     */
    OutGameLibrary = 'out-game-library',
    /**
     * アウトゲーム - オプション画面
     */
    OutGameOption = 'out-game-option',
    /**
     * アウトゲーム - 更新履歴画面
     */
    OutGameChangelog = 'out-game-changelog'
}