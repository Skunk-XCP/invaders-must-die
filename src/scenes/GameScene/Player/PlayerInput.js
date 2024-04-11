import Phaser from "phaser";

export const setupInput = (scene) => {
   //* Configuration du clavier
   scene.WASD = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
   });

   //* Configuration du clic de souris pour tirer
   scene.input.on("pointerdown", (pointer) => {
      if (pointer.leftButtonDown()) {
         scene.isFiring = true;
      }
   });

   //* Configuration du clic de souris pour commencer à tirer
   scene.input.on("pointerup", () => {
      scene.isFiring = false;
   });

   //* Lorsque le bouton de la souris est relâché, arrête de tirer
   scene.input.on("pointerup", () => {
      scene.isFiring = false;
   });

   //* Annule l'ouverture du menu contextuel du clic droit
   scene.input.on("pointerdown", function (pointer) {
      if (pointer.rightButtonDown()) {
         // Empêche le menu contextuel de s'ouvrir
         pointer.event.preventDefault();
         //TODO Ajouter logique pour le tir secondaire
      }
   });
};
