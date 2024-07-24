import Phaser from 'phaser';
import { ScaleFlow } from './ScaleFlow';

export class XSprite extends Phaser.GameObjects.Sprite
{
    constructor (scene, x, y, texture, frame)
    {
        super(scene, 0, 0, texture, frame);

        this._x = 0;
        this._y = 0;

        ScaleFlow.addSprite(this);

        scene.children.add(this);
    
        this.setPosition(x, y);
    }

    onResize ()
    {
        this.setPosition(this._x, this._y);
    }

    setX (x)
    {
        this._x = x;

        super.setX(ScaleFlow.getX(x));

        return this;
    }

    setY (y)
    {
        this._y = y;

        super.setY(ScaleFlow.getY(y));

        return this;
    }

    setPosition (x, y)
    {
        this._x = x;
        this._y = y;
        
        super.setPosition(ScaleFlow.getX(x), ScaleFlow.getY(y));

        return this;
    }

    /**
     * The x position of this Game Object.
     * Can be set as a string or a number.
     */
    set X (value)
    {
        this.setX(value);
    }

    /**
     * The y position of this Game Object.
     * Can be set as a string or a number.
     */
    set Y (value)
    {
        this.setY(value);
    }

    get X ()
    {
        return this.x;
    }

    get Y ()
    {
        return this.y;
    }

    preDestroy ()
    {
        ScaleFlow.removeSprite(this);

        this.anims.destroy();

        this.anims = undefined;
    }
}
