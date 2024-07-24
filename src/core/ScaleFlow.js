import Phaser from 'phaser';

export class ScaleFlow
{
    constructor (config)
    {
        const width = config.width;
        const height = config.height;

        ScaleFlow.width = width;
        ScaleFlow.height = height;
        ScaleFlow.center = new Phaser.Math.Vector2(width / 2, height / 2);

        ScaleFlow.isLandscape = ScaleFlow.width > ScaleFlow.height;

        ScaleFlow.gameZone = new Phaser.Geom.Rectangle(0, 0, width, height);
        ScaleFlow.uiZone = new Phaser.Geom.Rectangle(0, 0, width, height);

        ScaleFlow.sprites = new Set();
        ScaleFlow.cameras = new Set();

        config.callbacks = {
            postBoot: () => this.gameBootHandler()
        };

        this.game = new Phaser.Game(config);
    }

    gameBootHandler ()
    {
        ScaleFlow.scaleManager = this.game.scale;

        ScaleFlow.scaleManager.on('resize', () => this.onResizeHandler());

        this.canvas = this.game.canvas;
        this.parent = this.canvas.parentElement;
        this.guide = document.getElementById('guide');

        // InitXSprite();

        // Force a resize event to set the initial size of the game. The time value doesn’t matter,
        // we’re just giving it a tick to make sure the canvas parent bounds have been set.
        window.setTimeout(() => this.onResizeHandler(), 16);
    }

    onResizeHandler ()
    {
        const parentBounds = this.parent.getBoundingClientRect();
        const canvasBounds = this.canvas.getBoundingClientRect();
        const guideBounds = this.guide.getBoundingClientRect();

        const widthScale = parentBounds.width / ScaleFlow.width;
        const heightScale = parentBounds.height / ScaleFlow.height;
    
        const scale = Math.max(widthScale, heightScale);

        const widthDiff = parentBounds.width - widthScale;
        const heightDiff = parentBounds.height - heightScale;

        const widthDiffScale = widthDiff * (1 / scale);
        const heightDiffScale = heightDiff * (1 / scale);

        const leftBounds = (ScaleFlow.width / 2) - (widthDiffScale / 2);
        const rightBounds = (ScaleFlow.width / 2) + (widthDiffScale / 2);
        const topBounds = (ScaleFlow.height / 2) - (heightDiffScale / 2);
        const bottomBounds = (ScaleFlow.height / 2) + (heightDiffScale / 2);

        ScaleFlow.uiZone.left = leftBounds;
        ScaleFlow.uiZone.right = rightBounds;
        ScaleFlow.uiZone.top = topBounds;
        ScaleFlow.uiZone.bottom = bottomBounds;

        // Calculate scale factors for width and height
        const scaleX = guideBounds.width / canvasBounds.width;
        const scaleY = guideBounds.height / canvasBounds.height;

        // Use the minimum scale factor to ensure the canvas content fits within the guide without overflow
        const scaleFactor = Math.min(scaleX, scaleY);

        ScaleFlow.scaleFactor = scaleFactor;

        ScaleFlow.cameras.forEach(camera => {
            camera.zoom = scaleFactor;
        });

        ScaleFlow.sprites.forEach(sprite => sprite.onResize());

        this.game.events.emit(ScaleFlow.RESIZE);
    }

    static addCamera (camera)
    {
        this.cameras.add(camera);

        camera.zoom = ScaleFlow.scaleFactor;
    }

    static removeCamera (camera)
    {
        this.cameras.delete(camera);
    }

    static addSprite (sprite)
    {
        this.sprites.add(sprite);
    }

    static removeSprite (sprite)
    {
        this.sprites.delete(sprite);
    }

    static getX (x)
    {
        if (typeof x === 'number')
        {
            return x;
        }

        const gameWidth = this.scaleManager.width;

        const percentNum = parseInt(x, 10);

        return gameWidth * (percentNum / 100);
    }

    static getY (y)
    {
        if (typeof y === 'number')
        {
            return y;
        }

        const gameHeight = this.scaleManager.height;

        const percentNum = parseInt(y, 10);

        return gameHeight * (percentNum / 100);
    }

    static getUIX (x)
    {
        if (typeof x === 'number')
        {
            return x;
        }

        const gameWidth = ScaleFlow.uiZone.width;

        const percentNum = parseInt(x, 10);

        return gameWidth * (percentNum / 100);
    }

    static getUIY (y)
    {
        if (typeof y === 'number')
        {
            return y;
        }

        const gameHeight = ScaleFlow.uiZone.height;

        const percentNum = parseInt(y, 10);

        return gameHeight * (percentNum / 100);
    }
}

ScaleFlow.scaleFactor = 1;
ScaleFlow.scaleFactor2 = 1;

ScaleFlow.RESIZE = 'scaleflowresize';
