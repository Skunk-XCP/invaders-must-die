import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
   constructor() {
      super("game_scene");
   }

   preload() {
      // precharger assets
      this.load.image("background", "assets/backgroundStage/background.webp");
      this.load.image("playerShip", "/assets/sprites/playerShips/1B.png");
      this.load.image("boost", "/assets/sprites/effects/boost.png");
   }

   create() {
      // Affichage du fond
      this.add
         .image(this.scale.width / 2, this.scale.height / 2, "background")
         .setOrigin(0.5, 0.5);

      // Création du vaisseau
      this.playerShip = this.physics.add
         .sprite(0, 0, "playerShip")
         .setOrigin(0.5, 0.5);

      // Création du boost
      this.boost = this.add
         .sprite(0, this.playerShip.displayHeight * 0.5, "boost")
         .setOrigin(0.5, 0.25)
         .setVisible(false)
         .setBlendMode(Phaser.BlendModes.ADD);

      // Groupe le vaisseau et le boost dans un conteneur
      this.shipContainer = this.add.container(600, 1100, [
         this.playerShip,
         this.boost,
      ]);

      // Animation de clignotement pour le boost
      this.boostTween = this.tweens.add({
         targets: this.boost,
         alpha: { from: 0.5, to: 1 },
         duration: 100, // Durée d'un clignotement
         yoyo: true, // Fait aller l'alpha de 0.5 à 1 puis de 1 à 0.5
         repeat: -1, // Répète l'animation indéfiniment
      });

      // Configuration du clavier
      this.WASD = this.input.keyboard.addKeys({
         up: Phaser.Input.Keyboard.KeyCodes.W,
         down: Phaser.Input.Keyboard.KeyCodes.S,
         left: Phaser.Input.Keyboard.KeyCodes.A,
         right: Phaser.Input.Keyboard.KeyCodes.D,
      });
   }

   update() {
      // Mouvement et rotation du vaisseau avec les touches fléchées
      if (this.WASD.left.isDown) {
         this.shipContainer.x -= 5;
      } else if (this.WASD.right.isDown) {
         this.shipContainer.x += 5;
      } else {
         this.playerShip.angle = 0; // Pas d'inclinaison
      }

      // Mouvement vertical
      if (this.WASD.up.isDown) {
         this.shipContainer.y -= 5;
         this.boost.setVisible(true); // Afficher le boost lorsque le vaisseau monte
      } else if (this.WASD.down.isDown) {
         this.shipContainer.y += 5;
      } else {
         this.boost.setVisible(false); // Cacher le boost
      }

      // Si le vaisseau n'est pas en train de tourner, réinitialisez progressivement l'angle
      if (!this.WASD.left.isDown && !this.WASD.right.isDown) {
         this.playerShip.angle = Phaser.Math.Linear(
            this.playerShip.angle,
            0,
            0.05
         );
      }
   }
}
