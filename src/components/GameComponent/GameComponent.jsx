import Phaser from "phaser";
import { useEffect } from "react";
import phaserConfig from "../../assets/config/phaserConfig";
import s from "./style.module.css";

export default function GameComponent() {
   useEffect(() => {
      // Initialiser le jeu Phaser quand le composant est monté
      const game = new Phaser.Game(phaserConfig);

      // Faire le nettoyage quand le composant sera démonté
      return () => {
         game.destroy(true);
      };
   }, []);

   return <div className={s.phaser_game} />;
}
