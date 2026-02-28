import { useEffect, useRef, useState, useCallback } from "react";

const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
const CELL = CANVAS_SIZE / GRID_SIZE;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIR = { x: 1, y: 0 };
const SPEEDS = { Easy: 150, Medium: 100, Hard: 60 };

function randomFood(snake) {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
  return pos;
}

function Snake() {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const snakeRef = useRef(INITIAL_SNAKE);
  const dirRef = useRef(INITIAL_DIR);
  const nextDirRef = useRef(INITIAL_DIR);
  const foodRef = useRef(randomFood(INITIAL_SNAKE));
  const scoreRef = useRef(0);
  const runningRef = useRef(false);

  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() =>
    parseInt(localStorage.getItem("snake-best") || "0")
  );
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [difficulty, setDifficulty] = useState("Medium");

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    for (let i = 0; i < GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(CANVAS_SIZE, i * CELL);
      ctx.stroke();
    }

    // Food
    const food = foodRef.current;
    ctx.fillStyle = "#f87171";
    ctx.beginPath();
    ctx.arc(
      food.x * CELL + CELL / 2,
      food.y * CELL + CELL / 2,
      CELL / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Snake
    snakeRef.current.forEach((seg, i) => {
      const isHead = i === 0;
      ctx.fillStyle = isHead
        ? "#4ade80"
        : `rgba(74, 222, 128, ${Math.max(0.3, 1 - i * 0.03)})`;
      ctx.beginPath();
      ctx.roundRect(
        seg.x * CELL + 2,
        seg.y * CELL + 2,
        CELL - 4,
        CELL - 4,
        isHead ? 6 : 4
      );
      ctx.fill();
    });
  }, []);

  const endGame = useCallback(() => {
    runningRef.current = false;
    clearInterval(gameLoopRef.current);
    const final = scoreRef.current;
    if (final > parseInt(localStorage.getItem("snake-best") || "0")) {
      localStorage.setItem("snake-best", final.toString());
      setBestScore(final);
    }
    setGameOver(true);
  }, []);

  const gameStep = useCallback(() => {
    dirRef.current = nextDirRef.current;
    const snake = snakeRef.current;
    const head = {
      x: snake[0].x + dirRef.current.x,
      y: snake[0].y + dirRef.current.y,
    };

    // Wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE)
      return endGame();
    // Self collision
    if (snake.some((s) => s.x === head.x && s.y === head.y)) return endGame();

    const newSnake = [head, ...snake];
    const food = foodRef.current;

    if (head.x === food.x && head.y === food.y) {
      scoreRef.current += 10;
      setScore(scoreRef.current);
      foodRef.current = randomFood(newSnake);
    } else {
      newSnake.pop();
    }

    snakeRef.current = newSnake;
    draw();
  }, [draw, endGame]);

  const startGame = useCallback(() => {
    snakeRef.current = INITIAL_SNAKE;
    dirRef.current = INITIAL_DIR;
    nextDirRef.current = INITIAL_DIR;
    foodRef.current = randomFood(INITIAL_SNAKE);
    scoreRef.current = 0;
    setScore(0);
    setGameOver(false);
    setStarted(true);
    runningRef.current = true;
    clearInterval(gameLoopRef.current);
    gameLoopRef.current = setInterval(gameStep, SPEEDS[difficulty]);
    draw();
  }, [gameStep, draw, difficulty]);

  // Keyboard controls
  useEffect(() => {
    function handleKey(e) {
      const dirs = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
      };
      if (!dirs[e.key]) return;
      e.preventDefault();
      const next = dirs[e.key];
      const cur = dirRef.current;
      if (next.x === -cur.x && next.y === -cur.y) return; // no reverse
      nextDirRef.current = next;
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Touch controls
  useEffect(() => {
    let startX = 0,
      startY = 0;
    function onTouchStart(e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }
    function onTouchEnd(e) {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      const cur = dirRef.current;
      let next;
      if (Math.abs(dx) > Math.abs(dy)) {
        next = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
      } else {
        next = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
      }
      if (next.x === -cur.x && next.y === -cur.y) return;
      nextDirRef.current = next;
    }
    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  // Initial draw
  useEffect(() => {
    draw();
  }, [draw]);

  // Cleanup
  useEffect(() => () => clearInterval(gameLoopRef.current), []);

  // Restart with new difficulty
  useEffect(() => {
    if (runningRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = setInterval(gameStep, SPEEDS[difficulty]);
    }
  }, [difficulty, gameStep]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
        width: "100%",
        maxWidth: "420px",
        margin: "0 auto",
      }}>
      {/* Title + Scores */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
          Snake
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

      {/* Difficulty */}
      <div style={{ display: "flex", gap: "8px" }}>
        {Object.keys(SPEEDS).map((level) => (
          <button
            key={level}
            onClick={() => setDifficulty(level)}
            style={{
              padding: "6px 16px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "13px",
              transition: "all 0.2s",
              background:
                difficulty === level ? "#16a34a" : "rgba(255,255,255,0.1)",
              color: difficulty === level ? "white" : "rgba(255,255,255,0.5)",
            }}>
            {level}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div
        style={{
          position: "relative",
          borderRadius: "16px",
          overflow: "hidden",
          border: "2px solid rgba(255,255,255,0.1)",
        }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          style={{ display: "block", maxWidth: "100%" }}
        />

        {/* Start / Game Over Overlay */}
        {(!started || gameOver) && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.8)",
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
                  color: "#f87171",
                }}>
                Game Over! 😢
              </p>
            )}
            {gameOver && (
              <p style={{ color: "rgba(255,255,255,0.6)" }}>Score: {score}</p>
            )}
            {!started && !gameOver && (
              <p
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#4ade80",
                }}>
                🐍 Snake
              </p>
            )}
            <button
              onClick={startGame}
              style={{
                background: "#16a34a",
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

      {/* Mobile Controls */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          width: "160px",
        }}>
        <button
          onClick={() => {
            if (dirRef.current.y !== 1) nextDirRef.current = { x: 0, y: -1 };
          }}
          style={{
            width: "52px",
            height: "52px",
            background: "rgba(255,255,255,0.1)",
            border: "none",
            borderRadius: "12px",
            color: "white",
            fontSize: "1.5rem",
            cursor: "pointer",
          }}>
          ▲
        </button>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => {
              if (dirRef.current.x !== 1) nextDirRef.current = { x: -1, y: 0 };
            }}
            style={{
              width: "52px",
              height: "52px",
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: "12px",
              color: "white",
              fontSize: "1.5rem",
              cursor: "pointer",
            }}>
            ◀
          </button>
          <button
            onClick={() => {
              if (dirRef.current.y !== -1) nextDirRef.current = { x: 0, y: 1 };
            }}
            style={{
              width: "52px",
              height: "52px",
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: "12px",
              color: "white",
              fontSize: "1.5rem",
              cursor: "pointer",
            }}>
            ▼
          </button>
          <button
            onClick={() => {
              if (dirRef.current.x !== -1) nextDirRef.current = { x: 1, y: 0 };
            }}
            style={{
              width: "52px",
              height: "52px",
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: "12px",
              color: "white",
              fontSize: "1.5rem",
              cursor: "pointer",
            }}>
            ▶
          </button>
        </div>
      </div>

      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>
        Arrow keys, swipe, or use buttons above
      </p>
    </div>
  );
}

export default Snake;
