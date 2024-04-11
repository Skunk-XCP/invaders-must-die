import Phaser from "phaser";
import {
   createPlayer,
   createPlayerBoost,
   createPlayerRocketAnimation,
   handlePlayerMovement,
   handleRocketFiring,
   playerExplosion,
   rocketGroup,
   setupInput,
   updateBoostPosition,
   updateRocketPositions,
} from "./Player";

import {
   applyRandomChoreography,
   checkEnemyBounds,
   createFrigateBoosts,
   createFrigateHitbox,
   createRedFrigateSprite,
   enemyGroup,
   hideFrigateBoostsAfterDelay,
   startFrigateShooting,
} from "./Enemies";

import { setupColliders } from "./Utils";

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
      createPlayer(this);
      setupInput(this);
      rocketGroup(this);
      createPlayerRocketAnimation(this);
      playerExplosion(this);
      createPlayerBoost(this);
      handlePlayerMovement(this);
      this.enemies = this.physics.add.group();
      createRedFrigateSprite(this);
      createFrigateBoosts(this);
      createFrigateHitbox(this);
      startFrigateShooting(this);
      hideFrigateBoostsAfterDelay(this);
      applyRandomChoreography(this);
      setupColliders(this);
      // playerAndEnemyCollide(this);

      this.enemyProjectiles = this.physics.add.group();
      enemyGroup(this);
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

   update(time, delta) {
      handlePlayerMovement(this);
      handleRocketFiring(this, delta);
      updateRocketPositions(this);
      this.handleBackgroundScroll();
      this.handleNebulaSpawn(time);
      checkEnemyBounds(this);
      updateBoostPosition(this);
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
}
