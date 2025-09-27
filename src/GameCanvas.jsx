// src/GameCanvas.jsx
import React, { useEffect, useState } from "react";
import truck1Img from "./assets/truck1.png"; 
import cityImg from "./assets/city.jpg";
import coolImg from "./assets/cool.png";
import fireImg from "./assets/fire.png";

const GameCanvas = () => {
  // Tanker dimensions
  const TRUCK_WIDTH = 300;
  const TRUCK_HEIGHT = 300;

  const [playerX, setPlayerX] = useState(100);
  const [playerY, setPlayerY] = useState(150);
  const [speed, setSpeed] = useState(20);
  const [obstacles, setObstacles] = useState([]);
  const [bullets, setBullets] = useState([]);
  const [bgX, setBgX] = useState(0);
  const [distance, setDistance] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [deliveryMade, setDeliveryMade] = useState(false);

  // Gas station
  const GAS_STATION_WIDTH = 80;
  const GAS_STATION_HEIGHT = 100;
  const GAS_Y = 350 - GAS_STATION_HEIGHT; 
  const GAS_ENTRY_SPEED = 1; 
  const ROUTE_LENGTH = 15000;
  const [gasStationX, setGasStationX] = useState(800);
  const GAS_APPEAR_DISTANCE = 10000;

  // Detect mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => setIsMobile(window.innerWidth <= 768), []);

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowUp") setPlayerY((y) => Math.max(y - 20, 0));
      if (e.key === "ArrowDown") setPlayerY((y) => Math.min(y + 20, 380));
      if (e.key === "ArrowRight") setPlayerX((x) => x + 20);
      if (e.key === "ArrowLeft") setPlayerX((x) => Math.max(x - 20, 0));
      if (e.key === " ") {
        setBullets((prev) => [
          ...prev,
          { id: Date.now(), x: playerX + TRUCK_WIDTH / 2, y: playerY + TRUCK_HEIGHT / 2, width: 8, height: 4 },
        ]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playerX, playerY]);

  // Obstacles spawn
  useEffect(() => {
    if (gameOver || deliveryMade) return;

    const interval = setInterval(() => {
      // Random Y between 100 and 250
      const minY = 100;
      const maxY = 250;
      const randomY = Math.random() * (maxY - minY) + minY;

      // Randomly choose obstacle type
      const obstacleType = Math.random() < 0.5 ? "cool" : "fire";

      // Set size based on type
      const width = obstacleType === "cool" ? 500 : 300;
      const height = obstacleType === "cool" ? 400 : 200;

      setObstacles((prev) => [
        ...prev,
        {
          id: Date.now(),
          x: 800,
          y: randomY,
          width,
          height,
          speed: Math.random() * 5 + 2,
          type: obstacleType,
          image: obstacleType === "cool" ? coolImg : fireImg, 
        },
      ]);
    }, 2500);

    return () => clearInterval(interval);
  }, [gameOver, deliveryMade]);

  // Game loop
  useEffect(() => {
    if (gameOver || deliveryMade) return;

    const loop = setInterval(() => {
      setBgX((x) => (x - speed) % 800);
      setDistance((d) => d + speed);

      // Move obstacles
      setObstacles((prev) =>
        prev
          .map((o) => ({ ...o, x: o.x - (speed - o.speed) }))
          .filter((o) => o.x + o.width > 0)
      );

      // Move bullets
      setBullets((prev) =>
        prev
          .map((b) => ({ ...b, x: b.x + 15 }))
          .filter((b) => b.x < 900)
      );

      // Bullet collision with obstacles
      setObstacles((prevObs) =>
        prevObs.filter((obs) => {
          const hit = bullets.some(
            (b) =>
              b.x < obs.x + obs.width &&
              b.x + b.width > obs.x &&
              b.y < obs.y + obs.height &&
              b.y + b.height > obs.y
          );
          return !hit;
        })
      );

      // Gas station docking
      if (distance >= GAS_APPEAR_DISTANCE && !deliveryMade) {
        setGasStationX((x) => (x > 50 ? x - GAS_ENTRY_SPEED : x));

        const docking =
          playerX < gasStationX + GAS_STATION_WIDTH &&
          playerX + TRUCK_WIDTH > gasStationX &&
          playerY < GAS_Y + GAS_STATION_HEIGHT &&
          playerY + TRUCK_HEIGHT > GAS_Y;

        if (docking) setDeliveryMade(true);
      }
    }, 30);

    return () => clearInterval(loop);
  }, [speed, bullets, gameOver, distance, gasStationX, deliveryMade, playerX, playerY, GAS_Y]);

  // Mobile controls
  const mobileButtonCommon = {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.3)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "2rem",
    color: "#000",
    userSelect: "none",
    zIndex: 1000,
  };

  const resetGame = () => {
    setPlayerX(100);
    setPlayerY(150);
    setSpeed(20);
    setObstacles([]);
    setBullets([]);
    setBgX(0);
    setDistance(0);
    setGameOver(false);
    setDeliveryMade(false);
    setGasStationX(800);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#000" }}>
      <svg width={800} height={400}>
        {/* Background */}
        <image href={cityImg} x={bgX} y={0} width={800} height={400} preserveAspectRatio="none" />
        <image href={cityImg} x={bgX + 800} y={0} width={800} height={400} preserveAspectRatio="none" />

        {/* Tanker */}
        <image href={truck1Img} x={playerX} y={playerY} width={TRUCK_WIDTH} height={TRUCK_HEIGHT} />

        {/* Obstacles */}
        {obstacles.map((o) => (
          <image key={o.id} href={o.image} x={o.x} y={o.y} width={o.width} height={o.height} preserveAspectRatio="xMidYMid meet" />
        ))}

        {/* Bullets */}
        {bullets.map((b) => (
          <rect key={b.id} x={b.x} y={b.y} width={b.width} height={b.height} fill="yellow" />
        ))}

        {/* Gas Station */}
        {distance >= GAS_APPEAR_DISTANCE && !deliveryMade && (
          <>
            <rect x={gasStationX} y={GAS_Y} width={GAS_STATION_WIDTH} height={GAS_STATION_HEIGHT} fill="green" />
            <text x={gasStationX + 10} y={GAS_Y + 50} fontSize={14} fill="white">Gas</text>
          </>
        )}

        {/* HUD */}
        <text x={10} y={20} fontSize={16} fill="#32dd18ff">Speed: {speed}</text>
        <text x={10} y={40} fontSize={16} fill="#32dd18ff">Distance: {distance} / {ROUTE_LENGTH}</text>

        {gameOver && !deliveryMade && <text x={350} y={200} fontSize={28} fill="red">Game Over</text>}
        {deliveryMade && <text x={350} y={200} fontSize={28} fill="green">Delivery Made!</text>}
      </svg>

      {/* Play Again Button */}
      {(gameOver || deliveryMade) && (
        <div onClick={resetGame} style={{ position: "absolute", top: "40%", left: "49%", transform: "translate(-50%, -50%)", padding: "20px 40px", background: "rgba(0,0,0,0.7)", color: "#fff", fontSize: "1.5rem", borderRadius: "10px", cursor: "pointer", zIndex: 1000, textAlign: "center" }}>
          Play Again
        </div>
      )}

      {/* Mobile Controls */}
      {isMobile && (
        <>
          <div onTouchStart={() => setPlayerY((y) => Math.max(y - 20, 0))} style={{ ...mobileButtonCommon, bottom: 140, left: 60 }}>▲</div>
          <div onTouchStart={() => setPlayerY((y) => Math.min(y + 20, 380))} style={{ ...mobileButtonCommon, bottom: 20, left: 60 }}>▼</div>
          <div onTouchStart={() => setPlayerX((x) => Math.max(x - 20, 0))} style={{ ...mobileButtonCommon, bottom: 80, left: 0 }}>◀︎</div>
          <div onTouchStart={() => setPlayerX((x) => x + 20)} style={{ ...mobileButtonCommon, bottom: 80, left: 120 }}>▶︎</div>
          <div onTouchStart={() => setBullets((prev) => [...prev, { id: Date.now(), x: playerX + TRUCK_WIDTH / 2, y: playerY + TRUCK_HEIGHT / 2, width: 8, height: 4 }])} style={{ ...mobileButtonCommon, bottom: 80, right: 20 }}>◉</div>
        </>
      )}
    </div>
  );
};

export default GameCanvas;
