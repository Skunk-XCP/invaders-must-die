import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
   constructor() {
      super("game_scene");
      this.shipProportion = 0.1; // 10% de la hauteur de l'écran
      this.isFiring = false;
      this.timeSinceLastRocket = 0; // Temps écoulé depuis le dernier tir
      this.rocketFireRate = 200; // Taux de tir en millisecondes
      this.hitboxVerticalOffset = 0.5;
      this.nebulas = ["nebula1", "nebula2", "nebula3"];
      this.lastNebulaTime = 0;
      this.nebulaInterval = Phaser.Math.Between(100000, 250000);
   }

   preload() {
      // precharger assets
      this.load.image("background", "assets/stars/Stars.png");
      this.load.on("filecomplete", function (key, type, data) {
         if (key === "background") {
            console.log("Background image loaded");
         }
      });
      this.load.image("playerShip", "/assets/sprites/playerShips/1B.png");
      this.load.image("boost", "/assets/sprites/effects/boost/boost.png");
      this.load.image("nebula1", "/assets/nebula/Nebula1.png");
      this.load.image("nebula2", "/assets/nebula/Nebula2.png");
      this.load.image("nebula3", "/assets/nebula/Nebula3.png");
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

   init(data) {
      //* Ici, tu peux initialiser les propriétés de ta scène avec les données passées
      this.gameWidth = data.width;
      this.gameHeight = data.height;
   }

   create() {
      //* Création du fond de la scène de jeu (70% de la largeur de l'écran)
      this.add.rectangle(
         this.gameWidth / 2,
         this.gameHeight / 2,
         this.gameWidth,
         this.gameHeight,
         0x000000
      );

      //* Création des bandes latérales (15% de la largeur de l'écran de chaque côté)
      const sidebarWidth = window.innerWidth * 0.15;
      this.add.rectangle(
         sidebarWidth / 2,
         this.gameHeight / 2,
         sidebarWidth,
         this.gameHeight,
         0x333333
      );
      this.add.rectangle(
         this.gameWidth + sidebarWidth / 2,
         this.gameHeight / 2,
         sidebarWidth,
         this.gameHeight,
         0x333333
      );

      //* Défini la proportion du vaisseau par rapport à la hauteur de l'écran
      const shipProportion = 0.1;
      this.rockets = [];

      //* Affichage du fond adapté à la taille de l'écran
      this.background = this.add.tileSprite(
         this.scale.width / 2,
         this.scale.height / 2,
         this.scale.width,
         this.scale.height,
         "background"
      );

      //* Création du vaisseau et ajustement de sa taille
      this.playerShip = this.physics.add
         .sprite(this.scale.width / 2, this.scale.height, "playerShip")
         .setOrigin(0.5, 1);
      let shipScale =
         (this.scale.height * shipProportion) / this.playerShip.height;
      this.playerShip.setScale(shipScale);

      //* Ajout hitbox au centre du vaisseau
      this.createShipHitbox(shipScale);

      //* Position du vaisseau en bas au milieu de l'écran
      this.playerShip.y = this.scale.height - this.playerShip.displayHeight / 2;

      //* Création du boost
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

      //* Créer un "tween" pour le clignotement
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

      //* Configuration du clavier
      this.WASD = this.input.keyboard.addKeys({
         up: Phaser.Input.Keyboard.KeyCodes.W,
         down: Phaser.Input.Keyboard.KeyCodes.S,
         left: Phaser.Input.Keyboard.KeyCodes.A,
         right: Phaser.Input.Keyboard.KeyCodes.D,
      });

      //* Configuration du clic de souris pour tirer
      this.input.on("pointerdown", (pointer) => {
         if (pointer.leftButtonDown()) {
            this.fireRockets();
         }
      });

      //* Configuration du clic de souris pour commencer à tirer
      this.input.on("pointerdown", (pointer) => {
         if (pointer.leftButtonDown()) {
            this.isFiring = true;
         }
      });

      //* Lorsque le bouton de la souris est relâché, arrête de tirer
      this.input.on("pointerup", () => {
         this.isFiring = false;
      });

      //* Annule l'ouverture du menu contextuel du clic droit
      this.input.on("pointerdown", function (pointer) {
         if (pointer.rightButtonDown()) {
            // Empêche le menu contextuel de s'ouvrir
            pointer.event.preventDefault();
            //TODO Ajouter logique pour le tir secondaire
         }
      });
   }

   createShipHitbox(shipScale) {
      //* Définie taille hitbox basée sur l'échelle de dimension du ship
      let hitboxWidth = this.playerShip.displayWidth * 0.3;
      let hitboxHeight = this.playerShip.displayHeight * 0.3;

      //* Crée et positionne hitbox
      this.shipHitbox = this.add.rectangle(
         this.playerShip.x,
         this.playerShip.y,
         hitboxWidth,
         hitboxHeight,
         0xff0000,
         0.5 // TODO retirer couleur hitbox = 0
      );

      //* Faire de la hitbox un objet physique
      this.shipHitbox.setScrollFactor(0);
   }

   resize(gameSize) {
      const { width, height } = gameSize;

      //* Adapte la taille du fond à la nouvelle taille de l'écran
      this.background.setDisplaySize(width, height);

      //* Calcule la nouvelle échelle du vaisseau basée sur la proportion définie
      let shipScale = (height * this.shipProportion) / this.playerShip.height;
      this.playerShip.setScale(shipScale);
      this.playerShip.setPosition(
         width / 2,
         height - this.playerShip.displayHeight / 2
      );

      //* Adapter la taille et la position du boost
      this.boost.setScale(shipScale);
      this.boost.setPosition(
         this.playerShip.x,
         this.playerShip.y - this.playerShip.displayHeight
      );

      //* Redimensionne et repositionne la hitbox
      this.createShipHitbox(shipScale);
   }

   fireRockets() {
      const rocketOffset = this.playerShip.displayWidth * 0.25;

      //* Crée la première roquette à gauche du vaisseau
      let rocketLeft = this.add.sprite(
         this.playerShip.x - rocketOffset,
         this.playerShip.y - this.playerShip.displayHeight / 2,
         "rocket1"
      );
      rocketLeft.play("fireRockets");

      //* Crée la deuxième roquette à droite du vaisseau
      let rocketRight = this.add.sprite(
         this.playerShip.x + rocketOffset,
         this.playerShip.y - this.playerShip.displayHeight / 2,
         "rocket1"
      );
      rocketRight.play("fireRockets");

      this.rockets.push(rocketLeft);
      this.rockets.push(rocketRight);

      // TODO Ajouter logique pour déplacer les roquettes ou gérer les collisions
   }

   update(time, delta) {
      const shipSpeed = 4;
      const shipWidthOffset = this.playerShip.displayWidth / 2;
      //* Utilise la hauteur entière du vaisseau pour la limite supérieure
      const shipTopOffset = this.playerShip.displayHeight;
      //* Définit une limite inférieure pour garder de l'espace entre scene et ship
      const shipBottomLimit =
         this.scale.height - this.playerShip.displayHeight / 4;

      //* Mouvement horizontal avec limite
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

      //* Mouvement vertical avec limite
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

      //* Alignement du boost
      this.boost.x = this.playerShip.x;
      this.boost.y = this.playerShip.y - this.playerShip.displayHeight / 2;

      //* Update position hitbox pour suivre ship
      this.shipHitbox.x = this.playerShip.x;
      this.shipHitbox.y =
         this.playerShip.y -
         this.playerShip.displayHeight * this.hitboxVerticalOffset;

      for (let i = this.rockets.length - 1; i >= 0; i--) {
         const rocket = this.rockets[i];
         rocket.y -= 10; // Déplace chaque roquette vers le haut

         // Vérifie si la roquette est sortie de l'écran
         if (rocket.y < 0) {
            rocket.destroy(); // Détruit la roquette
            this.rockets.splice(i, 1); // Retire la roquette du tableau
         }
      }

      //* Met à jour le compteur de temps depuis le dernier tir
      if (this.timeSinceLastRocket < this.rocketFireRate) {
         this.timeSinceLastRocket += delta;
      }

      //* Si le drapeau isFiring est vrai, et que le temps depuis le dernier tir est supérieur à une certaine intervalle, tire une roquette
      if (this.isFiring && this.timeSinceLastRocket >= this.rocketFireRate) {
         this.fireRockets();
         this.timeSinceLastRocket = 0;
      }

      // Déplace le background vers le haut
      this.background.tilePositionY -= 0.3;

      // Gestion de l'apparition des nébulas
      if (time - this.lastNebulaTime > this.nebulaInterval) {
         this.spawnNebula();
         this.lastNebulaTime = time;
         this.nebulaInterval = Phaser.Math.Between(100000, 250000); // Prochain intervalle
      }
   }

   spawnNebula() {
      // Sélection aléatoire d'une nébula
      let randomNebulaKey = Phaser.Math.RND.pick(this.nebulas);
      let nebula = this.add.image(
         Phaser.Math.Between(0, this.scale.width), // Position horizontale aléatoire
         -300, // Démarre au-dessus de l'écran pour une entrée progressive
         randomNebulaKey
      );

      // Ajustement de la profondeur pour que la nébula soit derrière le background transparent
      nebula.setDepth(-1);

      // Affectation d'une rotation aléatoire à la nébula
      let randomRotation = Phaser.Math.Between(-180, 180);
      nebula.setRotation(Phaser.Math.DegToRad(randomRotation));

      // Ajoute un effet mirror horizontal aléatoire
      if (Phaser.Math.RND.pick([true, false])) {
         nebula.setFlipX(true);
      }

      // Ajustement de la taille de la nébula
      let scale = Phaser.Math.Between(0.5, 1);
      nebula.setScale(scale);

      // Définition de la vitesse de la nébula
      let speed = Phaser.Math.Between(100, 200);
      this.tweens.add({
         targets: nebula,
         y: this.scale.height + nebula.height * scale + 100, // Déplace verticalement jusqu'à ce qu'elle soit complètement sortie de l'écran par le bas
         ease: "Linear",
         duration: speed * 500, // Augmente la durée pour un mouvement plus lent et naturel
         repeat: 0,
         onComplete: () => {
            nebula.destroy(); // Destruction de la nébula une fois qu'elle a traversé l'écran
         },
      });
   }
}
