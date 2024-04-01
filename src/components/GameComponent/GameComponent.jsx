import Phaser from "phaser";
import { useEffect } from "react";
import phaserConfig from "../../assets/config/phaserConfig";
// import GameScene from "../../scenes/GameScene/GameScene";

export default function GameComponent() {
   useEffect(() => {
      // Initialiser le jeu Phaser quand le composant est monté
      const game = new Phaser.Game(phaserConfig);

      // Empêcher le menu contextuel sur le canvas du jeu
      const gameCanvas = document.getElementById("phaser-game");
      if (gameCanvas) {
         gameCanvas.addEventListener("contextmenu", (event) => {
            event.preventDefault();
         });
      }

      // Faire le nettoyage quand le composant sera démonté
      return () => {
         game.destroy(true);
         if (gameCanvas) {
            // Remove the event listener
            gameCanvas.removeEventListener("contextmenu", (event) => {
               event.preventDefault();
            });
         }
      };
   }, []);

   return <div id="phaser-game" />;
}
