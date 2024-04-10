import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
   constructor() {
      super("GameScene");
      this.gameWidth = window.innerWidth * 0.7;
      this.gameHeight = window.innerHeight;
      this.shipProportion = 0.1; // 10% de la hauteur de l'écran
      this.frigateProportion = 0.1;
      this.isFiring = false;
      this.timeSinceLastRocket = 0; // Temps écoulé depuis le dernier tir
      this.rocketFireRate = 200; // Taux de tir en millisecondes
      this.hitboxVerticalOffset = 0.5;
      this.nebulas = ["nebula1", "nebula2", "nebula3"];
      this.lastNebulaTime = 0;
      this.nebulaInterval = Phaser.Math.Between(70000, 200000);
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
      this.load.atlas(
         "playerRockets",
         "/assets/sprites/effects/playerRockets/playerRockets.png",
         "/assets/sprites/effects/playerRockets/playerRockets.json"
      );
      this.load.atlas(
         "playerExplosion",
         "/assets/sprites/explosions/playerExplosion/playerExplosion.png",
         "/assets/sprites/explosions/playerExplosion/playerExplosion.json"
      );
      this.load.atlas(
         "explosion_01",
         "/assets/sprites/explosions/explosion_01/explosion_01.png",
         "/assets/sprites/explosions/explosion_01/explosion_01.json"
      );
      this.load.image("nebula1", "/assets/sprites/nebula/Nebula1.png");
      this.load.image("nebula2", "/assets/sprites/nebula/Nebula2.png");
      this.load.image("nebula3", "/assets/sprites/nebula/Nebula3.png");
      this.load.image(
         "redFrigate",
         "/assets/sprites/enemyShips/frigate/frigate1.png"
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
      this.createBackground();
      this.createPlayer();
      this.rocketGroup();
      this.enemyProjectiles = this.physics.add.group();
      this.setupInput();
      this.enemyGroup();
      this.spawnRedFrigateEnemy();
      this.setupColliders();
      this.explosion_01();
      this.playerExplosion();
      this.bullets = [];
   }

   resize(gameSize) {
      const { width, height } = gameSize;

      // Adapte la taille du fond à la nouvelle taille de l'écran
      this.background.setDisplaySize(width, height);

      //* Adapte dimensions et position du vaisseau joueur
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

      // Redimensionne et repositionne la hitbox
      this.createShipHitbox(shipScale);

      //* Adapte dimensions et position du vaisseau redFrigateEnemy
      let redFrigateScale =
         (height * this.shipProportion) / this.playerShip.height;
      this.playerShip.setScale(redFrigateScale);
      this.playerShip.setPosition(
         width / 2,
         height - this.playerShip.displayHeight / 2
      );

      this.createredFrigateHitbox(redFrigateScale);
   }

   createRestartButton() {
      // Définir les dimensions et le style du bouton
      const buttonWidth = 200;
      const buttonHeight = 50;
      const buttonX = this.cameras.main.centerX - buttonWidth / 2;
      const buttonY = this.cameras.main.centerY - buttonHeight / 2;

      // Créer le fond du bouton
      const buttonBackground = this.add
         .graphics()
         .fillStyle(0x000000, 0.5) // Couleur et transparence du fond
         .setInteractive(
            new Phaser.Geom.Rectangle(
               buttonX,
               buttonY,
               buttonWidth,
               buttonHeight
            ),
            Phaser.Geom.Rectangle.Contains
         )
         .fillRect(buttonX, buttonY, buttonWidth, buttonHeight)
         .lineStyle(2, 0xffffff) // Couleur et épaisseur du contour
         .strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

      // Ajouter le texte du bouton
      this.add
         .text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            "Restart",
            {
               fontSize: "20px",
               color: "#FFFFFF",
            }
         )
         .setOrigin(0.5);

      // Ajouter un événement de clic au fond du bouton pour redémarrer la scène
      buttonBackground.on("pointerdown", () => {
         this.scene.restart();
      });

      // Changer le curseur en pointeur lors du survol du bouton
      buttonBackground.on("pointerover", () => {
         this.input.setDefaultCursor("pointer");
      });

      // Revenir au curseur par défaut lorsqu'on quitte le bouton
      buttonBackground.on("pointerout", () => {
         this.input.setDefaultCursor("default");
      });
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
      // Définition de la proportion du vaisseau par rapport à la hauteur de l'écran
      const shipProportion = 0.1;

      // Création du vaisseau joueur
      this.playerShip = this.physics.add
         .sprite(this.scale.width / 2, this.scale.height, "playerShip")
         .setOrigin(0.5, 1);
      const shipScale =
         (this.scale.height * shipProportion) / this.playerShip.height;
      this.playerShip.setScale(shipScale);
      this.playerShip.y = this.scale.height - this.playerShip.displayHeight / 2;
      this.configurePlayerHitbox(); // Configure la hitbox directement

      // Création du boost joueur
      this.createPlayerBoost(shipScale);

      // Création du tir de rocket player
      this.createPlayerRocketAnimation();
   }

   createPlayerBoost(shipScale) {
      // Création du boost joueur
      this.boost = this.add
         .sprite(
            this.playerShip.x,
            this.playerShip.y - this.playerShip.displayHeight,
            "playerBoost"
         )
         .setOrigin(0.5, 0)
         .setVisible(false)
         .setBlendMode(Phaser.BlendModes.ADD)
         .setScale(shipScale);

      // Animation de clignotement pour le boost
      this.boostTween = this.tweens.add({
         targets: this.boost,
         alpha: { from: 0.4, to: 1 },
         duration: 100,
         yoyo: true,
         repeat: -1,
      });
   }

   createPlayerRocketAnimation() {
      // Création de l'animation du tir de rocket à partir d'un atlas
      this.anims.create({
         key: "fireRockets",
         frames: this.anims.generateFrameNames("playerRockets", {
            start: 0,
            end: 15,
            prefix: "rocket_1_",
            zeroPad: 4,
         }),
         frameRate: 10,
         repeat: 0,
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

   playerHit(player, projectile) {
      projectile.destroy(); // Détruire le projectile

      // Jouer l'animation d'explosion et cacher ou détruire le boost
      let explosion = this.add
         .sprite(player.x, player.y, "playerExplosion")
         .play("playerExplosion");
      explosion.on("animationcomplete", () => {
         explosion.destroy();
         this.createRestartButton(); // Créer le bouton de redémarrage après l'animation d'explosion
      });

      player.destroy(); // Détruire le joueur
      this.boost?.setVisible(false); // Cacher le boost si actif
   }

   fireRockets() {
      const rocketOffset = this.playerShip.displayWidth * 0.25;
      const newWidth = 16; // La nouvelle largeur de la hitbox, ajuste selon la taille de ton sprite
      const newHeight = 30; // La nouvelle hauteur de la hitbox
      const offsetX = -2; // Décalage de la hitbox sur l'axe X pour l'aligner avec le sprite
      const offsetY = -15; // Décalage de la hitbox sur l'axe Y

      //* Crée la première roquette à gauche du vaisseau
      let rocketLeft = this.physics.add.sprite(
         this.playerShip.x - rocketOffset,
         this.playerShip.y - this.playerShip.displayHeight / 2,
         "playerRockets"
      );
      rocketLeft.play("fireRockets");

      rocketLeft.setSize(newWidth, newHeight, false);
      rocketLeft.setOffset(offsetX, offsetY);

      //* Crée la deuxième roquette à droite du vaisseau
      let rocketRight = this.physics.add.sprite(
         this.playerShip.x + rocketOffset,
         this.playerShip.y - this.playerShip.displayHeight / 2,
         "playerRockets"
      );
      rocketRight.play("fireRockets");

      rocketRight.setSize(newWidth, newHeight, false); // Ajuste la taille de la hitbox
      rocketRight.setOffset(offsetX, offsetY); // Centre la hitbox si nécessaire

      this.rockets.add(rocketRight);
      this.rockets.add(rocketLeft);
   }

   setupColliders() {
      // Collision entre les roquettes du joueur et les ennemis
      this.physics.add.collider(
         this.rockets,
         this.enemies,
         this.hitEnemy,
         null,
         this
      );

      // Collision entre le vaisseau du joueur et les projectiles ennemis
      this.physics.add.overlap(
         this.playerShip,
         this.enemyProjectiles,
         this.playerHit,
         null,
         this
      );

      // Collision entre le vaisseau du joueur et les ennemis
      this.physics.add.overlap(
         this.playerShip,
         this.enemies,
         this.playerAndEnemyCollide,
         null,
         this
      );
   }

   playerAndEnemyCollide(player, enemy) {
      // Jouer l'animation d'explosion pour le joueur
      let playerExplosion = this.add
         .sprite(player.x, player.y, "playerExplosion")
         .play("playerExplosion");
      playerExplosion.on("animationcomplete", () => {
         playerExplosion.destroy();
         this.createRestartButton(); // Ajoute cette ligne ici
      });

      // Jouer l'animation d'explosion pour l'ennemi
      let enemyExplosion = this.add
         .sprite(enemy.x, enemy.y, "explosion_01")
         .play("explosion_01");
      enemyExplosion.on("animationcomplete", () => enemyExplosion.destroy());

      // Détruire le joueur et l'ennemi
      player.destroy();
      enemy.destroy();
   }

   rocketGroup() {
      // Crée un groupe de roquettes
      this.rockets = this.physics.add.group({
         classType: Phaser.GameObjects.Sprite,
         runChildUpdate: true,
      });
   }

   hitEnemy(rocket, enemy) {
      let offsetX = 0;
      let offsetY = 0;
      // Positionne l'animation d'explosion où l'ennemi a été touché
      let explosion = this.add
         .sprite(enemy.x + offsetX, enemy.y + offsetY, "explosion_01")
         .play("explosion_01");

      // Détruit le sprite de l'explosion une fois l'animation terminée
      explosion.on("animationcomplete", () => explosion.destroy());

      rocket.destroy();

      if (enemy.shootTimer) {
         enemy.shootTimer.remove(false); // Arrête le timer sans appeler le callback final
      }
      enemy.destroy();
   }

   enemyGroup() {
      // Crée un groupe d'ennemis
      this.enemies = this.physics.add.group({
         classType: Phaser.Physics.Arcade.Sprite,
         runChildUpdate: true,
      });
   }

   playerExplosion() {
      this.anims.create({
         key: "playerExplosion",
         frames: this.anims.generateFrameNames("playerExplosion", {
            start: 0,
            end: 31,
            prefix: "expl_10_",
            suffix: "",
            zeroPad: 4,
         }),
         frameRate: 20,
         repeat: 0,
      });
   }

   explosion_01() {
      this.anims.create({
         key: "explosion_01",
         frames: [
            { key: "explosion_01", frame: "expl_01_0000" },
            { key: "explosion_01", frame: "expl_01_0001" },
            { key: "explosion_01", frame: "expl_01_0002" },
            { key: "explosion_01", frame: "expl_01_0003" },
            { key: "explosion_01", frame: "expl_01_0004" },
            { key: "explosion_01", frame: "expl_01_0005" },
            { key: "explosion_01", frame: "expl_01_0006" },
            { key: "explosion_01", frame: "expl_01_0007" },
            { key: "explosion_01", frame: "expl_01_0008" },
            { key: "explosion_01", frame: "expl_01_0009" },
            { key: "explosion_01", frame: "expl_01_0010" },
            { key: "explosion_01", frame: "expl_01_0011" },
            { key: "explosion_01", frame: "expl_01_0012" },
            { key: "explosion_01", frame: "expl_01_0013" },
            { key: "explosion_01", frame: "expl_01_0014" },
            { key: "explosion_01", frame: "expl_01_0015" },
            { key: "explosion_01", frame: "expl_01_0016" },
            { key: "explosion_01", frame: "expl_01_0017" },
            { key: "explosion_01", frame: "expl_01_0018" },
            { key: "explosion_01", frame: "expl_01_0019" },
            { key: "explosion_01", frame: "expl_01_0020" },
            { key: "explosion_01", frame: "expl_01_0021" },
            { key: "explosion_01", frame: "expl_01_0022" },
            { key: "explosion_01", frame: "expl_01_0023" },
         ],
         frameRate: 20,
         repeat: 0,
      });
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
      const frigateProportion = 0.1;

      // Crée l'ennemi frigate hors de l'écran par le haut
      this.redFrigateEnemy = this.physics.add
         .sprite(this.scale.width / 2, -50, "redFrigate")
         .setOrigin(0.5, 0);
      const redFrigateScale =
         (this.scale.height * frigateProportion) / this.redFrigateEnemy.height;
      this.redFrigateEnemy.setScale(redFrigateScale);

      // Initialise les propriétés originales après la création et l'application de la première échelle
      this.redFrigateEnemy.originalWidth = this.redFrigateEnemy.width;
      this.redFrigateEnemy.originalHeight = this.redFrigateEnemy.height;

      // Redimensionnement après avoir défini les dimensions originales
      const initialWidth = 80; // La largeur désirée
      const newScale =
         (initialWidth / this.redFrigateEnemy.originalWidth) *
         this.redFrigateEnemy.scaleX;
      this.redFrigateEnemy.setScale(newScale);

      this.enemies.add(this.redFrigateEnemy);

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

      // Rend les boosts invisibles dès le départ
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

      // Applique une chorégraphie aléatoire
      const choregraphy = this.getRandomChoregraphy(this.redFrigateEnemy);
      choregraphy.forEach((tween) => {
         this.tweens.add(tween);
      });
   }

   createFrigateHitbox(redFrigateScale) {
      //* Définie la taille de la hitbox en fonction de l'échelle de dimension du frigate
      const hitboxWidth = this.redFrigateEnemy.displayWidth * 1.8;
      const hitboxHeight = this.redFrigateEnemy.displayHeight * 0.4;
      const offsetX = (this.redFrigateEnemy.width - hitboxWidth) / 2;
      const offsetY = (this.redFrigateEnemy.height - hitboxHeight) / 2;

      this.redFrigateEnemy.body.setSize(hitboxWidth, hitboxHeight);
      this.redFrigateEnemy.body.setOffset(offsetX, offsetY);
   }

   redFrigateShot() {
      // s'assurer que this.redFrigateEnemy existe
      if (!this.redFrigateEnemy || !this.redFrigateEnemy.active) return;

      const bulletSpeed = 200;
      const bulletScale = 0.5;

      // Création et ajout des projectiles dans le groupe avec les propriétés physiques
      let bulletLeft = this.enemyProjectiles.create(
         this.redFrigateEnemy.x - 7,
         this.redFrigateEnemy.y + 60,
         "redFrigateBullet"
      );
      bulletLeft.setVelocityY(bulletSpeed);
      bulletLeft.setScale(bulletScale);

      let bulletRight = this.enemyProjectiles.create(
         this.redFrigateEnemy.x + 7,
         this.redFrigateEnemy.y + 60,
         "redFrigateBullet"
      );
      bulletRight.setVelocityY(bulletSpeed);
      bulletRight.setScale(bulletScale);
   }

   enemyProjectiles() {
      this.enemyProjectiles = this.physics.add.group({
         defaultKey: "redFrigateBullet",
         maxSize: 10, // ou un autre nombre qui convient à votre jeu
      });
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
   getRandomChoregraphy(redFrigateEnemy) {
      const choregraphies = [
         this.getChoregraphy1(redFrigateEnemy),
         this.getChoregraphy2(redFrigateEnemy),
         // Ajoute autant de chorégraphies que tu veux ici
      ];

      // Choisis une chorégraphie aléatoire
      return choregraphies[Phaser.Math.Between(0, choregraphies.length - 1)];
   }

   // Fonction pour définir une chorégraphie
   getChoregraphy1(redFrigateEnemy) {
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

   getChoregraphy2(redFrigateEnemy) {
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
               // Ici, définir ce que peut faire l'ennemi une fois qu'il s'est arrêté
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

      const shipSpeed = 5;
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
      // Utilise getChildren() pour accéder aux sprites dans le groupe
      this.rockets.getChildren().forEach((rocket, index) => {
         rocket.y -= 10;
         if (rocket.y < 0) {
            this.rockets.remove(rocket, true, true); // Cela va détruire le sprite et le retirer du groupe
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
         this.nebulaInterval = Phaser.Math.Between(70000, 200000);
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
