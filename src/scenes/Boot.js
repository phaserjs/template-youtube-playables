import { Scene } from 'phaser';
import { YouTubePlayables } from '../YouTubePlayables';

export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

        this.load.image('background', 'assets/bg.png');
    }

    async create ()
    {
        try
        {
            console.log('Loading ....');

            const [language, data] = await Promise.all([
                YouTubePlayables.loadLanguage(),
                YouTubePlayables.loadData()
            ]);
    
            console.log('Language:', language);
            console.log('Data:', data);

            this.scene.start('Preloader');
        }
        catch (error)
        {
            console.error('An error occurred:', error);

            this.scene.start('Preloader');
        }
    }
}
