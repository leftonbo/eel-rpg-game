import { Game } from '../Game';
import { BaseOutGameScene } from './BaseOutGameScene';

export class OutGameLibraryScene extends BaseOutGameScene {
    
    constructor(game: Game) {
        super(game, 'out-game-library-screen');
    }
    
    enter(): void {
        this.updateNavigationActiveState();
    }
}
