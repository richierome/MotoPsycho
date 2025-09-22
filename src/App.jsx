import { useState } from "react";
import GameMenu from "./GameMenu";
import GameCanvas from "./GameCanvas";

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const handleStartGame = (vehicle) => {
    setSelectedVehicle(vehicle);
    setGameStarted(true);
  };

  return (
    <div style={{ height: "100vh", width: "100vw", overflow: "hidden" }}>
      {!gameStarted ? (
        <GameMenu onStartGame={handleStartGame} />
      ) : (
        <GameCanvas vehicle={selectedVehicle} />
      )}
    </div>
  );
}

export default App;
