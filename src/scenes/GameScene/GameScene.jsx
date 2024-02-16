import Phaser from "phaser";
import background from "../../assets/backgroundStage/background.webp";

export default class GameScene extends Phaser.Scene {
   constructor() {
      super("game_scene");
   }

   preload() {
      // precharger assets
      this.load.image("background", background);
   }

   create() {}

   update() {
      // logique du jeu
      this.add.image(0, 0, "background").setOrigin(0, 0);
   }
}
