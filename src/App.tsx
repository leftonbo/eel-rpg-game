import { useGameContext } from './game/context/GameContext';
import { GameState } from './game/types/GameState';
import { TitleScreen } from './game/scenes/react/TitleScreen';
import { BossSelectScreen } from './game/scenes/react/BossSelectScreen';
import { PlayerDetailScreen } from './game/scenes/react/PlayerDetailScreen';
import { ExplorationRecordScreen } from './game/scenes/react/ExplorationRecordScreen';
import { LibraryScreen } from './game/scenes/react/LibraryScreen';
import { OptionScreen } from './game/scenes/react/OptionScreen';
import { ChangelogScreen } from './game/scenes/react/ChangelogScreen';
import { LegacyStaticUi } from './game/scenes/react/LegacyStaticUi';

function App() {
    const { currentState } = useGameContext();

    return (
        <div id="game-container" className="container-fluid min-vh-100 d-flex flex-column">
            <LegacyStaticUi currentState={currentState}>
                {currentState === GameState.Title && <TitleScreen />}
                {currentState === GameState.OutGameBossSelect && <BossSelectScreen />}
                {currentState === GameState.OutGamePlayerDetail && <PlayerDetailScreen />}
                {currentState === GameState.OutGameExplorationRecord && <ExplorationRecordScreen />}
                {currentState === GameState.OutGameLibrary && <LibraryScreen />}
                {currentState === GameState.OutGameOption && <OptionScreen />}
                {currentState === GameState.OutGameChangelog && <ChangelogScreen />}
            </LegacyStaticUi>
        </div>
    );
}

export default App;
