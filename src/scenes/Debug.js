import { ScaleFlow } from '../core/ScaleFlow';
import { Scene } from 'phaser';

export class Debug extends Scene
{
    gameZoneLeft;
    gameZoneRight;
    gameZoneTop;
    gameZoneBottom;

    constructor ()
    {
        super('Debug');
    }

    init ()
    {
        ScaleFlow.addCamera(this.cameras.main);

        this.events.on('shutdown', this.shutdown, this);
    }

    create ()
    {
        const color = 0x00ff00;
        const alpha = 0.85;
        const size = 16;

        this.gameZoneLeft = this.add.rectangle(0, 0, size, size, color).setAlpha(alpha);
        this.gameZoneRight = this.add.rectangle(0, 0, size, size, color).setAlpha(alpha);
        this.gameZoneTop = this.add.rectangle(0, 0, size, size, color).setAlpha(alpha);
        this.gameZoneBottom = this.add.rectangle(0, 0, size, size, color).setAlpha(alpha);
    }

    update ()
    {
        const gz = ScaleFlow.gameZone;

        this.gameZoneLeft.setPosition(gz.left, gz.centerY);
        this.gameZoneRight.setPosition(gz.right, gz.centerY);
        this.gameZoneTop.setPosition(gz.centerX, gz.top);
        this.gameZoneBottom.setPosition(gz.centerX, gz.bottom);
    }

    shutdown ()
    {
        ScaleFlow.removeCamera(this.cameras.main);
    }
}
