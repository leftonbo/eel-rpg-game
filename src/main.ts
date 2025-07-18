import './styles/main.css';
import { Game } from './game/Game';

// Declare bootstrap as a global variable
declare global {
    interface Window {
        bootstrap: any;
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Eel Feed - Starting game...');
    
    // Create and start the game
    const game = new Game();
    
    // Make game globally accessible for debugging
    (window as any).game = game;
    
    console.log('Eel Feed - Game initialized');
});