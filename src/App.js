import { Route, Routes } from "react-router-dom";
import GameComponent from "./components/GameComponent/GameComponent";
// import { InGame } from "./scenes/HomePage/HomePage";

export function App() {
   return (
      <>
         <Routes>
            {/* Main Menu */}
            <Route path="/" element={<GameComponent />} />
            {/* Score */}
         </Routes>
      </>
   );
}
