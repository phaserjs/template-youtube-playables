import { ScaleFlow } from '../core/ScaleFlow';
import { Scene } from 'phaser';
import { YouTubePlayables } from '../YouTubePlayables';

class Basket
{
    constructor (scene)
    {
        this.scene = scene;
        this.matter = scene.matter;
        this.active = true;
        this.collisionGroup = this.matter.world.nextGroup();

        this.speed = 3;

        const cx = ScaleFlow.center.x;
        const cy = ScaleFlow.center.y;
        const top = ScaleFlow.getTop();

        this.basket = scene.add.image(cx, top + 64, 'basket').setOrigin(0.5, 0);
        this.hoop = scene.add.image(cx, top + 223, 'hoop').setOrigin(0.5, 0).setDepth(10);

        const leftBumper = this.matter.bodies.rectangle(-60, 52, 16, 54, { label: 'left', chamfer: { radius: [ 0, 8, 8, 0 ] } });
        const rightBumper = this.matter.bodies.rectangle(60, 52, 16, 54, { label: 'right', chamfer: { radius: [ 8, 0, 0, 8 ] } });

        const topSensor = this.matter.bodies.rectangle(0, 0, 128, 32, { isSensor: true, label: 'top' });
        const bottomSensor = this.matter.bodies.rectangle(0, 70, 100, 30, { isSensor: true, label: 'bottom' });

        this.body = this.matter.body.create({
            parts: [ leftBumper, rightBumper, topSensor, bottomSensor ],
            restitution: 0.2,
            ignoreGravity: true,
            isStatic: true,
            collisionFilter: { group: this.collisionGroup }
        });
        
        this.matter.body.setPosition(this.body, { x: cx, y: top + 232 });

        this.matter.world.add(this.body);

        this.createNet();

        scene.sys.updateList.add(this);
    }

    createNet ()
    {
        this.netCollisionGroup = this.matter.world.nextGroup(true);
        this.netCollisionCategory = this.matter.world.nextCategory();

        const particleOptions = {
            friction: 0.00001,
            collisionFilter: {
                group: this.netCollisionGroup,
                category: this.netCollisionCategory,
            },
            render: { visible: false }
        };

        const constraintOptions = {
            stiffness: 0.06
        };

        // softBody: function (x, y, columns, rows, columnGap, rowGap, crossBrace, particleRadius, particleOptions, constraintOptions)

        this.net = this.matter.add.softBody(
            this.body.position.x - 60,
            this.body.position.y,
            7, 5,
            1, 0,
            false, 8,
            particleOptions, constraintOptions
        );

        for (let i = 0; i < 7; i++)
        {
            const body = this.net.bodies[i];

            body.isStatic = true;
        }
    }

    preUpdate ()
    {
        this.basket.x += this.speed;
        this.hoop.x += this.speed;

        this.matter.body.setPosition(this.body, { x: this.body.position.x + this.speed, y: this.body.position.y });

        let x = this.body.position.x - 50;

        for (let i = 0; i < 7; i++)
        {
            const body = this.net.bodies[i];

            this.matter.body.setPosition(body, { x: x + this.speed + (i * 16), y: this.body.position.y });
        }

        if (this.basket.x > ScaleFlow.getRight())
        {
            this.speed = this.speed * -1;
        }
        else if (this.basket.x < ScaleFlow.getLeft())
        {
            this.speed = this.speed * -1;
        }
    }
}

class Ball
{
    constructor (scene, x, y)
    {
        this.scene = scene;
        this.matter = scene.matter;
        this.active = true;

        this.ball = this.matter.add.image(x, y, 'ball');

        this.ball.setCircle(32, {
            friction: 0.8,
            frictionStatic: 0.4,
            restitution: 0.8,
            density: 0.002,
            label: 'ball'
        });

        this.ball.setVelocityY(-30);
        this.ball.setAngularVelocity(0.1);

        this.ball.setCollisionGroup(scene.basket.collisionGroup);
        this.ball.setCollisionCategory(scene.ballCollisionCategory);
        this.ball.setCollidesWith(scene.basket.collisionGroup);

        this.ball.setData('hitTop', false);
        this.ball.setData('hitBottom', false);
        this.ball.setData('scored', false);
        this.ball.setData('missed', false);

        scene.sys.updateList.add(this);
    }

    preUpdate ()
    {
        if (this.ball && this.ball.y > ScaleFlow.getBottom() + 100)
        {
            this.ball.destroy();

            this.scene.sys.updateList.remove(this);

            this.ball = null;
        }
    }
}

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

        this.basket = new Basket(this);

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
