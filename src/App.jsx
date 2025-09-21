import { useState } from "react";
import GameMenu from "./GameMenu";
import GameCanvas from "./GameCanvas";

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [vehicle, setVehicle] = useState(null);

  const handleStartGame = (selectedVehicle) => {
    setVehicle(selectedVehicle);
    setGameStarted(true);
  };

  return (
    <>
      {!gameStarted ? (
        // MUST be `onStartGame={handleStartGame}`
        <GameMenu onStartGame={handleStartGame} />
      ) : (
        <GameCanvas vehicle={vehicle} />
      )}
    </>
  );
}

export default App;
