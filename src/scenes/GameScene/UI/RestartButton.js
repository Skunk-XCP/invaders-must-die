import Phaser from "phaser";

export const createRestartButton = (scene) => {
   // Définir les dimensions et le style du bouton
   const buttonWidth = 200;
   const buttonHeight = 50;
   const buttonX = scene.cameras.main.centerX - buttonWidth / 2;
   const buttonY = scene.cameras.main.centerY - buttonHeight / 2;

   // Créer le fond du bouton
   const buttonBackground = scene.add
      .graphics()
      .fillStyle(0x000000, 0.5)
      .setInteractive(
         new Phaser.Geom.Rectangle(buttonX, buttonY, buttonWidth, buttonHeight),
         Phaser.Geom.Rectangle.Contains
      )
      .fillRect(buttonX, buttonY, buttonWidth, buttonHeight)
      .lineStyle(2, 0xffffff)
      .strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

   // Ajouter le texte du bouton
   scene.add
      .text(scene.cameras.main.centerX, scene.cameras.main.centerY, "Restart", {
         fontSize: "20px",
         color: "#FFFFFF",
      })
      .setOrigin(0.5);

   // Ajouter un événement de clic au fond du bouton pour redémarrer la scène
   buttonBackground.on("pointerdown", () => {
      scene.scene.restart();
   });

   // Changer le curseur en pointeur lors du survol du bouton
   buttonBackground.on("pointerover", () => {
      scene.input.setDefaultCursor("pointer");
   });

   // Revenir au curseur par défaut lorsqu'on quitte le bouton
   buttonBackground.on("pointerout", () => {
      scene.input.setDefaultCursor("default");
   });
};
