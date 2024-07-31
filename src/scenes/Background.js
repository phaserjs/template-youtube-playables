import { ScaleFlow } from '../core/ScaleFlow';
import { Scene } from 'phaser';

export class Background extends Scene
{
    constructor ()
    {
        super('Background');
    }

    create ()
    {
        const bg = this.add.image(0, 0, 'background');

        bg.setOrigin(0, 0);
        bg.setDisplaySize(ScaleFlow.width, ScaleFlow.height);

        this.ts = this.add.tileSprite(0, 0, ScaleFlow.width, ScaleFlow.height, 'assets', 'tile');
        this.ts.setOrigin(0, 0);
    }

    update ()
    {
        this.ts.tilePositionX -= 2;
    }
}
