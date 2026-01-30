import './styles/main.css';
import { Game } from './game/Game';
import './game/types/bootstrap';
import { initI18n, onLanguageChanged } from './game/i18n';
import { applyTranslations } from './game/i18n/dom';

// Declare global variables
declare global {
    const DEBUG: boolean;
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[ElnalFTE] Starting game...');

    await initI18n();
    applyTranslations();

    // Create and start the game
    const game = new Game();

    onLanguageChanged(() => {
        applyTranslations();
        game.refreshLocalization();
    });

    // Make game globally accessible for debugging
    window.game = game;

    console.log('[ElnalFTE] Game initialized');
});
