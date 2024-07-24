import { Background } from './scenes/Background';
import { Boot } from './scenes/Boot';
import { Game } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';
import { ScaleFlow } from './core/ScaleFlow';
import { UI } from './scenes/UI';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
new ScaleFlow({
    type: Phaser.AUTO,
    width: 820,
    height: 1180,
    parent: 'gameParent',
    backgroundColor: '#000000',
    scene: [
        Boot,
        Preloader,
        Background,
        MainMenu,
        Game,
        GameOver,
        UI
    ]
});
