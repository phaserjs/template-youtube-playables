import { ScaleFlow } from '../../core/ScaleFlow';

export class Basket
{
    constructor (scene, x, y)
    {
        this.scene = scene;
        this.matter = scene.matter;
        this.tweens = scene.tweens;

        this.active = true;

        this.position = new Phaser.Math.Vector2(x, y);

        this.basket = scene.add.image(0, 0, 'basket').setOrigin(0.5, 0);
        this.netGraphic = scene.add.graphics().setDepth(9);
        this.hoop = scene.add.image(0, 0, 'hoop').setOrigin(0.5, 0).setDepth(10);

        const leftBumper = this.matter.bodies.rectangle(-60, 52, 16, 54, { label: 'left', chamfer: { radius: [ 0, 8, 8, 0 ] } });
        const rightBumper = this.matter.bodies.rectangle(60, 52, 16, 54, { label: 'right', chamfer: { radius: [ 8, 0, 0, 8 ] } });

        const topSensor = this.matter.bodies.rectangle(0, 0, 128, 32, { isSensor: true, label: 'top' });
        const bottomSensor = this.matter.bodies.rectangle(0, 70, 100, 30, { isSensor: true, label: 'bottom' });

        this.collisionGroup = this.matter.world.nextGroup();

        this.body = this.matter.body.create({
            parts: [ leftBumper, rightBumper, topSensor, bottomSensor ],
            restitution: 0.2,
            ignoreGravity: true,
            isStatic: true,
            collisionFilter: { group: this.collisionGroup }
        });

        this.matter.world.add(this.body);
        
        this.syncPositions();
        this.createNet();

        scene.sys.updateList.add(this);

        scene.tweens.add({
            targets: this.position,
            x: x + 400,
            // y: y + 400,
            ease: 'Sine.easeInOut',
            duration: 2000,
            yoyo: true,
            repeat: -1
        });
    }

    // startHorizontalTween ()
    // {
    //     this.tweens.add({
    //         targets: this.position,
    //         x: x + 400,
    //         ease: 'Sine.easeInOut',
    //         duration: 3000,
    //         yoyo: true,
    //         repeat: -1
    //     });
    // }

    createNet ()
    {
        this.netCollisionGroup = this.matter.world.nextGroup(true);
        this.netCollisionCategory = this.matter.world.nextCategory();

        const particleOptions = {
            friction: 0.00001,
            collisionFilter: {
                group: this.netCollisionGroup,
                category: this.netCollisionCategory,
            }
        };

        const constraintOptions = {
            stiffness: 0.06
        };

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
        this.syncPositions();
        this.renderNet();
    }

    syncPositions ()
    {
        this.basket.setPosition(this.position.x, this.position.y);
        this.hoop.setPosition(this.position.x, this.position.y + 159);

        this.matter.body.setPosition(this.body, {
            x: this.position.x,
            y: this.position.y + 168
        });

        if (this.net)
        {
            let x = this.body.position.x - 50;

            for (let i = 0; i < 7; i++)
            {
                const body = this.net.bodies[i];
    
                this.matter.body.setPosition(body, {
                    x: x + (i * 16),
                    y: this.body.position.y
                });
            }
        }
    }

    renderNet ()
    {
        const graphics = this.netGraphic;
        const vector = this.matter.vector;

        graphics.clear();
        graphics.lineStyle(2, 0xffffff, 1);

        const constraints = this.matter.composite.allConstraints(this.matter.world.localWorld);

        for (let i = 0; i < constraints.length; i++)
        {
            const constraint = constraints[i];

            const bodyA = constraint.bodyA;
            const bodyB = constraint.bodyB;

            const start = (bodyA) ? vector.add(bodyA.position, constraint.pointA) : constraint.pointA;
            const end = (bodyB) ? vector.add(bodyB.position, constraint.pointB) : constraint.pointB;
    
            graphics.beginPath();
            graphics.moveTo(start.x, start.y);
            graphics.lineTo(end.x, end.y);
            graphics.strokePath();
        }
    }
}
