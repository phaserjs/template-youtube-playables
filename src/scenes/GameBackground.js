import { Scene } from 'phaser';

export class GameBackground extends Scene
{
    constructor ()
    {
        super('GameBackground');
    }

    create ()
    {
        const view = this.scale.getViewPort(this.cameras.main);

        const bg = this.add.image(0, 0, 'gameBackground');

        bg.setOrigin(0, 0);
        bg.setDisplaySize(view.width, view.height);
    }
}
