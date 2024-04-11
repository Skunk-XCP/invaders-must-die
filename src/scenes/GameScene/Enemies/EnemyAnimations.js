import Phaser from "phaser";

//créer explosion_01
export const createExplosion_01 = (scene) => {
   scene.anims.create({
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
};

export const createFrigateBoosts = (scene) => {
   if (!scene.redFrigateEnemy) {
      console.error("redFrigateEnemy is not defined.");
      return;
   }

   const boostOffsetX = scene.redFrigateEnemy.displayWidth * 0.25;
   const boostOffsetY = scene.redFrigateEnemy.displayHeight * 0.5;
   const boostScale = 0.2;

   // Création et positionnement des propulseurs
   scene.redFrigateEnemy.leftBoost = scene.add
      .sprite(
         scene.redFrigateEnemy.x - boostOffsetX,
         scene.redFrigateEnemy.y + boostOffsetY,
         "redFrigateEnemyBoost"
      )
      .setOrigin(-0.4, 3)
      .setVisible(true)
      .setScale(boostScale);

   scene.redFrigateEnemy.rightBoost = scene.add
      .sprite(
         scene.redFrigateEnemy.x + boostOffsetX,
         scene.redFrigateEnemy.y + boostOffsetY,
         "redFrigateEnemyBoost"
      )
      .setOrigin(1.4, 3)
      .setVisible(true)
      .setScale(boostScale);

   // Ajout d'un effet de clignotement aux propulseurs
   scene.tweens.add({
      targets: [
         scene.redFrigateEnemy.leftBoost,
         scene.redFrigateEnemy.rightBoost,
      ],
      alpha: { from: 0.4, to: 1 },
      duration: 100,
      yoyo: true,
      repeat: -1,
   });
};

// créer applyRandomChoreography
export const applyRandomChoreography = (scene) => {
   if (scene.redFrigateEnemy) {
      const choreography = getRandomChoregraphy(scene.redFrigateEnemy);
      choreography.forEach((tween) => {
         scene.tweens.add(tween);
      });
   } else {
      console.error("No redFrigateEnemy to apply choreography to.");
   }
};

// getRandomChoregraphy
export const getRandomChoregraphy = (redFrigateEnemy) => {
   const choregraphies = [
      getChoregraphy1(redFrigateEnemy),
      getChoregraphy2(redFrigateEnemy),
   ];

   // Choisis une chorégraphie aléatoire
   return choregraphies[Phaser.Math.Between(0, choregraphies.length - 1)];
};

export const getChoregraphy1 = (scene, redFrigateEnemy) => {
   return [
      {
         targets: redFrigateEnemy,
         x: scene.scale.width * 0.75,
         ease: "Sine.easeInOut",
         duration: 2000,
      },
      {
         targets: redFrigateEnemy,
         y: scene.scale.height * 0.5,
         ease: "Sine.easeInOut",
         duration: 2000,
      },
   ];
};

export const getChoregraphy2 = (scene, redFrigateEnemy) => {
   const stopX = scene.scale.width / 2;
   const stopY = scene.scale.height / 2;

   return [
      {
         targets: redFrigateEnemy,
         x: stopX,
         y: stopY,
         ease: "Sine.easeInOut",
         duration: 2000,
         onComplete: () => {},
      },
   ];
};
