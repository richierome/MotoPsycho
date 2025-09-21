import { useState, useRef } from "react";

function GameMenu({ onStartGame }) {
  const [menuStage, setMenuStage] = useState("start"); // "start" or "select"
  const audioRef = useRef(null);
  const gainNodeRef = useRef(null);
  const audioCtxRef = useRef(null);

  const handleStartClick = () => {
    setMenuStage("select");

    if (!audioRef.current) {
      const audio = new Audio("/assests/theTake.mp3");
      audio.loop = true;
      audioRef.current = audio;

      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = audioCtx;

      const track = audioCtx.createMediaElementSource(audio);
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = 0.2; // start quiet
      gainNodeRef.current = gainNode;

      track.connect(gainNode).connect(audioCtx.destination);
      audio.play().catch(() => console.log("User interaction required to start music."));
    }
  };

  const handleSelection = (vehicle) => {
    // Fade in music
    if (gainNodeRef.current) {
      let volume = gainNodeRef.current.gain.value;
      const fadeIn = setInterval(() => {
        if (volume < 1) {
          volume += 0.02;
          gainNodeRef.current.gain.value = Math.min(volume, 1);
        } else clearInterval(fadeIn);
      }, 50);
    }
    onStartGame(vehicle);
  };

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    width: "100vw",
    overflow: "hidden",
    position: "relative",
    color: "#fff",
    textAlign: "center",
    touchAction: "none",
  };

  const buttonStyle = (bgColor) => ({
    fontSize: "5vw",
    padding: "2vh 5vw",
    border: "none",
    borderRadius: "2vw",
    background: bgColor,
    color: "#fff",
    cursor: "pointer",
  });

  const backgroundStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: -1,
  };

  if (menuStage === "start") {
    return (
      <div style={containerStyle}>
        <img src="/assests/cover.png" alt="Game Cover" style={backgroundStyle} />
        <h1 style={{ fontSize: "10vw", marginBottom: "5vh" }}>MotoPsycho</h1>
        <button onClick={handleStartClick} style={buttonStyle("#ff0000")}>
          Start Game
        </button>
      </div>
    );
  }

  if (menuStage === "select") {
    return (
      <div style={containerStyle}>
        <img src="/assests/cover.png" alt="Game Cover" style={backgroundStyle} />
        <h2 style={{ fontSize: "8vw", marginBottom: "5vh" }}>Choose Your Vehicle</h2>
        <div style={{ display: "flex", gap: "5vw" }}>
          <button onClick={() => handleSelection("bike")} style={buttonStyle("#00aaff")}>
            Bike
          </button>
          <button onClick={() => handleSelection("tanker")} style={buttonStyle("#ffaa00")}>
            Tanker
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default GameMenu;
