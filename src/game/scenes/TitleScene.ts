import { Game } from '../Game';

export class TitleScene {
    private game: Game;
    private startButton: HTMLElement | null = null;
    
    constructor(game: Game) {
        this.game = game;
        this.init();
    }
    
    private init(): void {
        this.startButton = document.getElementById('start-button');
        
        if (this.startButton) {
            this.startButton.addEventListener('click', () => {
                this.onStartClick();
            });
        }
    }
    
    enter(): void {
        // Title scene entered - could add animations or music here
        console.log('Entered title scene');
    }
    
    private onStartClick(): void {
        // Add button click effect
        if (this.startButton) {
            this.startButton.classList.add('disabled');
            setTimeout(() => {
                this.startButton?.classList.remove('disabled');
            }, 500);
        }
        
        // Start the game
        this.game.startGame();
    }
}