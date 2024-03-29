import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
   constructor() {
      super("game_scene");
      this.shipProportion = 0.1; // 10% de la hauteur de l'écran
   }

   preload() {
      // precharger assets
      this.load.image("background", "assets/backgroundStage/background.webp");
      this.load.image("playerShip", "/assets/sprites/playerShips/1B.png");
      this.load.image("boost", "/assets/sprites/effects/boost.png");
   }

   create() {
      // Définir la proportion du vaisseau par rapport à la hauteur de l'écran
      const shipProportion = 0.1;

      // Affichage du fond adapté à la taille de l'écran
      this.background = this.add
         .image(this.scale.width / 2, this.scale.height / 2, "background")
         .setOrigin(0.5, 0.5)
         .setDisplaySize(this.scale.width, this.scale.height);

      // Création du vaisseau et ajustement de sa taille
      this.playerShip = this.physics.add
         .sprite(this.scale.width / 2, this.scale.height, "playerShip")
         .setOrigin(0.5, 1);
      let shipScale =
         (this.scale.height * shipProportion) / this.playerShip.height;
      this.playerShip.setScale(shipScale);

      // Position du vaisseau en bas au milieu de l'écran
      this.playerShip.y = this.scale.height - this.playerShip.displayHeight / 2;

      // Création du boost
      this.boost = this.add
         .sprite(
            this.playerShip.x,
            this.playerShip.y - this.playerShip.displayHeight,
            "boost"
         )
         .setOrigin(0.5, 0)
         .setVisible(false)
         .setBlendMode(Phaser.BlendModes.ADD);
      this.boost.setScale(shipScale);

      // Créer un "tween" pour le clignotement
      this.boostTween = this.tweens.add({
         targets: this.boost,
         alpha: { from: 0.4, to: 1 },
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

   resize(gameSize) {
      const { width, height } = gameSize;

      // Adapte la taille du fond à la nouvelle taille de l'écran
      this.background.setDisplaySize(width, height);

      // Calcule la nouvelle échelle du vaisseau basée sur la proportion définie
      let shipScale = (height * this.shipProportion) / this.playerShip.height;
      this.playerShip.setScale(shipScale);
      this.playerShip.setPosition(
         width / 2,
         height - this.playerShip.displayHeight / 2
      );

      // Adapter la taille et la position du boost
      this.boost.setScale(shipScale);
      this.boost.setPosition(
         this.playerShip.x,
         this.playerShip.y - this.playerShip.displayHeight
      );
   }

   update() {
      const shipSpeed = 5;
      const shipWidthOffset = this.playerShip.displayWidth / 2;
      // Utilise la hauteur entière du vaisseau pour la limite supérieure
      const shipTopOffset = this.playerShip.displayHeight;
      // Définit une limite inférieure pour garder de l'espace entre scene et ship
      const shipBottomLimit =
         this.scale.height - this.playerShip.displayHeight / 4;

      // Mouvement horizontal avec limite
      if (this.WASD.left.isDown) {
         this.playerShip.x = Phaser.Math.Clamp(
            this.playerShip.x - shipSpeed,
            shipWidthOffset,
            this.scale.width - shipWidthOffset
         );
      } else if (this.WASD.right.isDown) {
         this.playerShip.x = Phaser.Math.Clamp(
            this.playerShip.x + shipSpeed,
            shipWidthOffset,
            this.scale.width - shipWidthOffset
         );
      }

      // Mouvement vertical avec limite
      if (this.WASD.up.isDown) {
         this.playerShip.y = Phaser.Math.Clamp(
            this.playerShip.y - shipSpeed,
            shipTopOffset,
            shipBottomLimit // Utilise la limite inférieure définie
         );
         this.boost.setVisible(true);
      } else {
         this.boost.setVisible(false);
      }

      if (this.WASD.down.isDown) {
         this.playerShip.y = Phaser.Math.Clamp(
            this.playerShip.y + shipSpeed,
            shipTopOffset,
            shipBottomLimit
         );
      }

      // Alignement du boost
      this.boost.x = this.playerShip.x;
      this.boost.y = this.playerShip.y - this.playerShip.displayHeight / 2;
   }
}
