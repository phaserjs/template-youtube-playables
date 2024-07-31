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

        this.basket = new Basket(this, x - 200, y + 128);

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
        const left = (bodyA.label === 'left') ? bodyA : (bodyB.label === 'left') ? bodyB : null;
        const right = (bodyA.label === 'right') ? bodyA : (bodyB.label === 'right') ? bodyB : null;

        const sprite = (ball) ? ball.gameObject : null;

        if (ball && (sprite.getData('scored') || sprite.getData('missed')))
        {
            return;
        }

        if (ball && left)
        {
            sprite.setData('hitLeft', true);
        }
        else if (ball && right)
        {
            sprite.setData('hitRight', true);
        }

        if (ball && top)
        {
            if (!sprite.getData('hitBottom'))
            {
                // Ball hit the top sensor BEFORE hitting the bottom sensor
                sprite.setData('hitTop', true);
            }
            else
            {
                // Ball hit the top sensor AFTER hitting the bottom sensor, so it's a miss
                sprite.setData('missed', true);
            }
        }
        else if (ball && bottom)
        {
            if (!sprite.getData('hitTop'))
            {
                // Ball hit the bottom sensor BEFORE hitting the top sensor, so it's a miss
                sprite.setData('missed', true);
            }
            else
            {
                // Ball hit the bottom sensor AFTER hitting the top one, so they scored
                sprite.setData('scored', true);

                if (sprite.getData('hitLeft') && sprite.getData('hitRight'))
                {
                    this.launchScore('ricochet');
                    console.log('RICHOCHET SCORE!');
                }
                else if (!sprite.getData('hitLeft') && !sprite.getData('hitRight'))
                {
                    this.launchScore('swish');
                    console.log('SWISH SCORE!');
                }
                else
                {
                    this.launchScore('shot');
                    console.log('SCORE');
                }
            }
        }
    }

    launchScore (type)
    {
        const x = ScaleFlow.getRight() + 200;
        const cy = ScaleFlow.center.y;

        const image = this.add.image(x, cy, type).setDepth(20);

        this.tweens.add({
            targets: image,
            x: { value: ScaleFlow.getLeft() - 300, duration: 1500, ease: 'sine.inout' },
            alpha: { value: 0, duration: 200, delay: 1000, ease: 'linear' },
            onComplete: () => {
                image.destroy();
            }
        });
    }

    shutdown ()
    {
        ScaleFlow.removeCamera(this.cameras.main);
    }
}
