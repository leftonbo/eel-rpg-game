import { ReactElement, ReactNode } from 'react';
import { GameState } from '../../types/GameState';

interface LegacyStaticUiProps {
    currentState: GameState;
    children?: ReactNode;
}

function isOutGameState(state: GameState): boolean {
    return state === GameState.OutGameBossSelect ||
        state === GameState.OutGamePlayerDetail ||
        state === GameState.OutGameExplorationRecord ||
        state === GameState.OutGameLibrary ||
        state === GameState.OutGameOption ||
        state === GameState.OutGameChangelog;
}

export function LegacyStaticUi({ currentState, children }: LegacyStaticUiProps): ReactElement {
    const outGameVisible = isOutGameState(currentState);
    const battleVisible = currentState === GameState.Battle;
    const battleResultVisible = currentState === GameState.BattleResult;

    return (
        <>
            <div id="out-game-navigation-container" className={`row${outGameVisible ? '' : ' d-none'}`}>
                <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                    <div className="container-fluid">
                        <a className="navbar-brand" href="#">🐍 ElnalFTE</a>
                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="navbarNav">
                            <ul className="navbar-nav me-auto">
                                <li className="nav-item"><button className="nav-link btn btn-link" id="nav-boss-select" data-i18n="navigation.bossSelect">⚔️ ボス選択</button></li>
                                <li className="nav-item"><button className="nav-link btn btn-link" id="nav-player-detail" data-i18n="navigation.playerDetail">👤 プレイヤー詳細</button></li>
                                <li className="nav-item"><button className="nav-link btn btn-link" id="nav-exploration-record" data-i18n="navigation.explorationRecord">📊 探検記録</button></li>
                                <li className="nav-item"><button className="nav-link btn btn-link" id="nav-library" data-i18n="navigation.library">📚 資料庫</button></li>
                                <li className="nav-item"><button className="nav-link btn btn-link" id="nav-option" data-i18n="navigation.option">⚙️ オプション</button></li>
                                <li className="nav-item"><button className="nav-link btn btn-link" id="nav-changelog" data-i18n="navigation.changelog">📋 更新履歴</button></li>
                            </ul>
                        </div>
                    </div>
                </nav>
            </div>

            <main className="flex-grow-1">
                {children}
                <div id="battle-screen" className={`scene${battleVisible ? '' : ' d-none'}`}>
                    <div className="row h-100">
                        <div className="col-12 mb-3">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="card bg-primary">
                                        <div className="card-header">
                                            <h5 className="mb-0"><span id="battle-player-icon">🐍</span> <span id="battle-player-name">エルナル</span></h5>
                                        </div>
                                        <div className="card-body">
                                            <div className="mb-2">
                                                <span data-i18n="common.hp">ヘルス</span>: <span id="player-hp">1000</span> / <span id="player-max-hp">1000</span>
                                                <div id="player-hp-progress" className="progress"><div id="player-hp-bar" className="progress-bar bg-success"></div></div>
                                            </div>
                                            <div className="mb-2">
                                                <span data-i18n="common.mp">マナ</span>: <span id="player-mp">40</span> / <span id="player-max-mp">40</span>
                                                <div id="player-mp-progress" className="progress"><div id="player-mp-bar" className="progress-bar bg-info"></div></div>
                                            </div>
                                            <div id="player-status-effects" className="mt-2"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="card bg-danger">
                                        <div className="card-header">
                                            <h5 className="mb-0 d-flex justify-content-between align-items-center">
                                                <span><span id="boss-icon">👹</span> <span id="boss-name">ボス名</span></span>
                                                <button type="button" className="btn btn-sm btn-outline-light" id="boss-info-btn" title="ボス情報を表示" data-i18n="battle.bossInfoTitle" data-i18n-attr="title">？</button>
                                            </h5>
                                        </div>
                                        <div className="card-body">
                                            <div className="mb-2">
                                                <span data-i18n="common.hp">ヘルス</span>: <span id="boss-hp">0</span> / <span id="boss-max-hp">0</span>
                                                <div id="boss-hp-progress" className="progress"><div id="boss-hp-bar" className="progress-bar bg-danger"></div></div>
                                            </div>
                                            <div id="boss-status-effects" className="mt-2"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-8">
                            <div className="card bg-dark border-secondary h-100">
                                <div className="card-header"><h6 className="mb-0" data-i18n="battle.logTitle">バトルログ</h6></div>
                                <div className="card-body overflow-auto max-height-400" id="battle-log">
                                    <p className="text-muted" data-i18n="battle.logStart">バトル開始！</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card bg-secondary h-100">
                                <div className="card-header"><h6 className="mb-0" data-i18n="battle.actionTitle">行動選択</h6></div>
                                <div className="card-body">
                                    <div id="action-buttons" className="d-grid gap-2">
                                        <button id="attack-btn" className="btn btn-danger" data-i18n="battleActions.attack">⚔️ 攻撃</button>
                                        <button id="defend-btn" className="btn btn-primary" data-i18n="battleActions.defend">🛡️ 防御</button>
                                        <button id="skill-btn" className="btn btn-warning" data-i18n="battleActions.skill">⚡️ スキル</button>
                                        <button id="item-btn" className="btn btn-success" data-i18n="battleActions.item">💊 アイテム</button>
                                    </div>
                                    <div id="skill-panel" className="d-none mt-3">
                                        <h6 data-i18n="battleActions.skill">スキル</h6>
                                        <div className="d-grid gap-2">
                                            <button id="power-attack-btn" className="btn btn-outline-danger" title="2.5倍の攻撃力で確実に攻撃（20MP）" data-i18n="skillPanel.powerAttackHint" data-i18n-attr="title"><span data-i18n="skillPanel.powerAttack">💥 パワーアタック</span> <span data-i18n="skillPanel.powerAttackCost">(20MP)</span></button>
                                            <button id="heal-skill-btn" className="btn btn-outline-success" title="HPを100回復（30MP）" data-i18n="skillPanel.healHint" data-i18n-attr="title"><span data-i18n="skillPanel.heal">✨ ヒール</span> <span data-i18n="skillPanel.healCost">(30MP)</span></button>
                                            <button id="struggle-skill-btn" className="btn btn-outline-warning" title="拘束状態専用：脱出確率2倍（30MP）" data-i18n="skillPanel.struggleHint" data-i18n-attr="title"><span data-i18n="skillPanel.struggle">🔥 あばれる</span> <span data-i18n="skillPanel.struggleCost">(30MP)</span></button>
                                            <button id="ultra-smash-btn" className="btn btn-outline-danger" title="全力攻撃" data-i18n="skillPanel.ultraSmashHint" data-i18n-attr="title"><span data-i18n="skillPanel.ultraSmash">💀 ウルトラスマッシュ</span> <span data-i18n="skillPanel.ultraSmashCost">(MP全消費)</span></button>
                                            <button id="skill-back-btn" className="btn btn-outline-secondary" data-i18n="common.back">戻る</button>
                                        </div>
                                    </div>
                                    <div id="item-panel" className="d-none mt-3">
                                        <h6 data-i18n="battleActions.item">アイテム</h6>
                                        <div className="d-grid gap-2"><button id="item-back-btn" className="btn btn-outline-secondary" data-i18n="common.back">戻る</button></div>
                                    </div>
                                    <div id="special-actions" className="d-none">
                                        <div className="d-grid gap-2">
                                            <button id="struggle-btn" className="btn btn-warning" title="拘束から脱出を試みる（成功率は試行回数で上昇）" data-i18n="specialActions.struggleHint" data-i18n-attr="title"><span data-i18n="specialActions.struggle">💪 もがく</span></button>
                                            <button id="struggle-skill-special-btn" className="btn btn-outline-warning" title="拘束状態専用：脱出確率2倍（30MP）" data-i18n="specialActions.struggleSkillHint" data-i18n-attr="title"><span data-i18n="specialActions.struggleSkill">🔥 あばれる</span> <span data-i18n="specialActions.struggleSkillCost">(30MP)</span></button>
                                            <button id="stay-still-btn" className="btn btn-info" title="体力を回復する（最大HPの5%）" data-i18n="specialActions.stayStillHint" data-i18n-attr="title"><span data-i18n="specialActions.stayStill">😌 じっとする</span></button>
                                            <button id="give-up-btn" className="btn btn-secondary" title="何もしない" data-i18n="specialActions.giveUpHint" data-i18n-attr="title"><span data-i18n="specialActions.giveUp">💀 なすがまま</span></button>
                                            <div id="omamori-special-container" className="d-grid gap-2"></div>
                                        </div>
                                    </div>
                                    <div id="battle-end-actions" className="d-none">
                                        <div className="d-grid gap-2"><button id="battle-end-btn" className="btn btn-success" data-i18n="battle.endBattle">🎯 バトル終了</button></div>
                                    </div>
                                    <div id="debug-button-container" className="mt-2">
                                        <div className="d-grid gap-2"><button id="debug-btn" className="btn btn-outline-info btn-sm d-none" data-i18n="debug.button">🔧 デバッグ</button></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="position-fixed bottom-0 start-0 p-3">
                        <button id="back-to-select-btn" className="btn btn-outline-light" data-i18n="battle.backToBossSelect">← ボス選択に戻る</button>
                    </div>
                </div>

                <div id="battle-result-screen" className={`scene vh-100${battleResultVisible ? '' : ' d-none'}`}>
                    <div className="container-fluid h-100 d-flex align-items-center justify-content-center">
                        <div className="col-md-8 col-lg-6">
                            <div className="card bg-dark border-info">
                                <div className="card-body text-center">
                                    <h2 id="battle-result-title" className="text-info mb-4" data-i18n="battleResult.title">バトル結果</h2>
                                    <div id="experience-gained" className="mb-4"></div>
                                    <div id="level-ups" className="mb-4 battle-result-section"></div>
                                    <div id="new-unlocks" className="mb-4 battle-result-section"></div>
                                    <div id="trophies-earned" className="mb-4 battle-result-section"></div>
                                    <div id="new-boss-unlocks" className="mb-4 battle-result-section"></div>
                                    <button id="battle-result-continue-btn" className="btn btn-primary btn-lg mx-auto" data-i18n="battleResult.continue">ボス選択に戻る</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <div id="out-game-footer-container" className={`row mt-auto${outGameVisible ? '' : ' d-none'}`}>
                <footer className="mt-auto py-3 bg-dark border-top">
                    <div className="container-fluid">
                        <div className="row align-items-center">
                            <div className="col-md-6"><p className="text-muted mb-0">©2025 LefTonbo</p></div>
                            <div className="col-md-6 text-md-end">
                                <a href="https://docs.google.com/forms/d/e/1FAIpQLSdqmS0cBr6PTiZt5VsxuuK4LTe3FCLA8mAveDZJxzpeRDSnTw/viewform?usp=dialog" target="_blank" className="text-decoration-none text-muted me-3" rel="noreferrer">
                                    <svg width="20" height="20" fill="currentColor" className="me-2" viewBox="0 0 16 16"><path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/><path d="M5 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/></svg>
                                    <span data-i18n="footer.feedback">感想を送る</span>
                                </a>
                                <a href="https://docs.google.com/forms/d/e/1FAIpQLSdtzWzOkkKQIMdOju3Zsm0Tiawu8MPchtQDnazFyyJuUSnCNw/viewform?usp=dialog" target="_blank" className="text-decoration-none text-muted me-3" rel="noreferrer">
                                    <svg width="20" height="20" fill="currentColor" className="me-2" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/></svg>
                                    <span data-i18n="footer.bossRequest">新ボスリクエスト</span>
                                </a>
                                <a href="https://github.com/leftonbo/eel-rpg-game" target="_blank" className="text-decoration-none text-muted" rel="noreferrer">
                                    <svg width="20" height="20" fill="currentColor" className="me-2" viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
                                    <span data-i18n="footer.github">GitHub</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

            <div className="modal fade" id="boss-modal" tabIndex={-1}>
                <div className="modal-dialog"><div className="modal-content bg-dark">
                    <div className="modal-header">
                        <h1 className="modal-title fs-3"><span id="modal-boss-icon">👹</span> <span id="modal-boss-name">ボス名</span></h1>
                        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div className="modal-body">
                        <h2 id="modal-boss-description" className="fs-5">ボスの説明</h2>
                        <p id="modal-boss-stats"></p>
                        <hr />
                        <h2 className="fs-5" data-i18n="bossModal.questTitle">討伐クエスト内容</h2>
                        <p id="modal-boss-quest-note"></p>
                        <hr />
                        <p id="modal-boss-appearance" className="d-none"></p>
                        <p id="modal-boss-guest-info" className="d-none"></p>
                    </div>
                    <div id="modal-boss-buttons-confirm" className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" data-i18n="bossModal.buttons.cancel">キャンセル</button>
                        <button type="button" className="btn btn-primary" id="confirm-boss-btn" data-i18n="bossModal.buttons.confirm">戦闘開始！</button>
                    </div>
                    <div id="modal-boss-buttons-back" className="modal-footer d-none">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" data-i18n="bossModal.buttons.back">戻る</button>
                    </div>
                </div></div>
            </div>

            <div className="modal fade" id="debug-modal" tabIndex={-1}>
                <div className="modal-dialog modal-xl"><div className="modal-content bg-dark">
                    <div className="modal-header">
                        <h5 className="modal-title text-warning" data-i18n="debug.title">🔧 デバッグコンソール</h5>
                        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div className="modal-body">
                        <div className="row">
                            <div className="col-md-6 mb-4">
                                <div className="card bg-primary"><div className="card-header"><h5 className="mb-0" data-i18n="debug.playerTitle">🐍 プレイヤー</h5></div>
                                    <div className="card-body">
                                        <div className="row mb-3">
                                            <div className="col-6"><label className="form-label" data-i18n="common.hpShort">HP</label><input type="number" id="debug-player-hp" className="form-control" min="0" /></div>
                                            <div className="col-6"><label className="form-label" data-i18n="common.maxHp">最大HP</label><input type="number" id="debug-player-max-hp" className="form-control" min="1" /></div>
                                        </div>
                                        <div className="row mb-3">
                                            <div className="col-6"><label className="form-label" data-i18n="common.mpShort">MP</label><input type="number" id="debug-player-mp" className="form-control" min="0" /></div>
                                            <div className="col-6"><label className="form-label" data-i18n="common.maxMp">最大MP</label><input type="number" id="debug-player-max-mp" className="form-control" min="0" /></div>
                                        </div>
                                        <h6 data-i18n="common.statusEffects">ステータス効果</h6>
                                        <div id="debug-player-status-effects" className="mb-3"></div>
                                        <button id="debug-add-player-status" className="btn btn-sm btn-outline-light"><span data-i18n="debug.addStatusEffect">ステータス効果を追加</span></button>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6 mb-4">
                                <div className="card bg-danger"><div className="card-header"><h5 id="debug-boss-name" className="mb-0">👹 <span data-i18n="common.boss">ボス</span></h5></div>
                                    <div className="card-body">
                                        <div className="row mb-3">
                                            <div className="col-6"><label className="form-label" data-i18n="common.hpShort">HP</label><input type="number" id="debug-boss-hp" className="form-control" min="0" /></div>
                                            <div className="col-6"><label className="form-label" data-i18n="common.maxHp">最大HP</label><input type="number" id="debug-boss-max-hp" className="form-control" min="1" /></div>
                                        </div>
                                        <h6 data-i18n="common.statusEffects">ステータス効果</h6>
                                        <div id="debug-boss-status-effects" className="mb-3"></div>
                                        <button id="debug-add-boss-status" className="btn btn-sm btn-outline-light"><span data-i18n="debug.addStatusEffect">ステータス効果を追加</span></button>
                                        <h6 className="mt-4" data-i18n="common.customVariables">カスタム変数</h6>
                                        <div id="debug-boss-custom-vars" className="mb-3"></div>
                                        <button id="debug-add-custom-var" className="btn btn-sm btn-outline-light"><span data-i18n="debug.addCustomVar">変数を追加</span></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" data-i18n="dialogs.common.cancel">キャンセル</button>
                        <button id="debug-apply-changes" className="btn btn-success"><span data-i18n="debug.applyChanges">✅ 変更を適用</span></button>
                    </div>
                </div></div>
            </div>

            <div className="modal fade" id="alert-modal" tabIndex={-1} aria-labelledby="alert-modal-label" aria-hidden="true">
                <div className="modal-dialog"><div className="modal-content bg-dark"><div className="modal-header"><h5 className="modal-title" id="alert-modal-label"><span data-i18n="dialogs.common.alert.title">通知</span></h5><button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" data-i18n="common.close" data-i18n-attr="aria-label"></button></div><div className="modal-body"><div id="alert-modal-body"></div></div><div className="modal-footer"><button type="button" className="btn btn-primary" data-bs-dismiss="modal" data-i18n="dialogs.common.ok">OK</button></div></div></div>
            </div>
            <div className="modal fade" id="confirm-modal" tabIndex={-1} aria-labelledby="confirm-modal-label" aria-hidden="true">
                <div className="modal-dialog"><div className="modal-content bg-dark"><div className="modal-header"><h5 className="modal-title" id="confirm-modal-label"><span data-i18n="dialogs.common.confirm.title">確認</span></h5><button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" data-i18n="common.close" data-i18n-attr="aria-label"></button></div><div className="modal-body"><div id="confirm-modal-body"></div></div><div className="modal-footer"><button type="button" className="btn btn-secondary" data-bs-dismiss="modal" id="confirm-cancel-btn" data-i18n="dialogs.common.cancel">キャンセル</button><button type="button" className="btn btn-danger" id="confirm-ok-btn" data-i18n="dialogs.common.ok">OK</button></div></div></div>
            </div>
            <div className="modal fade" id="prompt-modal" tabIndex={-1} aria-labelledby="prompt-modal-label" aria-hidden="true">
                <div className="modal-dialog"><div className="modal-content bg-dark"><div className="modal-header"><h5 className="modal-title" id="prompt-modal-label"><span data-i18n="dialogs.common.prompt.title">入力</span></h5><button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" data-i18n="common.close" data-i18n-attr="aria-label"></button></div><div className="modal-body"><div id="prompt-modal-body" className="mb-3"></div><input type="text" className="form-control" id="prompt-modal-input" placeholder="入力してください" data-i18n="dialogs.common.prompt.placeholder" data-i18n-attr="placeholder" /></div><div className="modal-footer"><button type="button" className="btn btn-secondary" data-bs-dismiss="modal" id="prompt-cancel-btn" data-i18n="dialogs.common.cancel">キャンセル</button><button type="button" className="btn btn-primary" id="prompt-ok-btn" data-i18n="dialogs.common.ok">OK</button></div></div></div>
            </div>
            <div className="modal fade" id="select-modal" tabIndex={-1} aria-labelledby="select-modal-label" aria-hidden="true">
                <div className="modal-dialog"><div className="modal-content bg-dark"><div className="modal-header"><h5 className="modal-title" id="select-modal-label"><span data-i18n="dialogs.common.selectTitle">選択</span></h5><button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" data-i18n="common.close" data-i18n-attr="aria-label"></button></div><div className="modal-body"><div id="select-modal-body" className="mb-3"></div><select className="form-select" id="select-modal-select"></select></div><div className="modal-footer"><button type="button" className="btn btn-secondary" data-bs-dismiss="modal" id="select-cancel-btn" data-i18n="dialogs.common.cancel">キャンセル</button><button type="button" className="btn btn-primary" id="select-ok-btn" data-i18n="dialogs.common.select">選択</button></div></div></div>
            </div>
            <div className="modal fade" id="custom-var-modal" tabIndex={-1} aria-labelledby="custom-var-modal-label" aria-hidden="true">
                <div className="modal-dialog"><div className="modal-content bg-dark"><div className="modal-header"><h5 className="modal-title" id="custom-var-modal-label"><span data-i18n="dialogs.customVar.title">カスタム変数を追加</span></h5><button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" data-i18n="common.close" data-i18n-attr="aria-label"></button></div><div className="modal-body"><div id="custom-var-error" className="alert alert-danger d-none mb-3" role="alert"></div><div className="mb-3"><label htmlFor="custom-var-key" className="form-label" data-i18n="dialogs.customVar.keyLabel">変数名</label><input type="text" className="form-control" id="custom-var-key" placeholder="変数名を入力してください" data-i18n="dialogs.customVar.keyPlaceholder" data-i18n-attr="placeholder" /></div><div className="mb-3"><label htmlFor="custom-var-value" className="form-label" data-i18n="dialogs.customVar.valueLabel">値</label><input type="text" className="form-control" id="custom-var-value" placeholder="値を入力してください" data-i18n="dialogs.customVar.valuePlaceholder" data-i18n-attr="placeholder" /><div className="form-text" data-i18n="dialogs.customVar.helper">数値やtrue/falseは自動的に変換されます</div></div></div><div className="modal-footer"><button type="button" className="btn btn-secondary" data-bs-dismiss="modal" data-i18n="dialogs.common.cancel">キャンセル</button><button type="button" className="btn btn-primary" id="custom-var-add-btn" data-i18n="common.add">追加</button></div></div></div>
            </div>
            <div className="modal fade" id="status-effect-modal" tabIndex={-1} aria-labelledby="status-effect-modal-label" aria-hidden="true">
                <div className="modal-dialog"><div className="modal-content bg-dark"><div className="modal-header"><h5 className="modal-title" id="status-effect-modal-label"><span data-i18n="dialogs.statusEffect.titleDefault">ステータス効果を追加</span></h5><button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" data-i18n="common.close" data-i18n-attr="aria-label"></button></div><div className="modal-body"><div id="status-effect-error" className="alert alert-danger d-none mb-3" role="alert"></div><div className="mb-3"><label htmlFor="status-effect-type" className="form-label" data-i18n="dialogs.statusEffect.typeLabel">ステータス効果</label><select className="form-select" id="status-effect-type"></select></div><div className="mb-3"><label htmlFor="status-effect-duration" className="form-label" data-i18n="dialogs.statusEffect.durationLabel">持続ターン数</label><input type="number" className="form-control" id="status-effect-duration" defaultValue="3" min="1" max="99" /></div></div><div className="modal-footer"><button type="button" className="btn btn-secondary" data-bs-dismiss="modal" data-i18n="dialogs.common.cancel">キャンセル</button><button type="button" className="btn btn-primary" id="status-effect-add-btn" data-i18n="common.add">追加</button></div></div></div>
            </div>

            <div className="modal fade" id="player-info-edit-modal" tabIndex={-1}>
                <div className="modal-dialog"><div className="modal-content bg-dark">
                    <div className="modal-header"><h5 className="modal-title" data-i18n="playerInfoEdit.title">プレイヤー情報編集</h5><button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button></div>
                    <div className="modal-body">
                        <div className="mb-3">
                            <label htmlFor="player-name-input" className="form-label" data-i18n="playerInfoEdit.nameLabel">名前（32文字まで）</label>
                            <input type="text" className="form-control" id="player-name-input" maxLength={32} placeholder="プレイヤー名を入力" data-i18n="playerInfoEdit.namePlaceholder" data-i18n-attr="placeholder" />
                            <div className="form-text"><span data-i18n="playerInfoEdit.currentName">現在の名前</span>: <span id="current-player-name">エルナル</span></div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label" data-i18n="playerInfoEdit.iconLabel">アイコン選択</label>
                            <div className="form-text mb-2"><span data-i18n="playerInfoEdit.currentIcon">現在のアイコン</span>: <span id="current-player-icon">🐍</span></div>
                            <ul className="nav nav-pills nav-sm mb-3" id="icon-category-tabs">
                                <li className="nav-item"><a className="nav-link active" data-category="動物" href="#" data-icon-category="動物" data-i18n="playerInfoEdit.iconCategories.animal">動物</a></li>
                                <li className="nav-item"><a className="nav-link" data-category="ファンタジー" href="#" data-icon-category="ファンタジー" data-i18n="playerInfoEdit.iconCategories.fantasy">ファンタジー</a></li>
                                <li className="nav-item"><a className="nav-link" data-category="自然" href="#" data-icon-category="自然" data-i18n="playerInfoEdit.iconCategories.nature">自然</a></li>
                                <li className="nav-item"><a className="nav-link" data-category="武器" href="#" data-icon-category="武器" data-i18n="playerInfoEdit.iconCategories.weapon">武器</a></li>
                                <li className="nav-item"><a className="nav-link" data-category="エレメント" href="#" data-icon-category="エレメント" data-i18n="playerInfoEdit.iconCategories.element">エレメント</a></li>
                            </ul>
                            <div id="icon-selection-grid" className="border rounded p-2" style={{ maxHeight: '200px', overflowY: 'auto' }}></div>
                            <div className="form-text"><span data-i18n="playerInfoEdit.selectedIcon">選択中のアイコン</span>: <span id="selected-player-icon">🐍</span></div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" data-i18n="dialogs.common.cancel">キャンセル</button>
                        <button type="button" className="btn btn-warning" id="reset-player-info-btn" data-i18n="playerInfoEdit.reset">🔄 リセット</button>
                        <button type="button" className="btn btn-primary" id="save-player-info-btn" data-i18n="playerInfoEdit.save">保存</button>
                    </div>
                </div></div>
            </div>
        </>
    );
}
