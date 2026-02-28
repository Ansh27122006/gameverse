import { useEffect, useRef, useState, useCallback } from "react";

const W = 480;
const H = 520;
const PADDLE_W = 80;
const PADDLE_H = 12;
const BALL_R = 8;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_W = W / BRICK_COLS - 6;
const BRICK_H = 22;
const BRICK_PAD = 6;
const BRICK_TOP = 50;

const BRICK_COLORS = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#60a5fa"];

function Breakout() {
  const canvasRef = useRef(null);
  const loopRef = useRef(null);
  const paddleX = useRef(W / 2 - PADDLE_W / 2);
  const ball = useRef({ x: W / 2, y: H - 80, dx: 3, dy: -3 });
  const bricks = useRef([]);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const runningRef = useRef(false);
  const keysRef = useRef({});

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [bestScore, setBestScore] = useState(() =>
    parseInt(localStorage.getItem("breakout-best") || "0")
  );
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [difficulty, setDifficulty] = useState("Medium");

  const SPEEDS = { Easy: 2.5, Medium: 3.5, Hard: 5 };

  function initBricks() {
    const b = [];
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        b.push({
          x: c * (BRICK_W + BRICK_PAD) + BRICK_PAD,
          y: r * (BRICK_H + BRICK_PAD) + BRICK_TOP,
          alive: true,
          color: BRICK_COLORS[r],
        });
      }
    }
    return b;
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, W, H);

    // Bricks
    bricks.current.forEach((b) => {
      if (!b.alive) return;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, BRICK_W, BRICK_H, 6);
      ctx.fill();
    });

    // Paddle
    ctx.fillStyle = "#a78bfa";
    ctx.beginPath();
    ctx.roundRect(paddleX.current, H - 30, PADDLE_W, PADDLE_H, 6);
    ctx.fill();

    // Ball
    const { x, y } = ball.current;
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.arc(x, y, BALL_R, 0, Math.PI * 2);
    ctx.fill();

    // Glow on ball
    ctx.shadowColor = "#a78bfa";
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;
  }, []);

  const endGame = useCallback((didWin = false) => {
    runningRef.current = false;
    cancelAnimationFrame(loopRef.current);
    const final = scoreRef.current;
    if (final > parseInt(localStorage.getItem("breakout-best") || "0")) {
      localStorage.setItem("breakout-best", final.toString());
      setBestScore(final);
    }
    setGameOver(true);
    setWon(didWin);
  }, []);

  const gameStep = useCallback(() => {
    if (!runningRef.current) return;

    // Keyboard paddle movement
    if (keysRef.current["ArrowLeft"] || keysRef.current["a"]) {
      paddleX.current = Math.max(0, paddleX.current - 6);
    }
    if (keysRef.current["ArrowRight"] || keysRef.current["d"]) {
      paddleX.current = Math.min(W - PADDLE_W, paddleX.current + 6);
    }

    const b = ball.current;

    // Wall bounce
    if (b.x + BALL_R >= W || b.x - BALL_R <= 0) b.dx *= -1;
    if (b.y - BALL_R <= 0) b.dy *= -1;

    // Paddle bounce
    if (
      b.y + BALL_R >= H - 30 &&
      b.y + BALL_R <= H - 30 + PADDLE_H &&
      b.x >= paddleX.current &&
      b.x <= paddleX.current + PADDLE_W
    ) {
      const hitPos = (b.x - paddleX.current) / PADDLE_W;
      const angle = (hitPos - 0.5) * 2;
      const speed = SPEEDS[difficulty];
      b.dx = angle * speed * 1.5;
      b.dy = -Math.abs(b.dy);
    }

    // Ball falls below
    if (b.y + BALL_R > H) {
      livesRef.current -= 1;
      setLives(livesRef.current);
      if (livesRef.current <= 0) return endGame(false);
      ball.current = {
        x: W / 2,
        y: H - 80,
        dx: SPEEDS[difficulty],
        dy: -SPEEDS[difficulty],
      };
    }

    // Brick collision
    bricks.current.forEach((brick) => {
      if (!brick.alive) return;
      if (
        b.x + BALL_R > brick.x &&
        b.x - BALL_R < brick.x + BRICK_W &&
        b.y + BALL_R > brick.y &&
        b.y - BALL_R < brick.y + BRICK_H
      ) {
        brick.alive = false;
        b.dy *= -1;
        scoreRef.current += 10;
        setScore(scoreRef.current);
      }
    });

    // Win check
    if (bricks.current.every((b) => !b.alive)) return endGame(true);

    b.x += b.dx;
    b.y += b.dy;
    ball.current = { ...b };

    draw();
    loopRef.current = requestAnimationFrame(gameStep);
  }, [draw, endGame, difficulty]);

  const startGame = useCallback(() => {
    const speed = SPEEDS[difficulty];
    paddleX.current = W / 2 - PADDLE_W / 2;
    ball.current = { x: W / 2, y: H - 80, dx: speed, dy: -speed };
    bricks.current = initBricks();
    scoreRef.current = 0;
    livesRef.current = 3;
    setScore(0);
    setLives(3);
    setGameOver(false);
    setWon(false);
    setStarted(true);
    runningRef.current = true;
    cancelAnimationFrame(loopRef.current);
    loopRef.current = requestAnimationFrame(gameStep);
  }, [gameStep, difficulty]);

  // Mouse/touch paddle control
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    function onMouseMove(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const mx = (e.clientX - rect.left) * scaleX;
      paddleX.current = Math.min(Math.max(mx - PADDLE_W / 2, 0), W - PADDLE_W);
    }
    function onTouchMove(e) {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const mx = (e.touches[0].clientX - rect.left) * scaleX;
      paddleX.current = Math.min(Math.max(mx - PADDLE_W / 2, 0), W - PADDLE_W);
    }
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  // Keyboard
  useEffect(() => {
    function onDown(e) {
      keysRef.current[e.key] = true;
    }
    function onUp(e) {
      keysRef.current[e.key] = false;
    }
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  // Initial draw
  useEffect(() => {
    draw();
  }, [draw]);

  // Cleanup
  useEffect(() => () => cancelAnimationFrame(loopRef.current), []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
        width: "100%",
        maxWidth: "500px",
        margin: "0 auto",
      }}>
      {/* Title + Stats */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
          Breakout
        </h1>
        <div style={{ display: "flex", gap: "10px" }}>
          {[
            { label: "Score", value: score },
            { label: "Best", value: bestScore },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: "rgba(255,255,255,0.1)",
                borderRadius: "12px",
                padding: "8px 16px",
                textAlign: "center",
                minWidth: "70px",
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
                  fontSize: "1.1rem",
                }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Lives + Difficulty */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}>
        <div style={{ display: "flex", gap: "6px" }}>
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <span
                key={i}
                style={{ fontSize: "1.3rem", opacity: i < lives ? 1 : 0.2 }}>
                ❤️
              </span>
            ))}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {["Easy", "Medium", "Hard"].map((level) => (
            <button
              key={level}
              onClick={() => setDifficulty(level)}
              style={{
                padding: "5px 14px",
                borderRadius: "20px",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "12px",
                background:
                  difficulty === level ? "#ea580c" : "rgba(255,255,255,0.1)",
                color: difficulty === level ? "white" : "rgba(255,255,255,0.5)",
              }}>
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div
        style={{
          position: "relative",
          borderRadius: "16px",
          overflow: "hidden",
          border: "2px solid rgba(255,255,255,0.1)",
          width: "100%",
        }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          style={{ display: "block", width: "100%" }}
        />

        {(!started || gameOver) && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.85)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
            }}>
            {gameOver && (
              <p
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  color: won ? "#4ade80" : "#f87171",
                }}>
                {won ? "You Win! 🎉" : "Game Over! 😢"}
              </p>
            )}
            {gameOver && (
              <p style={{ color: "rgba(255,255,255,0.5)" }}>Score: {score}</p>
            )}
            {!started && !gameOver && (
              <p
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#fb923c",
                }}>
                🧱 Breakout
              </p>
            )}
            <button
              onClick={startGame}
              style={{
                background: "#ea580c",
                color: "white",
                border: "none",
                padding: "12px 32px",
                borderRadius: "12px",
                fontWeight: "bold",
                fontSize: "1rem",
                cursor: "pointer",
              }}>
              {gameOver ? "Play Again" : "Start Game"}
            </button>
          </div>
        )}
      </div>

      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>
        Move mouse, touch, or use arrow keys / A & D
      </p>
    </div>
  );
}

export default Breakout;
