import Phaser from "phaser";

export const createPlayerBoost = (scene, shipScale) => {
   // Création du boost joueur
   scene.boost = scene.add
      .sprite(
         scene.playerShip.x,
         scene.playerShip.y - scene.playerShip.displayHeight,
         "playerBoost"
      )
      .setOrigin(0.5, 0)
      .setVisible(false)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(shipScale);

   // Animation de clignotement pour le boost
   scene.boostTween = scene.tweens.add({
      targets: scene.boost,
      alpha: { from: 0.4, to: 1 },
      duration: 100,
      yoyo: true,
      repeat: -1,
   });
};

export const createPlayerRocketAnimation = (scene) => {
   // Création de l'animation du tir de rocket à partir d'un atlas
   scene.anims.create({
      key: "fireRockets",
      frames: scene.anims.generateFrameNames("playerRockets", {
         start: 0,
         end: 15,
         prefix: "rocket_1_",
         zeroPad: 4,
      }),
      frameRate: 10,
      repeat: 0,
   });
};

export const playerExplosion = (scene) => {
   scene.anims.create({
      key: "playerExplosion",
      frames: scene.anims.generateFrameNames("playerExplosion", {
         start: 0,
         end: 31,
         prefix: "expl_10_",
         suffix: "",
         zeroPad: 4,
      }),
      frameRate: 20,
      repeat: 0,
   });
};
