import { ScaleFlow } from '../core/ScaleFlow';
import { Scene } from 'phaser';
import { YouTubePlayables } from '../YouTubePlayables';

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    init ()
    {
        ScaleFlow.addCamera(this.cameras.main);

        this.events.on('shutdown', this.shutdown, this);
    }

    create ()
    {
        this.createLogos();
        this.createText();

        this.input.once('pointerdown', () => {

            this.scene.stop('Background');
            this.scene.start('Game');

        });

        //  Our game is now ready to be interacted with,
        //  so we have to notify the YouTube Playables API about this:
        YouTubePlayables.gameReady();

        //  You can also do this by calling:
        // ytgame?.game.gameReady();

        //  Launch our animated background Scene
        this.scene.launch('Background');

        //  Launch our UI Scene
        this.scene.launch('UI');
    }

    createLogos ()
    {
        const cx = ScaleFlow.center.x;
        const cy = ScaleFlow.center.y;

        const logo = this.add.image(cx, cy - 200, 'logo');

        logo.preFX.addShine(0.8, 1, 5);

        this.add.image(cx, cy, 'youtube');
    }

    async createText ()
    {
        const cx = ScaleFlow.center.x;
        const cy = ScaleFlow.center.y;

        const language = await YouTubePlayables.loadLanguage();

        const info = [
            `YouTube SDK: ${YouTubePlayables.version}`,
            `In Env: ${YouTubePlayables.inPlayablesEnv}`,
            `Language: ${language}`
        ];

        this.add.text(cx, cy + 300, info, {
            fontFamily: 'Arial Black', fontSize: 30, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);
    }

    shutdown ()
    {
        ScaleFlow.removeCamera(this.cameras.main);
    }
}
