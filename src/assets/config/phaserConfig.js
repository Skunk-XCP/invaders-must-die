import Phaser from "phaser";
import GameScene from "../../scenes/GameScene/GameScene";

const phaserConfig = {
   type: Phaser.AUTO,
   width: 800,
   height: 1200,
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
