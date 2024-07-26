import { ScaleFlow } from '../core/ScaleFlow';
import { Scene } from 'phaser';

export class Debug extends Scene
{
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
        let color = 0x00ff00;
        let alpha = 0.85;
        let size = 16;

        this.gameZoneLeft = this.add.rectangle(0, 0, size, size, color).setAlpha(alpha);
        this.gameZoneRight = this.add.rectangle(0, 0, size, size, color).setAlpha(alpha);
        this.gameZoneTop = this.add.rectangle(0, 0, size, size, color).setAlpha(alpha);
        this.gameZoneBottom = this.add.rectangle(0, 0, size, size, color).setAlpha(alpha);

        this.scene.bringToTop();
    }

    update ()
    {
        const vz = ScaleFlow.visibleZone;

        this.gameZoneLeft.setPosition(vz.left, vz.centerY);
        this.gameZoneRight.setPosition(vz.right, vz.centerY);
        this.gameZoneTop.setPosition(vz.centerX, vz.top);
        this.gameZoneBottom.setPosition(vz.centerX, vz.bottom);
    }

    shutdown ()
    {
        ScaleFlow.removeCamera(this.cameras.main);
    }
}
