import { ScaleFlow } from '../../core/ScaleFlow';

export class Basket
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
        this.netGraphic = scene.add.graphics().setDepth(9);
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

        this.netGraphic.clear();

        const constraints = this.matter.composite.allConstraints(this.matter.world.localWorld);

        for (let i = 0; i < constraints.length; i++)
        {
            this.renderConstraint(constraints[i]);
        }
    }

    renderConstraint (constraint)
    {
        const render = constraint.render;

        if (!render.visible || !constraint.pointA || !constraint.pointB)
        {
            return this;
        }

        const graphics = this.netGraphic;
        const vector = this.matter.vector;

        graphics.lineStyle(2, 0xffffff, 1);

        const bodyA = constraint.bodyA;
        const bodyB = constraint.bodyB;
        let start = constraint.pointA;
        let end = constraint.pointB;

        if (bodyA)
        {
            start = vector.add(bodyA.position, constraint.pointA);
        }

        if (bodyB)
        {
            end = vector.add(bodyB.position, constraint.pointB);
        }

        graphics.beginPath();
        graphics.moveTo(start.x, start.y);
        graphics.lineTo(end.x, end.y);

        graphics.strokePath();
    }
}
