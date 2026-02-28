import { useEffect, useRef, useState, useCallback } from "react";

const W = 360;
const H = 540;
const BIRD_X = 80;
const BIRD_R = 16;
const PIPE_W = 52;
const PIPE_GAP = 150;
const GRAVITY = 0.1;
const JUMP = -3;
const PIPE_SPEED = 1.8;

function Flappy() {
  const canvasRef = useRef(null);
  const loopRef = useRef(null);
  const birdY = useRef(H / 2);
  const birdV = useRef(0);
  const pipes = useRef([]);
  const scoreRef = useRef(0);
  const frameRef = useRef(0);
  const runningRef = useRef(false);

  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() =>
    parseInt(localStorage.getItem("flappy-best") || "0")
  );
  const [gameState, setGameState] = useState("idle"); // idle, playing, dead

  function addPipe() {
    const minY = 80;
    const maxY = H - PIPE_GAP - 80;
    const topH = Math.floor(Math.random() * (maxY - minY) + minY);
    pipes.current.push({ x: W, topH, scored: false });
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#0ea5e9");
    sky.addColorStop(1, "#38bdf8");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Ground
    ctx.fillStyle = "#854d0e";
    ctx.fillRect(0, H - 40, W, 40);
    ctx.fillStyle = "#65a30d";
    ctx.fillRect(0, H - 50, W, 14);

    // Pipes
    pipes.current.forEach((pipe) => {
      // Pipe gradient
      const pg = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_W, 0);
      pg.addColorStop(0, "#16a34a");
      pg.addColorStop(0.5, "#22c55e");
      pg.addColorStop(1, "#15803d");
      ctx.fillStyle = pg;

      // Top pipe
      ctx.beginPath();
      ctx.roundRect(pipe.x, 0, PIPE_W, pipe.topH - 10, [0, 0, 6, 6]);
      ctx.fill();
      // Top pipe cap
      ctx.fillRect(pipe.x - 5, pipe.topH - 22, PIPE_W + 10, 22);

      // Bottom pipe
      const botY = pipe.topH + PIPE_GAP;
      ctx.beginPath();
      ctx.roundRect(pipe.x, botY + 22, PIPE_W, H - botY - 62, [6, 6, 0, 0]);
      ctx.fill();
      // Bottom pipe cap
      ctx.fillRect(pipe.x - 5, botY, PIPE_W + 10, 22);
    });

    // Bird
    const by = birdY.current;
    const tilt = Math.min(Math.max(birdV.current * 3, -30), 60);
    ctx.save();
    ctx.translate(BIRD_X, by);
    ctx.rotate((tilt * Math.PI) / 180);

    // Bird body
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(0, 0, BIRD_R, 0, Math.PI * 2);
    ctx.fill();

    // Wing
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.ellipse(-4, 4, 10, 6, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(6, -4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.arc(8, -4, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.moveTo(12, -1);
    ctx.lineTo(20, 2);
    ctx.lineTo(12, 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Score on canvas
    ctx.fillStyle = "white";
    ctx.font = "bold 36px Arial";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 4;
    ctx.fillText(scoreRef.current, W / 2, 60);
    ctx.shadowBlur = 0;
  }, []);

  const endGame = useCallback(() => {
    runningRef.current = false;
    cancelAnimationFrame(loopRef.current);
    const final = scoreRef.current;
    if (final > parseInt(localStorage.getItem("flappy-best") || "0")) {
      localStorage.setItem("flappy-best", final.toString());
      setBestScore(final);
    }
    setGameState("dead");
  }, []);

  const gameLoop = useCallback(() => {
    if (!runningRef.current) return;

    frameRef.current++;
    birdV.current += GRAVITY;
    birdY.current += birdV.current;

    // Add pipes every 90 frames
    if (frameRef.current % 120 === 0) addPipe();

    // Move pipes
    pipes.current.forEach((p) => {
      p.x -= PIPE_SPEED;
    });
    pipes.current = pipes.current.filter((p) => p.x > -PIPE_W - 10);

    // Score
    pipes.current.forEach((p) => {
      if (!p.scored && p.x + PIPE_W < BIRD_X) {
        p.scored = true;
        scoreRef.current++;
        setScore(scoreRef.current);
      }
    });

    // Collision — ground or ceiling
    if (birdY.current + BIRD_R >= H - 50 || birdY.current - BIRD_R <= 0)
      return endGame();

    // Collision — pipes
    for (const pipe of pipes.current) {
      if (
        BIRD_X + BIRD_R > pipe.x + 5 &&
        BIRD_X - BIRD_R < pipe.x + PIPE_W - 5
      ) {
        if (
          birdY.current - BIRD_R < pipe.topH ||
          birdY.current + BIRD_R > pipe.topH + PIPE_GAP
        ) {
          return endGame();
        }
      }
    }

    draw();
    loopRef.current = requestAnimationFrame(gameLoop);
  }, [draw, endGame]);

  function jump() {
    if (gameState === "dead") return;
    if (gameState === "idle") {
      // Start game on first jump
      birdY.current = H / 2;
      birdV.current = 0;
      pipes.current = [];
      scoreRef.current = 0;
      frameRef.current = 0;
      setScore(0);
      setGameState("playing");
      runningRef.current = true;
      loopRef.current = requestAnimationFrame(gameLoop);
    }
    birdV.current = JUMP;
  }

  function restart() {
    birdY.current = H / 2;
    birdV.current = 0;
    pipes.current = [];
    scoreRef.current = 0;
    frameRef.current = 0;
    setScore(0);
    setGameState("idle");
    runningRef.current = false;
    draw();
  }

  // Keyboard
  useEffect(() => {
    function onKey(e) {
      if (e.code === "Space" || e.key === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gameState, gameLoop]);

  useEffect(() => {
    draw();
  }, [draw]);
  useEffect(() => () => cancelAnimationFrame(loopRef.current), []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        width: "100%",
        maxWidth: "380px",
        margin: "0 auto",
      }}>
      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
        Flappy Bird
      </h1>

      {/* Best Score */}
      <div style={{ display: "flex", gap: "16px" }}>
        {[
          { label: "Score", value: score },
          { label: "Best", value: bestScore },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: "rgba(255,255,255,0.1)",
              borderRadius: "12px",
              padding: "8px 20px",
              textAlign: "center",
            }}>
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}>
              {item.label}
            </p>
            <p
              style={{
                color: "white",
                fontWeight: "bold",
                fontSize: "1.2rem",
              }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Canvas */}
      <div
        style={{
          position: "relative",
          borderRadius: "16px",
          overflow: "hidden",
          border: "3px solid rgba(255,255,255,0.15)",
          cursor: "pointer",
        }}
        onClick={jump}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{ display: "block", maxWidth: "100%" }}
        />

        {/* Idle overlay */}
        {gameState === "idle" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
            }}>
            <p style={{ color: "white", fontSize: "2rem", fontWeight: "bold" }}>
              🐦 Flappy Bird
            </p>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "1rem" }}>
              Tap or press Space to start!
            </p>
          </div>
        )}

        {/* Dead overlay */}
        {gameState === "dead" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "14px",
            }}>
            <p
              style={{
                color: "#f87171",
                fontSize: "2rem",
                fontWeight: "bold",
              }}>
              Game Over! 💥
            </p>
            <p
              style={{
                color: "white",
                fontSize: "1.3rem",
                fontWeight: "bold",
              }}>
              Score: {score}
            </p>
            {score === bestScore && score > 0 && (
              <p style={{ color: "#facc15", fontSize: "1rem" }}>🏆 New Best!</p>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                restart();
              }}
              style={{
                background: "#0ea5e9",
                color: "white",
                border: "none",
                padding: "12px 32px",
                borderRadius: "12px",
                fontWeight: "bold",
                fontSize: "1rem",
                cursor: "pointer",
              }}>
              Play Again
            </button>
          </div>
        )}
      </div>

      {/* Tap button for mobile */}
      {gameState === "playing" && (
        <button
          onClick={jump}
          style={{
            width: "120px",
            height: "50px",
            background: "#0ea5e9",
            border: "none",
            borderRadius: "14px",
            color: "white",
            fontSize: "1.5rem",
            cursor: "pointer",
            fontWeight: "bold",
          }}>
          TAP 🐦
        </button>
      )}

      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>
        Click, tap, or press Space to flap
      </p>
    </div>
  );
}

export default Flappy;
