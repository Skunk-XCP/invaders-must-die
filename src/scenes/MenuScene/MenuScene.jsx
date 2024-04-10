import Phaser from "phaser";

export default class MenuScene extends Phaser.Scene {
   constructor() {
      super("MenuScene");
   }

   preload() {
      this.load.image("wallpaper", "assets/artworks/artworkMenu.png");
   }

   create() {
      this.createBackground();
      this.createStartButton();
      // this.createSettingsButton();
   }

   createBackground() {
      let wallpaper = this.add.image(0, 0, "wallpaper").setOrigin(0, 0);
      wallpaper.displayWidth = this.cameras.main.width;
      wallpaper.displayHeight = this.cameras.main.height;
   }

   createStartButton() {
      // Crée un fond rectangulaire pour le bouton
      let background = this.add
         .rectangle(0, 0, 200, 50, 0x000000)
         .setStrokeStyle(2, 0xffffff);

      // Crée le texte du bouton
      let text = this.add
         .text(0, 0, "Start", {
            font: "32px Arial",
            fill: "#fff",
         })
         .setOrigin(0.5);

      // Groupe le fond et le texte dans un container
      let button = this.add.container(
         this.cameras.main.centerX,
         this.cameras.main.centerY,
         [background, text]
      );
      button.setSize(200, 50);
      button.setInteractive({ useHandCursor: true });

      // Événement de clic pour démarrer le jeu
      button.on("pointerdown", () => {
         this.scene.start("GameScene");
      });

      // Effet de survol pour le bouton
      button
         .on("pointerover", () => {
            text.setStyle({ fill: "#f00" }); // Change la couleur du texte au survol
         })
         .on("pointerout", () => {
            text.setStyle({ fill: "#fff" }); // Retour à la couleur initiale du texte
         });
   }
}
