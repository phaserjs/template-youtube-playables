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
        this.scene.launch('Debug');

        const x = ScaleFlow.center.x;
        const y = ScaleFlow.getTop();

        this.basket = new Basket(this, x, y + 64);

        this.ballCollisionCategory = this.matter.world.nextCategory();

        this.input.on('pointerdown', (pointer) => {

            new Ball(this, pointer.worldX, pointer.worldY);

        });

        this.matter.world.on('collisionstart', (event, bodyA, bodyB) => this.collisionCheck(event, bodyA, bodyB));

        // this.add.image(cx, 0, 'swish');
        // this.add.image(cx, 1100, 'hand');
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
