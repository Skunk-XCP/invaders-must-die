import Phaser from "phaser";

// export const spawnRedFrigateEnemy = (scene) => {
//    // scene.createRedFrigateSprite();
//    // scene.enemies.add(scene.redFrigateEnemy);
//    // scene.createFrigateBoosts();
//    // scene.startFrigateShooting();
//    // scene.createFrigateHitbox();
//    // scene.hideFrigateBoostsAfterDelay();
//    // scene.applyRandomChoreography();
// };

export const startFrigateShooting = (scene) => {
   scene.redFrigateEnemy.shootTimer = scene.time.addEvent({
      delay: 1500,
      callback: scene.redFrigateShot,
      callbackScope: scene,
      loop: true,
   });
};

export const createRedFrigateSprite = (scene) => {
   const frigateProportion = 0.1;
   scene.redFrigateEnemy = scene.physics.add
      .sprite(scene.scale.width / 2, -50, "redFrigate")
      .setOrigin(0.5, 0);

   const redFrigateScale =
      (scene.scale.height * frigateProportion) / scene.redFrigateEnemy.height;
   scene.redFrigateEnemy.setScale(redFrigateScale);
   scene.redFrigateEnemy.originalWidth = scene.redFrigateEnemy.width;
   scene.redFrigateEnemy.originalHeight = scene.redFrigateEnemy.height;

   const initialWidth = 80;
   const newScale =
      (initialWidth / scene.redFrigateEnemy.originalWidth) *
      scene.redFrigateEnemy.scaleX;
   scene.redFrigateEnemy.setScale(newScale);

   scene.enemies.add(scene.redFrigateEnemy); // Ajout à la collection des ennemis
};

export const hideFrigateBoostsAfterDelay = (scene) => {
   scene.time.delayedCall(1500, () => {
      if (scene.redFrigateEnemy.leftBoost && scene.redFrigateEnemy.rightBoost) {
         scene.redFrigateEnemy.leftBoost.setVisible(false);
         scene.redFrigateEnemy.rightBoost.setVisible(false);
      }
   });
};

export const createFrigateHitbox = (scene) => {
   //* Définie la taille de la hitbox en fonction de l'échelle de dimension du frigate
   const hitboxWidth = scene.redFrigateEnemy.displayWidth * 1.8;
   const hitboxHeight = scene.redFrigateEnemy.displayHeight * 0.4;
   const offsetX = (scene.redFrigateEnemy.width - hitboxWidth) / 2;
   const offsetY = (scene.redFrigateEnemy.height - hitboxHeight) / 2;

   scene.redFrigateEnemy.body.setSize(hitboxWidth, hitboxHeight);
   scene.redFrigateEnemy.body.setOffset(offsetX, offsetY);
};

export const redFrigateShot = (scene) => {
   // s'assurer que this.redFrigateEnemy existe
   if (!scene.redFrigateEnemy || !scene.redFrigateEnemy.active) return;

   const bulletSpeed = 200;
   const bulletScale = 0.5;

   // Création et ajout des projectiles dans le groupe avec les propriétés physiques
   let bulletLeft = scene.enemyProjectiles.create(
      scene.redFrigateEnemy.x - 7,
      scene.redFrigateEnemy.y + 60,
      "redFrigateBullet"
   );
   bulletLeft.setVelocityY(bulletSpeed);
   bulletLeft.setScale(bulletScale);

   let bulletRight = scene.enemyProjectiles.create(
      scene.redFrigateEnemy.x + 7,
      scene.redFrigateEnemy.y + 60,
      "redFrigateBullet"
   );
   bulletRight.setVelocityY(bulletSpeed);
   bulletRight.setScale(bulletScale);
};

export const enemyProjectiles = (scene) => {
   scene.enemyProjectiles = scene.physics.add.group({
      defaultKey: "redFrigateBullet",
      maxSize: 10,
   });
};

export const hitEnemy = (scene, rocket, enemy) => {
   let offsetX = 0;
   let offsetY = 0;
   // Positionne l'animation d'explosion où l'ennemi a été touché
   let explosion = scene.add
      .sprite(enemy.x + offsetX, enemy.y + offsetY, "explosion_01")
      .play("explosion_01");

   // Détruit le sprite de l'explosion une fois l'animation terminée
   explosion.on("animationcomplete", () => explosion.destroy());

   rocket.destroy();

   if (enemy.shootTimer) {
      enemy.shootTimer.remove(false); // Arrête le timer sans appeler le callback final
   }
   enemy.destroy();
};

export const enemyGroup = (scene) => {
   // Crée un groupe d'ennemis
   scene.enemies = scene.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      runChildUpdate: true,
   });
};

export const checkEnemyBounds = (scene) => {
   if (
      scene.redFrigateEnemy &&
      scene.redFrigateEnemy.y >
         scene.scale.height + scene.redFrigateEnemy.displayHeight / 2
   ) {
      scene.redFrigateEnemy.destroy();
      scene.redFrigateEnemy = null;
   }
};
