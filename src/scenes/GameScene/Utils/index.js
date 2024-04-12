import { hitEnemy } from "../Enemies/EnemyActions";
import { playerHit } from "../Player/PlayerActions";

export const setupColliders = (scene) => {
   // Collision entre les roquettes du joueur et les ennemis
   scene.physics.add.collider(
      scene.rockets,
      scene.enemies,
      (rocket, enemy) => hitEnemy(scene, rocket, enemy),
      null,
      scene
   );

   // Collision entre le vaisseau du joueur et les projectiles ennemis
   scene.physics.add.overlap(
      scene.playerShip,
      scene.enemyProjectiles,
      (player, projectile) => playerHit(scene, projectile, player),
      null,
      scene
   );

   // Collision entre le vaisseau du joueur et les ennemis
   scene.physics.add.overlap(
      scene.playerShip,
      scene.enemies,
      (player, enemy) => playerAndEnemyCollide(scene, player, enemy),
      null,
      scene
   );
};

export const playerAndEnemyCollide = (scene, player, enemy) => {
   // Jouer l'animation d'explosion pour le joueur
   let playerExplosion = scene.add
      .sprite(player.x, player.y, "playerExplosion")
      .play("playerExplosion");
   playerExplosion.on("animationcomplete", () => {
      playerExplosion.destroy();
      scene.createRestartButton(); // Ajoute cette ligne ici
   });

   // Jouer l'animation d'explosion pour l'ennemi
   let enemyExplosion = scene.add
      .sprite(enemy.x, enemy.y, "explosion_01")
      .play("explosion_01");
   enemyExplosion.on("animationcomplete", () => enemyExplosion.destroy());

   // Détruire le joueur et l'ennemi
   player.destroy();
   enemy.destroy();
};
