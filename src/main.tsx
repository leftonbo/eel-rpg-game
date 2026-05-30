import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/main.css';
import { Game } from './game/Game';
import './game/types/bootstrap';
import { initI18n, onLanguageChanged } from './game/i18n';
import { applyTranslations } from './game/i18n/dom';
import { GameProvider } from './game/context/GameContext';
import App from './App';

declare global {
    const DEBUG: boolean;
}

async function main() {
    await initI18n();
    applyTranslations();

    const game = new Game();

    onLanguageChanged(() => {
        applyTranslations();
        game.refreshLocalization();
    });

    // Make game globally accessible for debugging
    window.game = game;

    const rootEl = document.getElementById('react-root');
    if (!rootEl) throw new Error('[main] #react-root element not found');

    const root = createRoot(rootEl);
    root.render(
        <React.StrictMode>
            <GameProvider game={game}>
                <App />
            </GameProvider>
        </React.StrictMode>
    );
}

main().catch(console.error);
