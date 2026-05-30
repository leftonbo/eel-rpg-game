import React from 'react';
import { useGameContext } from './game/context/GameContext';
import { GameState } from './game/types/GameState';
import { TitleScreen } from './game/scenes/react/TitleScreen';
import { BossSelectScreen } from './game/scenes/react/BossSelectScreen';
import { PlayerDetailScreen } from './game/scenes/react/PlayerDetailScreen';
import { ExplorationRecordScreen } from './game/scenes/react/ExplorationRecordScreen';
import { LibraryScreen } from './game/scenes/react/LibraryScreen';
import { OptionScreen } from './game/scenes/react/OptionScreen';
import { ChangelogScreen } from './game/scenes/react/ChangelogScreen';

function App(): React.ReactElement {
    const { currentState } = useGameContext();

    return (
        <>
            {currentState === GameState.Title && <TitleScreen />}
            {currentState === GameState.OutGameBossSelect && <BossSelectScreen />}
            {currentState === GameState.OutGamePlayerDetail && <PlayerDetailScreen />}
            {currentState === GameState.OutGameExplorationRecord && <ExplorationRecordScreen />}
            {currentState === GameState.OutGameLibrary && <LibraryScreen />}
            {currentState === GameState.OutGameOption && <OptionScreen />}
            {currentState === GameState.OutGameChangelog && <ChangelogScreen />}
        </>
    );
}

export default App;
