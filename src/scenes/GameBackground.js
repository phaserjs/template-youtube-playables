import { ScaleFlow } from '../core/ScaleFlow';
import { Scene } from 'phaser';

export class GameBackground extends Scene
{
    constructor ()
    {
        super('GameBackground');
    }

    create ()
    {
        const bg = this.add.image(0, 0, 'gameBackground');

        bg.setOrigin(0, 0);
        bg.setDisplaySize(ScaleFlow.width, ScaleFlow.height);
    }
}
