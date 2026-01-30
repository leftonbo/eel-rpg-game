import './styles/main.css';
import { Game } from './game/Game';
import './game/types/bootstrap';
import { applyI18nToDocument, initI18n } from './game/i18n';

// Declare global variables
declare global {
    const DEBUG: boolean;
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[ElnalFTE] Starting game...');

    await initI18n();
    applyI18nToDocument();
    
    // Create and start the game
    const game = new Game();
    
    // Make game globally accessible for debugging
    window.game = game;
    
    console.log('[ElnalFTE] Game initialized');
});
