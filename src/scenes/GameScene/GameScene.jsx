import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
   constructor() {
      super("game_scene");
      this.shipProportion = 0.1; // 10% de la hauteur de l'écran
      this.isFiring = false;
      this.timeSinceLastRocket = 0; // Temps écoulé depuis le dernier tir
      this.rocketFireRate = 200; // Taux de tir en millisecondes
   }

   preload() {
      // precharger assets
      this.load.image("background", "assets/backgroundStage/background.webp");
      this.load.image("playerShip", "/assets/sprites/playerShips/1B.png");
      this.load.image("boost", "/assets/sprites/effects/boost/boost.png");
      this.load.image(
         "playerRocket0",
         "/assets/sprites/effects/playerRocket/rocket_1_0000.png"
      );
      this.load.image(
         "playerRocket1",
         "/assets/sprites/effects/playerRocket/rocket_1_0001.png"
      );
      this.load.image(
         "playerRocket2",
         "/assets/sprites/effects/playerRocket/rocket_1_0002.png"
      );
      this.load.image(
         "playerRocket3",
         "/assets/sprites/effects/playerRocket/rocket_1_0003.png"
      );
      this.load.image(
         "playerRocket4",
         "/assets/sprites/effects/playerRocket/rocket_1_0004.png"
      );
      this.load.image(
         "playerRocket5",
         "/assets/sprites/effects/playerRocket/rocket_1_0005.png"
      );
      this.load.image(
         "playerRocket6",
         "/assets/sprites/effects/playerRocket/rocket_1_0006.png"
      );
      this.load.image(
         "playerRocket7",
         "/assets/sprites/effects/playerRocket/rocket_1_0007.png"
      );
      this.load.image(
         "playerRocket8",
         "/assets/sprites/effects/playerRocket/rocket_1_0008.png"
      );
      this.load.image(
         "playerRocket9",
         "/assets/sprites/effects/playerRocket/rocket_1_0009.png"
      );
      this.load.image(
         "playerRocket10",
         "/assets/sprites/effects/playerRocket/rocket_1_0010.png"
      );
      this.load.image(
         "playerRocket11",
         "/assets/sprites/effects/playerRocket/rocket_1_0011.png"
      );
      this.load.image(
         "playerRocket12",
         "/assets/sprites/effects/playerRocket/rocket_1_0012.png"
      );
      this.load.image(
         "playerRocket13",
         "/assets/sprites/effects/playerRocket/rocket_1_0013.png"
      );
      this.load.image(
         "playerRocket14",
         "/assets/sprites/effects/playerRocket/rocket_1_0014.png"
      );
      this.load.image(
         "playerRocket15",
         "/assets/sprites/effects/playerRocket/rocket_1_0015.png"
      );
   }

   create() {
      // Définir la proportion du vaisseau par rapport à la hauteur de l'écran
      const shipProportion = 0.1;
      this.rockets = [];

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

      // Ajout hitbox au centre du vaisseau
      let hitboxWidth = this.playerShip.displayWidth * shipScale * 0.4;
      let hitboxHeight = this.playerShip.displayHeight * shipScale * 0.4;
      let hitboxX = this.playerShip.x;
      let hitboxY =
         this.playerShip.y - (this.playerShip.displayHeight * shipScale) / 2;
      this.shipHitbox = this.add.rectangle(
         hitboxX,
         hitboxY,
         hitboxWidth,
         hitboxHeight,
         0xff0000,
         0.5
      );
      this.physics.add.existing(this.shipHitbox); // Cela transforme le rectangle en objet physique
      this.shipHitbox.body.isSensor = true; // Cela transforme le corps en capteur pour les collisions

      // Attache hitbox au ship
      this.playerShip.body.setOffset(
         this.shipHitbox.width / 2,
         this.shipHitbox.height / 2
      );

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

      // Création du tir de rocket player
      this.anims.create({
         key: "fireRockets",
         frames: [
            { key: "playerRocket0" },
            { key: "playerRocket1" },
            { key: "playerRocket2" },
            { key: "playerRocket3" },
            { key: "playerRocket4" },
            { key: "playerRocket5" },
            { key: "playerRocket6" },
            { key: "playerRocket7" },
            { key: "playerRocket8" },
            { key: "playerRocket9" },
            { key: "playerRocket10" },
            { key: "playerRocket11" },
            { key: "playerRocket12" },
            { key: "playerRocket13" },
            { key: "playerRocket14" },
            { key: "playerRocket15" },
         ],
         frameRate: 10, // Nombre d'images par seconde, à ajuster selon la rapidité de l'animation souhaitée
         repeat: 0, // 0 signifie que l'animation ne se répétera pas; elle ne sera jouée qu'une seule fois par appel
      });

      // Configuration du clavier
      this.WASD = this.input.keyboard.addKeys({
         up: Phaser.Input.Keyboard.KeyCodes.W,
         down: Phaser.Input.Keyboard.KeyCodes.S,
         left: Phaser.Input.Keyboard.KeyCodes.A,
         right: Phaser.Input.Keyboard.KeyCodes.D,
      });

      // Configuration du clic de souris pour tirer
      this.input.on("pointerdown", (pointer) => {
         if (pointer.leftButtonDown()) {
            this.fireRockets();
         }
      });

      // Configuration du clic de souris pour commencer à tirer
      this.input.on("pointerdown", (pointer) => {
         if (pointer.leftButtonDown()) {
            this.isFiring = true; // Commence à tirer
         }
      });

      // Lorsque le bouton de la souris est relâché, arrête de tirer
      this.input.on("pointerup", () => {
         this.isFiring = false;
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

   fireRockets() {
      const rocketOffset = this.playerShip.displayWidth * 0.25;

      // Crée la première roquette à gauche du vaisseau
      let rocketLeft = this.add.sprite(
         this.playerShip.x - rocketOffset,
         this.playerShip.y - this.playerShip.displayHeight / 2,
         "rocket1"
      );
      rocketLeft.play("fireRockets");

      // Crée la deuxième roquette à droite du vaisseau
      let rocketRight = this.add.sprite(
         this.playerShip.x + rocketOffset,
         this.playerShip.y - this.playerShip.displayHeight / 2,
         "rocket1"
      );
      rocketRight.play("fireRockets");

      this.rockets.push(rocketLeft);
      this.rockets.push(rocketRight);

      // Ajoute ici la logique pour déplacer les roquettes ou gérer les collisions
   }

   update(_, delta) {
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

      // Update position hitbox pour suivre ship
      this.shipHitbox.setPosition(
         this.playerShip.x,
         this.playerShip.y -
            (this.playerShip.displayHeight * this.playerShip.scale) / 1.1
      );

      for (let i = this.rockets.length - 1; i >= 0; i--) {
         const rocket = this.rockets[i];
         rocket.y -= 10; // Déplace chaque roquette vers le haut

         // Vérifie si la roquette est sortie de l'écran
         if (rocket.y < 0) {
            rocket.destroy(); // Détruit la roquette
            this.rockets.splice(i, 1); // Retire la roquette du tableau
         }
      }

      // Met à jour le compteur de temps depuis le dernier tir
      if (this.timeSinceLastRocket < this.rocketFireRate) {
         this.timeSinceLastRocket += delta;
      }

      // Si le drapeau isFiring est vrai, et que le temps depuis le dernier tir est supérieur à une certaine intervalle, tire une roquette
      if (this.isFiring && this.timeSinceLastRocket >= this.rocketFireRate) {
         this.fireRockets();
         this.timeSinceLastRocket = 0;
      }
   }
}
