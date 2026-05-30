import { ReactElement, ReactNode, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { getUnreadCountForPlayer } from '../../data/DocumentLoader';
import { useGameContext } from '../../context/GameContext';
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

function getLibraryUnreadCount(game: ReturnType<typeof useGameContext>['game']): number {
    try {
        const player = game.getPlayer();
        return getUnreadCountForPlayer(
            player,
            player.getExplorerLevel(),
            player.memorialSystem.getVictoriousBossIds(),
            player.memorialSystem.getDefeatedBossIds()
        );
    } catch (error) {
        console.error('Failed to calculate library unread badge:', error);
        return 0;
    }
}

export function LegacyStaticUi({ currentState, children }: LegacyStaticUiProps): ReactElement {
    const { game } = useGameContext();
    const [, setUnreadRefreshKey] = useState(0);
    const outGameVisible = isOutGameState(currentState);
    const battleVisible = currentState === GameState.Battle;
    const battleResultVisible = currentState === GameState.BattleResult;
    const libraryUnreadCount = getLibraryUnreadCount(game);
    const navItems = [
        { id: 'nav-boss-select', state: GameState.OutGameBossSelect, label: '⚔️ ボス選択', i18nKey: 'navigation.bossSelect' },
        { id: 'nav-player-detail', state: GameState.OutGamePlayerDetail, label: '👤 プレイヤー詳細', i18nKey: 'navigation.playerDetail' },
        { id: 'nav-exploration-record', state: GameState.OutGameExplorationRecord, label: '📊 探検記録', i18nKey: 'navigation.explorationRecord' },
        { id: 'nav-library', state: GameState.OutGameLibrary, label: '📚 資料庫', i18nKey: 'navigation.library' },
        { id: 'nav-option', state: GameState.OutGameOption, label: '⚙️ オプション', i18nKey: 'navigation.option' },
        { id: 'nav-changelog', state: GameState.OutGameChangelog, label: '📋 更新履歴', i18nKey: 'navigation.changelog' },
    ];

    useEffect(() => {
        const handleUnreadChange = () => setUnreadRefreshKey((value) => value + 1);
        document.addEventListener('libraryUnreadChanged', handleUnreadChange);
        return () => document.removeEventListener('libraryUnreadChanged', handleUnreadChange);
    }, []);

    return (
        <>
            <div id="out-game-navigation-container" className={`row${outGameVisible ? '' : ' d-none'}`}>
                <Navbar expand="lg" variant="dark" bg="dark" className="w-100">
                    <div className="container-fluid">
                        <Navbar.Brand href="#">🐍 ElnalFTE</Navbar.Brand>
                        <Navbar.Toggle aria-controls="navbarNav" />
                        <Navbar.Collapse id="navbarNav">
                            <Nav className="me-auto">
                                {navItems.map((item) => (
                                    <Nav.Item key={item.id}>
                                        <Nav.Link
                                            as="button"
                                            type="button"
                                            id={item.id}
                                            active={currentState === item.state}
                                            onClick={() => game.setState(item.state)}
                                            data-i18n={item.i18nKey}
                                        >
                                            {item.label}
                                            {item.id === 'nav-library' && libraryUnreadCount > 0 && (
                                                <span className="badge bg-danger unread-badge ms-1">
                                                    {libraryUnreadCount}
                                                </span>
                                            )}
                                        </Nav.Link>
                                    </Nav.Item>
                                ))}
                            </Nav>
                        </Navbar.Collapse>
                    </div>
                </Navbar>
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
                                                <Button type="button" variant="outline-light" size="sm" id="boss-info-btn" title="ボス情報を表示" data-i18n="battle.bossInfoTitle" data-i18n-attr="title">？</Button>
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
                                        <Button id="attack-btn" variant="danger" data-i18n="battleActions.attack">⚔️ 攻撃</Button>
                                        <Button id="defend-btn" variant="primary" data-i18n="battleActions.defend">🛡️ 防御</Button>
                                        <Button id="skill-btn" variant="warning" data-i18n="battleActions.skill">⚡️ スキル</Button>
                                        <Button id="item-btn" variant="success" data-i18n="battleActions.item">💊 アイテム</Button>
                                    </div>
                                    <div id="skill-panel" className="d-none mt-3">
                                        <h6 data-i18n="battleActions.skill">スキル</h6>
                                        <div className="d-grid gap-2">
                                            <Button id="power-attack-btn" variant="outline-danger" title="2.5倍の攻撃力で確実に攻撃（20MP）" data-i18n="skillPanel.powerAttackHint" data-i18n-attr="title"><span data-i18n="skillPanel.powerAttack">💥 パワーアタック</span> <span data-i18n="skillPanel.powerAttackCost">(20MP)</span></Button>
                                            <Button id="heal-skill-btn" variant="outline-success" title="HPを100回復（30MP）" data-i18n="skillPanel.healHint" data-i18n-attr="title"><span data-i18n="skillPanel.heal">✨ ヒール</span> <span data-i18n="skillPanel.healCost">(30MP)</span></Button>
                                            <Button id="struggle-skill-btn" variant="outline-warning" title="拘束状態専用：脱出確率2倍（30MP）" data-i18n="skillPanel.struggleHint" data-i18n-attr="title"><span data-i18n="skillPanel.struggle">🔥 あばれる</span> <span data-i18n="skillPanel.struggleCost">(30MP)</span></Button>
                                            <Button id="ultra-smash-btn" variant="outline-danger" title="全力攻撃" data-i18n="skillPanel.ultraSmashHint" data-i18n-attr="title"><span data-i18n="skillPanel.ultraSmash">💀 ウルトラスマッシュ</span> <span data-i18n="skillPanel.ultraSmashCost">(MP全消費)</span></Button>
                                            <Button id="skill-back-btn" variant="outline-secondary" data-i18n="common.back">戻る</Button>
                                        </div>
                                    </div>
                                    <div id="item-panel" className="d-none mt-3">
                                        <h6 data-i18n="battleActions.item">アイテム</h6>
                                        <div className="d-grid gap-2"><Button id="item-back-btn" variant="outline-secondary" data-i18n="common.back">戻る</Button></div>
                                    </div>
                                    <div id="special-actions" className="d-none">
                                        <div className="d-grid gap-2">
                                            <Button id="struggle-btn" variant="warning" title="拘束から脱出を試みる（成功率は試行回数で上昇）" data-i18n="specialActions.struggleHint" data-i18n-attr="title"><span data-i18n="specialActions.struggle">💪 もがく</span></Button>
                                            <Button id="struggle-skill-special-btn" variant="outline-warning" title="拘束状態専用：脱出確率2倍（30MP）" data-i18n="specialActions.struggleSkillHint" data-i18n-attr="title"><span data-i18n="specialActions.struggleSkill">🔥 あばれる</span> <span data-i18n="specialActions.struggleSkillCost">(30MP)</span></Button>
                                            <Button id="stay-still-btn" variant="info" title="体力を回復する（最大HPの5%）" data-i18n="specialActions.stayStillHint" data-i18n-attr="title"><span data-i18n="specialActions.stayStill">😌 じっとする</span></Button>
                                            <Button id="give-up-btn" variant="secondary" title="何もしない" data-i18n="specialActions.giveUpHint" data-i18n-attr="title"><span data-i18n="specialActions.giveUp">💀 なすがまま</span></Button>
                                            <div id="omamori-special-container" className="d-grid gap-2"></div>
                                        </div>
                                    </div>
                                    <div id="battle-end-actions" className="d-none">
                                        <div className="d-grid gap-2"><Button id="battle-end-btn" variant="success" data-i18n="battle.endBattle">🎯 バトル終了</Button></div>
                                    </div>
                                    <div id="debug-button-container" className="mt-2">
                                        <div className="d-grid gap-2"><Button id="debug-btn" variant="outline-info" size="sm" className="d-none" data-i18n="debug.button">🔧 デバッグ</Button></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="position-fixed bottom-0 start-0 p-3">
                        <Button id="back-to-select-btn" variant="outline-light" data-i18n="battle.backToBossSelect">← ボス選択に戻る</Button>
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
                                    <Button id="battle-result-continue-btn" variant="primary" size="lg" className="mx-auto" data-i18n="battleResult.continue">ボス選択に戻る</Button>
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

        </>
    );
}
