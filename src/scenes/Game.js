import { Ball } from './gameobjects/Ball';
import { Basket } from './gameobjects/Basket';
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
        // this.scene.launch('UI');

        const x = ScaleFlow.center.x;
        const y = ScaleFlow.getTop();

        this.basket = new Basket(this, x - 200, y + 64);

        this.registry.set('shots', 50);

        this.balls = [];

        for (let i = 0; i < 32; i++)
        {
            this.balls.push(new Ball(this));
        }

        this.ballCollisionCategory = this.matter.world.nextCategory();

        this.input.on('pointerdown', (pointer) => {

            if (this.handCursor)
            {
                this.handCursor.destroy();
                this.handCursor = null;
            }

            const ball = Phaser.Utils.Array.GetFirst(this.balls, 'active', false);

            if (ball)
            {
                const y = (pointer.worldY < ScaleFlow.center.y) ? ScaleFlow.center.y : pointer.worldY;

                ball.throw(pointer.worldX, y);

                this.registry.inc('shots', -1);
            }

        });

        this.matter.world.on('collisionstart', (event, bodyA, bodyB) => this.collisionCheck(event, bodyA, bodyB));

        this.showHand();
    }

    showHand ()
    {
        const cx = ScaleFlow.center.x;
        const cy = ScaleFlow.center.y + 200;
        const x = ScaleFlow.getRight();
        const y = ScaleFlow.getBottom();

        this.handCursor = this.add.sprite(x, y, 'hands', 1).setDepth(20).setAlpha(0);

        this.tweens.add({
            targets: this.handCursor,
            x: { value: cx, duration: 1000, ease: 'Sine.easeOut' },
            y: { value: cy, duration: 1500, ease: 'Sine.easeOut' },
            alpha: { value: 1, duration: 500, ease: 'Linear' },
            onComplete: () => {
                if (this.handCursor)
                {
                    this.handCursor.play('tapToStart');
                }
            }
        });
    }

    collisionCheck (event, bodyA, bodyB)
    {
        const ball = (bodyA.label === 'ball') ? bodyA : (bodyB.label === 'ball') ? bodyB : null;
        const top = (bodyA.label === 'top') ? bodyA : (bodyB.label === 'top') ? bodyB : null;
        const bottom = (bodyA.label === 'bottom') ? bodyA : (bodyB.label === 'bottom') ? bodyB : null;

        const sprite = (ball) ? ball.gameObject : null;

        if (ball && (sprite.getData('scored') || sprite.getData('missed')))
        {
            return;
        }

        if (ball && top)
        {
            if (!sprite.getData('hitBottom'))
            {
                sprite.setData('hitTop', true);
                console.log('Hit the top before the bottom');
            }
            else
            {
                console.log('Missed');
                sprite.setData('missed', true);
            }
        }
        else if (ball && bottom)
        {
            if (!sprite.getData('hitTop'))
            {
                console.log('Missed');
                sprite.setData('missed', true);
            }
            else
            {
                console.log('Hit the bottom AFTER hitting the top - SCORE!');
                sprite.setData('scored', true);
            }
        }
    }

    shutdown ()
    {
        ScaleFlow.removeCamera(this.cameras.main);
    }
}
