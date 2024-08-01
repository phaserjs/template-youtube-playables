import { Scene } from 'phaser';

export class Background extends Scene
{
    constructor ()
    {
        super('Background');
    }

    create ()
    {
        const view = this.scale.getViewPort(this.cameras.main);

        const bg = this.add.image(0, 0, 'background');

        bg.setOrigin(0, 0);
        bg.setDisplaySize(view.width, view.height);

        this.ts = this.add.tileSprite(0, 0, view.width, view.height, 'assets', 'tile');
        this.ts.setOrigin(0, 0);
    }

    update ()
    {
        this.ts.tilePositionX -= 2;
    }
}
