export const setupColliders = (scene) => {
   // Collision entre les roquettes du joueur et les ennemis
   scene.physics.add.collider(
      scene.rockets,
      scene.enemies,
      scene.hitEnemy,
      null,
      scene
   );

   // Collision entre le vaisseau du joueur et les projectiles ennemis
   scene.physics.add.overlap(
      scene.playerShip,
      scene.enemyProjectiles,
      scene.playerHit,
      null,
      scene
   );

   // Collision entre le vaisseau du joueur et les ennemis
   scene.physics.add.overlap(
      scene.playerShip,
      scene.enemies,
      scene.playerAndEnemyCollide,
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
