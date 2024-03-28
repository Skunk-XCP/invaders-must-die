import Phaser from "phaser";
import { useEffect } from "react";
import phaserConfig from "../../assets/config/phaserConfig";
// import GameScene from "../../scenes/GameScene/GameScene";

export default function GameComponent() {
   useEffect(() => {
      // Initialiser le jeu Phaser quand le composant est monté
      const game = new Phaser.Game(phaserConfig);

      // Faire le nettoyage quand le composant sera démonté
      return () => {
         game.destroy(true);
      };
   }, []);

   return <div id="phaser-game" />;
}
