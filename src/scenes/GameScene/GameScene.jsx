import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
   constructor() {
      super("game_scene");
      this.gameWidth = window.innerWidth * 0.7;
      this.gameHeight = window.innerHeight;
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
         }
      });
      this.load.image("playerShip", "/assets/sprites/playerShips/1B.png");
      this.load.image(
         "playerBoost",
         "/assets/sprites/effects/boost/boost_1.png"
      );
      this.load.image(
         "redFrigateEnemyBoost",
         "/assets/sprites/effects/boost/boost_4.png"
      );
      this.load.image("nebula1", "/assets/sprites/nebula/Nebula1.png");
      this.load.image("nebula2", "/assets/sprites/nebula/Nebula2.png");
      this.load.image("nebula3", "/assets/sprites/nebula/Nebula3.png");
      this.load.image(
         "redFrigate",
         "/assets/sprites/enemyShips/frigate/frigate1.png"
      );
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
      this.load.image(
         "redFrigateBullet",
         "/assets/sprites/effects/enemyFire/shotFired.png"
      );
   }

   init(data) {
      // Initialiser ici les propriétés qui peuvent dépendre des paramètres passés à la scène
      this.startX = data.startX;
      this.startY = data.startY;
   }

   create(startX, startY) {
      // Active le rendu debug et configure les paramètres globaux de debug
      // this.physics.world.drawDebug = true; // Active le rendu debug
      // this.physics.world.debugConfig = {
      //    bodyColor: 0x00ffff, // Couleur des contours des hitboxes
      //    showBody: true,
      //    showVelocity: true,
      // };
      // this.physics.world.createDebugGraphic();

      this.createBackground();
      this.createPlayer();
      this.setupInput();
      this.spawnRedFrigateEnemy();
      this.bullets = [];
   }

   createBackground() {
      //* Affichage du fond adapté à la taille de l'écran
      this.background = this.add.tileSprite(
         this.scale.width / 2,
         this.scale.height / 2,
         this.scale.width,
         this.scale.height,
         "background"
      );
   }

   createPlayer() {
      //* Défini la proportion du vaisseau par rapport à la hauteur de l'écran
      const shipProportion = 0.1;
      this.rockets = [];

      this.playerShip = this.physics.add
         .sprite(this.scale.width / 2, this.scale.height, "playerShip")
         .setOrigin(0.5, 1);
      const shipScale =
         (this.scale.height * shipProportion) / this.playerShip.height;
      this.playerShip.setScale(shipScale);

      this.configurePlayerHitbox(); // Configure la hitbox directement

      this.playerShip.y = this.scale.height - this.playerShip.displayHeight / 2;

      //* Création du boost joueur
      this.boost = this.add
         .sprite(
            this.playerShip.x,
            this.playerShip.y - this.playerShip.displayHeight,
            "playerBoost"
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
   }

   configurePlayerHitbox(shipScale) {
      //* Définie taille hitbox basée sur l'échelle de dimension du ship
      const hitboxWidth = this.playerShip.displayWidth * 0.3;
      const hitboxHeight = this.playerShip.displayHeight * 0.3;
      const offsetX = (this.playerShip.width - hitboxWidth) / 2;
      const offsetY = (this.playerShip.height - hitboxHeight) / 2;

      this.playerShip.body.setSize(hitboxWidth, hitboxHeight);
      this.playerShip.body.setOffset(offsetX, offsetY);
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

   // Fonction pour faire apparaître un ennemi frigate avec un pattern de déplacement prédéfini moveEnemy()
   spawnRedFrigateEnemy() {
      this.redFrigateEnemy = this.physics.add
         .sprite(this.scale.width / 2, -50, "redFrigate")
         .setScale(0.3);

      // Crée les boosts pour l'ennemi
      this.createFrigateBoosts(this.redFrigateEnemy);

      // Démarre le tir de l'ennemi
      this.redFrigateEnemy.shootTimer = this.time.addEvent({
         delay: 1500,
         callback: this.redFrigateShot,
         callbackScope: this,
         loop: true,
      });

      // Crée la hitbox pour l'ennemi
      this.createFrigateHitbox(this.redFrigateEnemy);

      // Les rends invisibles dès le départ
      this.redFrigateEnemy.leftBoost.setVisible(true);
      this.redFrigateEnemy.rightBoost.setVisible(true);

      // Masque les propulseurs après un certain temps
      this.time.delayedCall(1500, () => {
         if (
            this.redFrigateEnemy &&
            this.redFrigateEnemy.leftBoost &&
            this.redFrigateEnemy.rightBoost
         ) {
            this.redFrigateEnemy.leftBoost.setVisible(false);
            this.redFrigateEnemy.rightBoost.setVisible(false);
         }
      });

      // Obtient une chorégraphie aléatoire et l'applique
      const choreography = this.getRandomChoreography(this.redFrigateEnemy);
      choreography.forEach((tween) => {
         this.tweens.add(tween);
      });
   }

   createFrigateHitbox(redFrigateEnemy) {
      const hitboxWidth = redFrigateEnemy.displayWidth * 0.6;
      const hitboxHeight = redFrigateEnemy.displayHeight * 0.6;
      const offsetX = 50;
      const offsetY = 70;

      // Configure la hitbox du sprite ennemi
      redFrigateEnemy.body.setSize(hitboxWidth, hitboxHeight);
      redFrigateEnemy.body.setOffset(offsetX, offsetY);
   }

   redFrigateShot() {
      // vitesse de deplacement du tir
      const bulletSpeed = 200;
      const bulletScale = 0.5;

      // Crée la première roquette à gauche du vaisseau ennemi avec physique
      let bulletLeft = this.physics.add.sprite(
         this.redFrigateEnemy.x - 7,
         this.redFrigateEnemy.y + 20,
         "redFrigateBullet"
      );
      bulletLeft.setVelocityY(bulletSpeed);
      bulletLeft.setScale(bulletScale);

      // Crée la deuxième roquette à droite du vaisseau ennemi avec physique
      let bulletRight = this.physics.add.sprite(
         this.redFrigateEnemy.x + 7,
         this.redFrigateEnemy.y + 20,
         "redFrigateBullet"
      );
      bulletRight.setVelocityY(bulletSpeed);
      bulletRight.setScale(bulletScale);

      // Ajoute les balles à un tableau si tu as besoin de les gérer plus tard
      this.bullets.push(bulletLeft, bulletRight);
   }

   createFrigateBoosts(redFrigateEnemy) {
      const boostOffsetX = redFrigateEnemy.displayWidth * 0.25;
      const boostOffsetY = redFrigateEnemy.displayHeight * 0.5;
      const boostScale = 0.2;

      // Création et positionnement des propulseurs
      redFrigateEnemy.leftBoost = this.add
         .sprite(
            redFrigateEnemy.x - boostOffsetX,
            redFrigateEnemy.y + boostOffsetY,
            "redFrigateEnemyBoost"
         )
         .setOrigin(-0.4, 3)
         .setVisible(true)
         .setScale(boostScale);

      redFrigateEnemy.rightBoost = this.add
         .sprite(
            redFrigateEnemy.x + boostOffsetX,
            redFrigateEnemy.y + boostOffsetY,
            "redFrigateEnemyBoost"
         )
         .setOrigin(1.4, 3)
         .setVisible(true)
         .setScale(boostScale);

      // Ajout d'un effet de clignotement aux propulseurs
      this.tweens.add({
         targets: [redFrigateEnemy.leftBoost, redFrigateEnemy.rightBoost], // Cible les deux propulseurs
         alpha: { from: 0.4, to: 1 },
         duration: 100,
         yoyo: true,
         repeat: -1,
      });
   }

   // Fonction pour générer une chorégraphie aléatoire
   getRandomChoreography(redFrigateEnemy) {
      const choreographies = [
         this.getChoreography1(redFrigateEnemy),
         this.getChoreography2(redFrigateEnemy),
         // Ajoute autant de chorégraphies que tu veux ici
      ];

      // Choisis une chorégraphie aléatoire
      return choreographies[Phaser.Math.Between(0, choreographies.length - 1)];
   }

   // Fonction pour définir une chorégraphie
   getChoreography1(redFrigateEnemy) {
      // Définis un ensemble de tweens pour cette chorégraphie
      return [
         // Tween 1: va vers la droite
         {
            targets: redFrigateEnemy,
            x: this.scale.width * 0.75,
            ease: "Sine.easeInOut",
            duration: 2000,
         },
         // Tween 2: descend
         {
            targets: redFrigateEnemy,
            y: this.scale.height * 0.5,
            ease: "Sine.easeInOut",
            duration: 2000,
         },
         // Ajoute plus de tweens pour compléter la chorégraphie
      ];
   }

   getChoreography2(redFrigateEnemy) {
      // L'ennemi entre dans la scène depuis le côté gauche et s'arrête au milieu
      const stopX = this.scale.width / 2; // Point d'arrêt au milieu de l'écran en largeur
      const stopY = this.scale.height / 2; // Point d'arrêt au milieu de l'écran en hauteur

      return [
         {
            targets: redFrigateEnemy,
            x: stopX,
            y: stopY,
            ease: "Sine.easeInOut",
            duration: 2000,
            onComplete: () => {
               // Ici, tu peux définir ce que tu veux faire une fois que l'ennemi s'est arrêté
               // Par exemple, arrêter tout mouvement ou déclencher une action spécifique
            },
         },
      ];
   }

   setupInput() {
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

   update(time, delta) {
      this.handlePlayerMovement();
      this.handleRocketFiring(delta);
      this.updateRocketPositions();
      this.handleBackgroundScroll();
      this.handleNebulaSpawn(time);
      this.checkEnemyBounds();
      this.updateBoostPosition();
   }

   handlePlayerMovement() {
      if (!this.playerShip || !this.playerShip.body) return;

      const shipSpeed = 4;
      const shipWidthOffset = this.playerShip.displayWidth / 2;
      const shipTopOffset = this.playerShip.displayHeight;
      const shipBottomLimit =
         this.scale.height - this.playerShip.displayHeight / 4;

      // Horizontal movement
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

      // Vertical movement
      if (this.WASD.up.isDown) {
         this.playerShip.y = Phaser.Math.Clamp(
            this.playerShip.y - shipSpeed,
            shipTopOffset,
            shipBottomLimit
         );
         this.boost?.setVisible(true);
      } else if (this.WASD.down.isDown) {
         this.playerShip.y = Phaser.Math.Clamp(
            this.playerShip.y + shipSpeed,
            shipTopOffset,
            shipBottomLimit
         );
      } else {
         this.boost?.setVisible(false);
      }
   }

   handleRocketFiring(delta) {
      if (!this.isFiring || !this.playerShip) return;

      if (this.timeSinceLastRocket >= this.rocketFireRate) {
         this.fireRockets();
         this.timeSinceLastRocket = 0;
      } else {
         this.timeSinceLastRocket += delta;
      }
   }

   updateRocketPositions() {
      this.rockets.forEach((rocket, index) => {
         rocket.y -= 10;
         if (rocket.y < 0) {
            rocket.destroy();
            this.rockets.splice(index, 1);
         }
      });
   }

   handleBackgroundScroll() {
      this.background.tilePositionY -= 0.3;
   }

   handleNebulaSpawn(time) {
      if (time - this.lastNebulaTime > this.nebulaInterval) {
         this.spawnNebula();
         this.lastNebulaTime = time;
         this.nebulaInterval = Phaser.Math.Between(100000, 250000);
      }
   }

   checkEnemyBounds() {
      if (
         this.redFrigateEnemy &&
         this.redFrigateEnemy.y >
            this.scale.height + this.redFrigateEnemy.displayHeight / 2
      ) {
         this.redFrigateEnemy.destroy();
         this.redFrigateEnemy = null;
      }
   }

   updateBoostPosition() {
      if (!this.boost || !this.playerShip) return;

      this.boost.x = this.playerShip.x;
      this.boost.y = this.playerShip.y - this.playerShip.displayHeight / 2;
   }
}
