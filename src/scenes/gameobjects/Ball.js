import { ScaleFlow } from '../../core/ScaleFlow';

export class Ball
{
    constructor (scene)
    {
        this.scene = scene;
        this.matter = scene.matter;
        this.active = false;

        this.ball = this.matter.add.image(-1000, 0, 'ball').setVisible(false);

        this.ball.setCircle(32, {
            friction: 0.8,
            frictionStatic: 0.4,
            restitution: 0.5,
            density: 0.004,
            label: 'ball'
        });

        this.ball.setCollisionGroup(scene.basket.collisionGroup);
        this.ball.setCollisionCategory(scene.ballCollisionCategory);
        this.ball.setCollidesWith(scene.basket.collisionGroup);

        this.scene.matter.world.remove(this.ball.body);

        scene.sys.updateList.add(this);
    }

    throw (x, y)
    {
        this.ball.setPosition(x, y);
        this.ball.setVisible(true);

        this.scene.matter.world.add(this.ball.body);

        this.ball.setVelocityX(0);
        this.ball.setVelocityY(-32);

        if (x < ScaleFlow.center.x)
        {
            this.ball.setAngularVelocity(-0.12);
        }
        else
        {
            this.ball.setAngularVelocity(0.12);
        }

        this.ball.setData('hitTop', false);
        this.ball.setData('hitBottom', false);
        this.ball.setData('hitLeft', false);
        this.ball.setData('hitRight', false);
        this.ball.setData('scored', false);
        this.ball.setData('missed', false);

        this.active = true;
    }

    preUpdate ()
    {
        if (this.ball && this.ball.y > ScaleFlow.getBottom() + 300)
        {
            this.active = false;

            this.ball.setVisible(false);
            this.ball.setPosition(-1000, 0);

            this.scene.matter.world.remove(this.ball.body);
        }
    }
}
