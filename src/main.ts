import './styles/main.css';
import { Game } from './game/Game';
import './game/types/bootstrap';

// Declare global variables
declare global {
    const DEBUG: boolean;
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('[ElnalFTB] Starting game...');
    
    // Create and start the game
    const game = new Game();
    
    // Make game globally accessible for debugging
    window.game = game;
    
    console.log('[ElnalFTB] Game initialized');
});