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

        this.basketCollisionGroup = this.matter.world.nextGroup();
        this.ballCollisionCategory = this.matter.world.nextCategory();

        this.basket1 = new Basket(this, this.basketCollisionGroup);
        this.basket2 = new Basket(this, this.basketCollisionGroup);

        this.balls = [];

        for (let i = 0; i < 16; i++)
        {
            this.balls.push(new Ball(this, i));
        }

        this.matter.world.on('collisionstart', (event, bodyA, bodyB) => this.collisionCheck(event, bodyA, bodyB));
        this.matter.world.on('collisionactive', (event, bodyA, bodyB) => this.collisionCheck(event, bodyA, bodyB));

        this.input.on('pointerdown', (pointer) => this.throwBall(pointer));

        this.registry.set('shots', 50);
        this.registry.set('score', 0);

        this.pendingGameOver = false;

        this.showHand();

        this.checkStage();
    }

    checkStage ()
    {
        const left = ScaleFlow.getLeft() + 90;
        const right = ScaleFlow.getRight() - 90;
        const top = ScaleFlow.getTop() + 128;

        const shots = this.registry.get('shots');

        const basket1 = this.basket1;
        const basket2 = this.basket2;

        switch (shots)
        {
            case 50:
                console.log('Stage 1');
                basket1.setActive(left, top);
                basket1.setTweenXBetween(left, right).setXSpeed(5000).setXEase('Linear');
                basket1.startHorizontalTween();
                break;

            case 45:
                console.log('Stage 2');
                basket1.setEase('Sine.easeInOut');
                break;

            case 40:
                console.log('Stage 3');
                basket1.setXSpeed(3000);
                break;

            case 35:
                console.log('Stage 4');
                basket1.setTweenYBetween(top, top + 150).setYSpeed(2000).setYEase('Sine.easeInOut');
                basket1.startVerticalTween();
                break;
    
            case 30:
                console.log('Stage 5');
                basket2.setActive(left, top + 380);
                basket2.setTweenXBetween(left, right).setXSpeed(5000).setXEase('Sine.easeInOut');
                basket2.startHorizontalTween();
                break;

            case 0:
                pendingGameOver = true;
                break;
        }
    }

    throwBall (pointer)
    {
        if (this.handCursor)
        {
            this.handCursor.destroy();
            this.handCursor = null;
        }

        const ball = Phaser.Utils.Array.GetFirst(this.balls, 'active', false);

        if (ball && this.registry.get('shots') > 0)
        {
            const y = (pointer.worldY < ScaleFlow.center.y) ? ScaleFlow.center.y : pointer.worldY;

            ball.throw(pointer.worldX, y);

            this.registry.inc('shots', -1);

            this.time.delayedCall(2000, this.checkStage, [], this);
        }
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

        if (!ball || !sprite)
        {
            console.log(`invalid ball`);
            return;
        }

        if (sprite.getData('scored') || sprite.getData('missed'))
        {
            console.log(`ball ${sprite.name} exit 1`);
            return;
        }

        if (!sprite.getData('scored') && !sprite.getData('missed'))
        {
            if (left)
            {
                console.log(`ball ${sprite.name} hit left bumper`);
                sprite.setData('hitLeft', true);
            }
            else if (right)
            {
                console.log(`ball ${sprite.name} hit right bumper`);
                sprite.setData('hitRight', true);
            }
        }

        if (top)
        {
            if (!sprite.getData('hitBottom'))
            {
                // Ball hit the top sensor BEFORE hitting the bottom sensor
                console.log(`ball ${sprite.name} hit top sensor`);
                sprite.setData('hitTop', true);
            }
            else
            {
                // Ball hit the top sensor AFTER hitting the bottom sensor, so it's a miss
                console.log(`ball ${sprite.name} hit top sensor AFTER bottom`);
                sprite.setData('missed', true);
            }
        }
        else if (bottom)
        {
            if (!sprite.getData('hitTop'))
            {
                // Ball hit the bottom sensor BEFORE hitting the top sensor, so it's a miss
                console.log(`ball ${sprite.name} hit bottom sensor first - miss`);
                sprite.setData('missed', true);
            }
            else
            {
                // Ball hit the bottom sensor AFTER hitting the top one, so they scored
                console.log(`ball ${sprite.name} hit bottom sensor - scored. LR: ${sprite.getData('hitLeft')} ${sprite.getData('hitRight')}`);
                sprite.setData('scored', true);

                if (sprite.getData('hitLeft') && sprite.getData('hitRight'))
                {
                    this.registry.inc('score', 15);
                    this.launchScore('ricochet');
                    console.log('RICHOCHET SCORE!');
                }
                else if (!sprite.getData('hitLeft') && !sprite.getData('hitRight'))
                {
                    this.registry.inc('score', 20);
                    this.launchScore('swish');
                    console.log('SWISH SCORE!');
                }
                else
                {
                    this.registry.inc('score', 10);
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

        // this.basket.pullNet();
    }

    update ()
    {
        if (this.pendingGameOver)
        {
            //  All balls finished
            let gameOver = true;

            for (let i = 0; i < this.balls.length; i++)
            {
                if (this.balls[i].active)
                {
                    gameOver = false;
                    return;
                }
            }

            if (gameOver)
            {
                this.scene.start('GameOver');
            }
        }
    }

    shutdown ()
    {
        ScaleFlow.removeCamera(this.cameras.main);
    }
}
