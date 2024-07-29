import { ScaleFlow } from '../../core/ScaleFlow';

export class Ball
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
            restitution: 0.5,
            density: 0.004,
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
