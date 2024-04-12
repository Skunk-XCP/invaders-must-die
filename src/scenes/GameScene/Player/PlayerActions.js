import Phaser from "phaser";

export const createPlayer = (scene) => {
   // Définition de la proportion du vaisseau par rapport à la hauteur de l'écran
   const shipProportion = 0.1;

   // Création du vaisseau joueur
   const playerShip = scene.physics.add
      .sprite(
         scene.scale.width / 2,
         scene.scale.height * (1 - shipProportion),
         "playerShip"
      )
      .setOrigin(0.5, 1);

   // Calcul et application de l'échelle du vaisseau
   const shipScale = (scene.scale.height * shipProportion) / playerShip.height;
   playerShip.setScale(shipScale);
   playerShip.setDepth(10);

   // Stockage du vaisseau dans la scène pour un accès ultérieur
   scene.playerShip = playerShip;
   configurePlayerHitbox(scene, playerShip);
};

export const configurePlayerHitbox = (scene, playerShip) => {
   //* Définie taille hitbox basée sur l'échelle de dimension du ship
   const hitboxWidth = scene.playerShip.displayWidth * 0.3;
   const hitboxHeight = scene.playerShip.displayHeight * 0.3;
   const offsetX = (scene.playerShip.width - hitboxWidth) / 2;
   const offsetY = (scene.playerShip.height - hitboxHeight) / 2;

   scene.playerShip.body.setSize(hitboxWidth, hitboxHeight);
   scene.playerShip.body.setOffset(offsetX, offsetY);
};

export const playerHit = (scene, projectile, player) => {
   projectile.destroy(); // Détruire le projectile

   // Jouer l'animation d'explosion et cacher ou détruire le boost
   let explosion = scene.add
      .sprite(player.x, player.y, "playerExplosion")
      .play("playerExplosion");

   explosion.setScale(1.5);

   explosion.on("animationcomplete", () => {
      explosion.destroy();
      scene.createRestartButton(); // Créer le bouton de redémarrage après l'animation d'explosion
   });

   player.destroy(); // Détruire le joueur
   scene.boost?.setVisible(false); // Cacher le boost si actif
};

export const fireRockets = (scene) => {
   const rocketOffset = scene.playerShip.displayWidth * 0.25;
   const newWidth = 16;
   const newHeight = 30;
   const offsetX = -2;
   const offsetY = -15;

   let rocketLeft = scene.physics.add
      .sprite(
         scene.playerShip.x - rocketOffset,
         scene.playerShip.y - scene.playerShip.displayHeight / 2,
         "playerRockets"
      )
      .play("fireRockets");
   rocketLeft.setSize(newWidth, newHeight, false);
   rocketLeft.setOffset(offsetX, offsetY);

   let rocketRight = scene.physics.add
      .sprite(
         scene.playerShip.x + rocketOffset,
         scene.playerShip.y - scene.playerShip.displayHeight / 2,
         "playerRockets"
      )
      .play("fireRockets");
   rocketRight.setSize(newWidth, newHeight, false);
   rocketRight.setOffset(offsetX, offsetY);

   if (!scene.rockets) {
      scene.rockets = scene.physics.add.group({
         classType: Phaser.GameObjects.Sprite,
         runChildUpdate: true,
      });
   }

   scene.rockets.add(rocketRight);
   scene.rockets.add(rocketLeft);
};

export const handlePlayerMovement = (scene) => {
   if (!scene.playerShip || !scene.playerShip.body) return;

   const shipSpeed = 5;
   const shipWidthOffset = scene.playerShip.displayWidth / 2;
   const shipTopOffset = scene.playerShip.displayHeight;
   const shipBottomLimit =
      scene.scale.height - scene.playerShip.displayHeight / 4;

   // Horizontal movement
   if (scene.WASD.left.isDown) {
      scene.playerShip.x = Phaser.Math.Clamp(
         scene.playerShip.x - shipSpeed,
         shipWidthOffset,
         scene.scale.width - shipWidthOffset
      );
   } else if (scene.WASD.right.isDown) {
      scene.playerShip.x = Phaser.Math.Clamp(
         scene.playerShip.x + shipSpeed,
         shipWidthOffset,
         scene.scale.width - shipWidthOffset
      );
   }

   // Vertical movement
   if (scene.WASD.up.isDown) {
      scene.playerShip.y = Phaser.Math.Clamp(
         scene.playerShip.y - shipSpeed,
         shipTopOffset,
         shipBottomLimit
      );
      if (scene.boost) {
         scene.boost.setVisible(true);
      }
   } else if (scene.WASD.down.isDown) {
      scene.playerShip.y = Phaser.Math.Clamp(
         scene.playerShip.y + shipSpeed,
         shipTopOffset,
         shipBottomLimit
      );
      if (scene.boost) {
         scene.boost.setVisible(false);
      }
   } else {
      if (scene.boost) {
         scene.boost.setVisible(false);
      }
   }
};

export const handleRocketFiring = (scene, delta) => {
   // if (!scene.playerShip || !scene.playerShip.body || !scene.WASD) return;
   if (!scene.playerShip || !scene.playerShip.body) return;

   // Ajoutez le delta au temps écoulé depuis le dernier tir
   scene.timeSinceLastRocket += delta;

   // Vérifiez si le joueur essaie de tirer et si le temps écoulé depuis le dernier tir est suffisant
   // if (
   //    scene.WASD.space.isDown &&
   //    scene.timeSinceLastRocket > scene.rocketFireRate
   // ) {
   //    fireRockets(scene);
   //    scene.timeSinceLastRocket = 0; // Réinitialiser le temps depuis le dernier tir
   // }
   if (scene.isFiring && scene.timeSinceLastRocket > scene.rocketFireRate) {
      fireRockets(scene);
      scene.timeSinceLastRocket = 0; // Réinitialiser le temps depuis le dernier tir
   }
};

export const updateRocketPositions = (scene) => {
   // Utilise getChildren() pour accéder aux sprites dans le groupe
   scene.rockets.getChildren().forEach((rocket, index) => {
      rocket.y -= 10;
      if (rocket.y < 0) {
         scene.rockets.remove(rocket, true, true); // Cela va détruire le sprite et le retirer du groupe
      }
   });
};

export const updateBoostPosition = (scene) => {
   if (scene.boost && scene.playerShip) {
      scene.boost.x = scene.playerShip.x;
      scene.boost.y = scene.playerShip.y - scene.playerShip.displayHeight / 2; // Ajuster cette valeur si nécessaire
   }
};

export const rocketGroup = (scene) => {
   // Crée un groupe de roquettes
   scene.rockets = scene.physics.add.group({
      classType: Phaser.GameObjects.Sprite,
      runChildUpdate: true,
   });
};
