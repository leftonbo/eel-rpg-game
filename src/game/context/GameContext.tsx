import React, { createContext, useContext, useState, useEffect } from 'react';
import { Game } from '../Game';
import { GameState } from '../types/GameState';

interface GameContextValue {
    game: Game;
    currentState: GameState;
}

const GameContextObj = createContext<GameContextValue | null>(null);

export function useGameContext(): GameContextValue {
    const ctx = useContext(GameContextObj);
    if (!ctx) throw new Error('useGameContext must be used within GameProvider');
    return ctx;
}

interface GameProviderProps {
    game: Game;
    children: React.ReactNode;
}

export function GameProvider({ game, children }: GameProviderProps): React.ReactElement {
    const [currentState, setCurrentState] = useState<GameState>(GameState.Initial);

    useEffect(() => {
        game.setReactStateCallback(setCurrentState);
        return () => game.setReactStateCallback(undefined);
    }, [game]);

    return (
        <GameContextObj.Provider value={{ game, currentState }}>
            {children}
        </GameContextObj.Provider>
    );
}
