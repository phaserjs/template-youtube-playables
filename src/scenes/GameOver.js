import { ScaleFlow } from '../core/ScaleFlow';
import { Scene } from 'phaser';
import { YouTubePlayables } from '../YouTubePlayables';

export class GameOver extends Scene
{
    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        this.scene.launch('GameBackground');
        this.scene.bringToTop();

        const cx = ScaleFlow.center.x;
        const cy = ScaleFlow.center.y;

        const logo = this.add.image(cx, ScaleFlow.getTop(), 'gameLogo');
        
        logo.preFX.addShine(0.8, 1, 5);

        this.tweens.add({
            targets: logo,
            y: '+=260',
            duration: 2000,
            ease: 'Bounce.easeOut'
        });

        const info = [
            `Highscore: ${this.registry.get('score')}`,
        ];

        this.add.text(cx, cy, info, {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {

            this.scene.start('MainMenu');

        });

        //  Send the score to YouTube
        YouTubePlayables.sendScore(this.registry.get('score'));

        //  you can also do:
        // ytgame?.engagement.sendScore({ value: this.registry.get('score') });
    }
}
