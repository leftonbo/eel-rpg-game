import React from 'react';
import { useGameContext } from './game/context/GameContext';
import { GameState } from './game/types/GameState';
import { TitleScreen } from './game/scenes/react/TitleScreen';
import { BossSelectScreen } from './game/scenes/react/BossSelectScreen';

function App(): React.ReactElement {
    const { currentState } = useGameContext();

    return (
        <>
            {currentState === GameState.Title && <TitleScreen />}
            {currentState === GameState.OutGameBossSelect && <BossSelectScreen />}
        </>
    );
}

export default App;
