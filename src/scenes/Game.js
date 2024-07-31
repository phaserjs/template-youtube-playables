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

        this.basket1 = new Basket(1, this, this.basketCollisionGroup);
        this.basket2 = new Basket(2, this, this.basketCollisionGroup);

        this.balls = [];

        for (let i = 0; i < 16; i++)
        {
            this.balls.push(new Ball(this, i));
        }

        // this.matter.world.on('collisionstart', (event, bodyA, bodyB) => this.collisionCheck(event, bodyA, bodyB));
        // this.matter.world.on('collisionactive', (event, bodyA, bodyB) => this.collisionCheck(event, bodyA, bodyB));

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

    checkBasket (ball, body)
    {

    }

    collisionCheck (event, bodyA, bodyB)
    {
        let ball = null;
        let top = null;
        let bottom = null;
        let left = null;
        let right = null;
        let netSprite = null;

        if (bodyA.label === 'ball')
        {
            ball = bodyA;
            top = (bodyB.label === 'top') ? bodyB : null;
            bottom = (bodyB.label === 'bottom') ? bodyB : null;
            left = (bodyB.label === 'left') ? bodyB : null;
            right = (bodyB.label === 'right') ? bodyB : null;
            netSprite = bodyB.parent.gameObject;
        }
        else if (bodyB.label === 'ball')
        {
            ball = bodyB;
            top = (bodyA.label === 'top') ? bodyA : null;
            bottom = (bodyA.label === 'bottom') ? bodyA : null;
            left = (bodyA.label === 'left') ? bodyA : null;
            right = (bodyA.label === 'right') ? bodyA : null;
            netSprite = bodyA.parent.gameObject;
        }

        const ballSprite = (ball) ? ball.gameObject : null;

        if (!ball || !ballSprite || !netSprite)
        {
            console.log(`invalid ball / net`);
            return;
        }

        const netID = netSprite.name;
        const hasScored = ballSprite.getData(`scored${netID}`);
        const hasMissed = ballSprite.getData(`missed${netID}`);
        const hitBottom = ballSprite.getData(`hitBottom${netID}`);
        const hitTop = ballSprite.getData(`hitTop${netID}`);
        const hitLeft = ballSprite.getData(`hitLeft${netID}`);
        const hitRight = ballSprite.getData(`hitRight${netID}`);

        if (hasScored || hasMissed)
        {
            console.log(`ball ${ballSprite.name} exit 1`);
            return;
        }

        if (!hasScored && !hasMissed)
        {
            if (left)
            {
                console.log(`ball ${ballSprite.name} hit left bumper`);
                ballSprite.setData(`hitLeft${netID}`, true);
            }
            else if (right)
            {
                console.log(`ball ${ballSprite.name} hit right bumper`);
                ballSprite.setData(`hitRight${netID}`, true);
            }
        }

        if (top)
        {
            if (!hitBottom)
            {
                // Ball hit the top sensor BEFORE hitting the bottom sensor
                console.log(`ball ${ballSprite.name} hit top sensor`);
                ballSprite.setData(`hitTop${netID}`, true);
            }
            else
            {
                // Ball hit the top sensor AFTER hitting the bottom sensor, so it's a miss
                console.log(`ball ${ballSprite.name} hit top sensor AFTER bottom`);
                ballSprite.setData(`missed${netID}`, true);
            }
        }
        else if (bottom)
        {
            if (!hitTop)
            {
                // Ball hit the bottom sensor BEFORE hitting the top sensor, so it's a miss
                console.log(`ball ${ballSprite.name} hit bottom sensor first - miss`);
                ballSprite.setData(`missed${netID}`, true);
            }
            else
            {
                // Ball hit the bottom sensor AFTER hitting the top one, so they scored
                console.log(`ball ${ballSprite.name} hit bottom sensor - scored. LR: ${ballSprite.getData('hitLeft')} ${ballSprite.getData('hitRight')}`);
                ballSprite.setData(`scored${netID}`, true);

                if (hitLeft && hitRight)
                {
                    this.registry.inc('score', 15);
                    this.launchScore('ricochet');
                    console.log('RICHOCHET SCORE!');
                }
                else if (!hitLeft && !hitRight)
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
