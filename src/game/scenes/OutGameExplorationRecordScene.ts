import { Game } from '../Game';
import { BaseOutGameScene } from './BaseOutGameScene';

export class OutGameExplorationRecordScene extends BaseOutGameScene {
    
    constructor(game: Game) {
        super(game, 'out-game-exploration-record-screen');
    }
    
    enter(): void {
        this.updateNavigationActiveState();
    }
}
