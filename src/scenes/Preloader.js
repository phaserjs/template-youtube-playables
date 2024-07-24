import { Scene } from 'phaser';
import { YouTubePlayables } from '../YouTubePlayables';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        this.createLoadingBar();

        //  Now we have displayed all of our loader graphics, we need to tell the YouTube Playables API that we are first-frame ready:
        YouTubePlayables.firstFrameReady();

        //  You can also do this by calling:
        // ytgame?.game.firstFrameReady();
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        this.load.image('logo', 'logo.png');
        this.load.image('youtube', 'youtube-logo.png');
        this.load.image('tile', 'tile.png');
        this.load.image('audioOff', 'audio-off.png');
        this.load.image('audioOn', 'audio-on.png');
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Launch our animated background Scene
        this.scene.launch('Background');

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }

    createLoadingBar ()
    {
        const width = this.scale.width;
        const height = this.scale.height;

        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(0, 0, 'background').setOrigin(0, 0).setDisplaySize(width, height);

        const cx = width / 2;
        const cy = height / 2;

        const barOuterWidth = width * 0.70;
        const barWidth = barOuterWidth - 4;

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(cx, cy, barOuterWidth, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(cx - (barWidth / 2) + 2, cy, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = barWidth * progress;

        });
    }
}
