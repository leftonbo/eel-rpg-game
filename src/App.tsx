import React from 'react';
import { useGameContext } from './game/context/GameContext';
import { GameState } from './game/types/GameState';
import { TitleScreen } from './game/scenes/react/TitleScreen';

function App(): React.ReactElement {
    const { currentState } = useGameContext();

    return (
        <>
            {currentState === GameState.Title && <TitleScreen />}
        </>
    );
}

export default App;
