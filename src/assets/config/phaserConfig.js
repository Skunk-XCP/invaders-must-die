import Phaser from "phaser";
import GameScene from "../../scenes/GameScene/GameScene";

const gameWidth =
   window.innerWidth ||
   document.documentElement.clientWidth ||
   document.body.clientWidth;
const gameHeight =
   window.innerHeight ||
   document.documentElement.clientHeight ||
   document.body.clientHeight;

const phaserConfig = {
   type: Phaser.AUTO,
   width: gameWidth,
   height: gameHeight,
   physics: {
      default: "arcade",
      arcade: {
         gravity: { y: 0 },
         debug: false,
      },
   },
   //scene phaser
   scene: [GameScene],
   scale: {
      parent: "phaser-game",
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
   },
};

export default phaserConfig;
