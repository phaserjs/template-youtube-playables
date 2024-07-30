import { GridSnap } from '../core/GridSnap';
import Phaser from 'phaser';
import { YouTubePlayables } from '../YouTubePlayables';

export class UI extends Phaser.Scene
{
    constructor ()
    {
        super('UI');
    }

    init ()
    {
        this.gridSnap = new GridSnap(this);

        this.gridSnap.setPadding(8, 8);

        this.scene.bringToTop();
    }

    create ()
    {
        this.audioIcon = this.add.sprite(0, 0, 'audioOff');

        this.ballIcon = this.add.sprite(0, 0, 'ball');

        this.gridSnap.addSprite(this.audioIcon, GridSnap.TOP_RIGHT);
        this.gridSnap.addSprite(this.ballIcon, GridSnap.TOP_LEFT);
        this.gridSnap.resize();

        //  If audio is enabled in the YouTube Player then enable it our game too.
        //  You can also call: ytgame.system.isAudioEnabled()

        if (YouTubePlayables.isAudioEnabled())
        {
            this.enableAudio();
        }
        else
        {
            this.disableAudio();
        }

        //  We will also respond to the YouTube Player muting / unmuting the audio.
        //  You can also call: ytgame.system.onAudioEnabledChange(callback)

        YouTubePlayables.setAudioChangeCallback((enabled) => {

            if (enabled)
            {
                this.enableAudio();
            }
            else
            {
                this.disableAudio();
            }

        });
    }

    enableAudio ()
    {
        this.sound.setMute(false);

        this.audioIcon.setTexture('audioOn');
    }

    disableAudio ()
    {
        this.sound.setMute(true);

        this.audioIcon.setTexture('audioOff');
    }
}
