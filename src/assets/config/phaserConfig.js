import Phaser from "phaser";
import GameScene from "../../scenes/GameScene/GameScene";
import MenuScene from "../../scenes/MenuScene/MenuScene";

const gameWidth = window.innerWidth * 0.7;
const gameHeight = window.innerHeight;

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
   scene: [MenuScene, GameScene],
   scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
   },
};

export default phaserConfig;
