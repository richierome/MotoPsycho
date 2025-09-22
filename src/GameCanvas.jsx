// src/GameCanvas.jsx
import React, { useEffect, useState } from "react";
import tankerImg from "./assets/tanker.png"; // Make sure this path is correct

const GameCanvas = () => {
  const [playerX] = useState(100);
  const [playerY, setPlayerY] = useState(200);
  const [speed, setSpeed] = useState(15);
  const [obstacles, setObstacles] = useState([]);
  const [bullets, setBullets] = useState([]);
  const [bgX, setBgX] = useState(0);
  const [distance, setDistance] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [lives, setLives] = useState(3);
  const [deliveryMade, setDeliveryMade] = useState(false);

  const ROUTE_LENGTH = 15000;
  const GAS_STATION_WIDTH = 80;
  const GAS_STATION_HEIGHT = 100;
  const [gasStationX, setGasStationX] = useState(800);
  const [gasStationY, setGasStationY] = useState(200);
  const GAS_SPEED = 3;
  const GAS_APPEAR_DISTANCE = 10000;

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => setIsMobile(window.innerWidth <= 768), []);

  // Keyboard input (desktop)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowUp") setPlayerY((y) => Math.max(y - 20, 0));
      if (e.key === "ArrowDown") setPlayerY((y) => Math.min(y + 20, 380));
      if (e.key === "ArrowRight") setSpeed((s) => Math.min(s + 1, 20));
      if (e.key === "ArrowLeft") setSpeed((s) => Math.max(s - 1, 0));
      if (e.key === " ") {
        setBullets((prev) => [
          ...prev,
          { id: Date.now(), x: playerX + 50, y: playerY + 10, width: 8, height: 4 },
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
      setObstacles((prev) => [
        ...prev,
        {
          id: Date.now(),
          x: 800,
          y: Math.random() * 320,
          width: 50,
          height: 30,
          speed: Math.random() * 5 + 2,
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
          .filter((o) => o.x > -100 && o.x < 900)
      );

      // Move bullets
      setBullets((prev) =>
        prev
          .map((b) => ({ ...b, x: b.x + 15 }))
          .filter((b) => b.x < 900)
      );

      // Bullet collision
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

      // Player collision
      setObstacles((prevObs) => {
        let newLives = lives;
        const remaining = prevObs.filter((obs) => {
          const collision =
            playerX < obs.x + obs.width &&
            playerX + 50 > obs.x &&
            playerY < obs.y + obs.height &&
            playerY + 30 > obs.y;
          if (collision) newLives -= 1;
          return !collision;
        });
        if (newLives <= 0) setGameOver(true);
        else if (newLives !== lives) setLives(newLives);
        return remaining;
      });

      // Gas station logic
      if (distance >= GAS_APPEAR_DISTANCE && !deliveryMade) {
        setGasStationX((x) => x - GAS_SPEED);

        const docking =
          playerX < gasStationX + GAS_STATION_WIDTH &&
          playerX + 50 > gasStationX &&
          playerY < gasStationY + GAS_STATION_HEIGHT &&
          playerY + 30 > gasStationY;

        if (docking) setDeliveryMade(true);

        if (gasStationX < -GAS_STATION_WIDTH) {
          setGasStationX(800);
          setGasStationY(Math.random() * 250);
        }
      }
    }, 30);

    return () => clearInterval(loop);
  }, [speed, bullets, gameOver, lives, distance, gasStationX, gasStationY, deliveryMade, playerX, playerY]);

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

  return (
    <div style={{ position: "relative", width: 800, height: 400 }}>
      <svg width={800} height={400}>
        {/* Ground */}
        <rect x={bgX} y={350} width={800} height={50} fill="gray" />
        <rect x={bgX + 800} y={350} width={800} height={50} fill="gray" />

        {/* Player Tanker */}
        <image href={tankerImg} x={playerX} y={playerY} width={200} height={150} />

        {/* Obstacles */}
        {obstacles.map((o) => (
          <rect key={o.id} x={o.x} y={o.y} width={o.width} height={o.height} fill="red" />
        ))}

        {/* Bullets */}
        {bullets.map((b) => (
          <rect key={b.id} x={b.x} y={b.y} width={b.width} height={b.height} fill="yellow" />
        ))}

        {/* Gas Station */}
        {distance >= GAS_APPEAR_DISTANCE && !deliveryMade && (
          <>
            <rect x={gasStationX} y={gasStationY} width={GAS_STATION_WIDTH} height={GAS_STATION_HEIGHT} fill="green" />
            <text x={gasStationX + 10} y={gasStationY + 50} fontSize={14} fill="white">Gas</text>
          </>
        )}

        {/* HUD */}
        <text x={10} y={20} fontSize={16} fill="black">Speed: {speed}</text>
        <text x={10} y={40} fontSize={16} fill="black">Distance: {distance} / {ROUTE_LENGTH}</text>
        <text x={10} y={60} fontSize={16} fill="black">Lives: {lives}</text>

        {gameOver && !deliveryMade && <text x={200} y={200} fontSize={28} fill="red">❌ Game Over</text>}
        {deliveryMade && <text x={200} y={200} fontSize={28} fill="green">✅ Delivery Made!</text>}
      </svg>

      {/* Mobile controls */}
      {isMobile && (
        <>
          <div onTouchStart={() => setPlayerY((y) => Math.max(y - 20, 0))} style={{ ...mobileButtonCommon, bottom: 140, left: 60 }}>▲</div>
          <div onTouchStart={() => setPlayerY((y) => Math.min(y + 20, 380))} style={{ ...mobileButtonCommon, bottom: 20, left: 60 }}>▼</div>
          <div onTouchStart={() => setSpeed((s) => Math.max(s - 1, 0))} style={{ ...mobileButtonCommon, bottom: 80, left: 0 }}>◀︎</div>
          <div onTouchStart={() => setSpeed((s) => Math.min(s + 1, 20))} style={{ ...mobileButtonCommon, bottom: 80, left: 120 }}>▶︎</div>
          <div
            onTouchStart={() => setBullets((prev) => [...prev, { id: Date.now(), x: playerX + 50, y: playerY + 10, width: 8, height: 4 }])}
            style={{ ...mobileButtonCommon, bottom: 80, right: 20 }}
          >
            ◉
          </div>
        </>
      )}
    </div>
  );
};

export default GameCanvas;
