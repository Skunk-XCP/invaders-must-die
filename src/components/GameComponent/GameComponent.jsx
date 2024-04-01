import Phaser from "phaser";
import { useEffect } from "react";
import phaserConfig from "../../assets/config/phaserConfig";
// import GameScene from "../../scenes/GameScene/GameScene";

export default function GameComponent() {
   useEffect(() => {
      // Initialiser le jeu Phaser quand le composant est monté
      const game = new Phaser.Game(phaserConfig);

      // Empêche le menu contextuel sur le canvas du jeu
      const handleRightClick = (event) => {
         event.preventDefault();
      };

      document.addEventListener("contextmenu", handleRightClick);

      // Faire le nettoyage quand le composant sera démonté
      return () => {
         game.destroy(true);
         document.removeEventListener("contextmenu", handleRightClick);
      };
   }, []);

   return <div id="phaser-game" />;
}
