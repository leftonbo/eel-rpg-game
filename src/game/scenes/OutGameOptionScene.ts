import { Game } from '../Game';
import { BaseOutGameScene } from './BaseOutGameScene';

export class OutGameOptionScene extends BaseOutGameScene {
    
    constructor(game: Game) {
        super(game, 'out-game-option-screen');
    }
    
    enter(): void {
        this.updateNavigationActiveState();
    }
}
