import { ScaleFlow } from '../core/ScaleFlow';
import { Scene } from 'phaser';
import { YouTubePlayables } from '../YouTubePlayables';

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    init ()
    {
        ScaleFlow.addCamera(this.cameras.main);

        this.events.on('shutdown', this.shutdown, this);
    }

    create ()
    {
        this.scene.launch('GameBackground');
        this.scene.bringToTop();
        // this.scene.launch('Debug');

        const cx = ScaleFlow.center.x;
        const cy = ScaleFlow.center.y;

        const basket = this.add.image(cx, 80+90, 'basket').setOrigin(0.5, 0);

        const hoop = this.add.image(cx, 238+90, 'hoop').setOrigin(0.5, 0).setDepth(10);

        const ball = this.add.image(cx-8, 230+90, 'ball');

        this.add.image(cx, 0, 'swish');
        this.add.image(cx, 1100, 'hand');


    }

    shutdown ()
    {
        ScaleFlow.removeCamera(this.cameras.main);
    }
}
