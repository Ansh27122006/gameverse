import { useEffect, useRef, useState, useCallback } from "react";

const COLS = 10;
const ROWS = 20;
const BLOCK = 24;

const TETROMINOES = {
  I: { shape: [[1, 1, 1, 1]], color: "#22d3ee" },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#facc15",
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: "#a78bfa",
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: "#4ade80",
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: "#f87171",
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: "#60a5fa",
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: "#fb923c",
  },
};

const PIECES = Object.keys(TETROMINOES);

function randomPiece() {
  const key = PIECES[Math.floor(Math.random() * PIECES.length)];
  return {
    key,
    shape: TETROMINOES[key].shape,
    color: TETROMINOES[key].color,
    x: 3,
    y: 0,
  };
}

function createBoard() {
  return Array(ROWS)
    .fill(null)
    .map(() => Array(COLS).fill(null));
}

function rotate(shape) {
  return shape[0].map((_, i) => shape.map((row) => row[i]).reverse());
}

function isValid(board, shape, x, y) {
  return shape.every((row, dy) =>
    row.every((val, dx) => {
      if (!val) return true;
      const nx = x + dx,
        ny = y + dy;
      return nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS && !board[ny][nx];
    })
  );
}

function placePiece(board, piece) {
  const newBoard = board.map((row) => [...row]);
  piece.shape.forEach((row, dy) =>
    row.forEach((val, dx) => {
      if (val) newBoard[piece.y + dy][piece.x + dx] = piece.color;
    })
  );
  return newBoard;
}

function clearLines(board) {
  const newBoard = board.filter((row) => row.some((cell) => !cell));
  const cleared = ROWS - newBoard.length;
  const empty = Array(cleared)
    .fill(null)
    .map(() => Array(COLS).fill(null));
  return { board: [...empty, ...newBoard], cleared };
}

const SCORES = [0, 100, 300, 500, 800];
const SPEEDS = { Easy: 700, Medium: 400, Hard: 200 };

function Tetris() {
  const canvasRef = useRef(null);
  const nextCanvasRef = useRef(null);
  const boardRef = useRef(createBoard());
  const pieceRef = useRef(randomPiece());
  const nextPieceRef = useRef(randomPiece());
  const scoreRef = useRef(0);
  const linesRef = useRef(0);
  const levelRef = useRef(1);
  const runningRef = useRef(false);
  const loopRef = useRef(null);
  const difficultyRef = useRef("Medium");

  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [bestScore, setBestScore] = useState(() =>
    parseInt(localStorage.getItem("tetris-best") || "0")
  );
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [difficulty, setDifficulty] = useState("Medium");
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const nextCanvas = nextCanvasRef.current;
    if (!canvas || !nextCanvas) return;
    const ctx = canvas.getContext("2d");
    const nctx = nextCanvas.getContext("2d");

    // Main board
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, COLS * BLOCK, ROWS * BLOCK);

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        ctx.strokeRect(c * BLOCK, r * BLOCK, BLOCK, BLOCK);
      }
    }

    // Placed blocks
    boardRef.current.forEach((row, r) =>
      row.forEach((color, c) => {
        if (color) {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.roundRect(c * BLOCK + 2, r * BLOCK + 2, BLOCK - 4, BLOCK - 4, 4);
          ctx.fill();
          // Shine effect
          ctx.fillStyle = "rgba(255,255,255,0.2)";
          ctx.fillRect(c * BLOCK + 4, r * BLOCK + 4, BLOCK / 3, 3);
        }
      })
    );

    // Ghost piece
    const piece = pieceRef.current;
    let ghostY = piece.y;
    while (isValid(boardRef.current, piece.shape, piece.x, ghostY + 1))
      ghostY++;
    if (ghostY !== piece.y) {
      piece.shape.forEach((row, dy) =>
        row.forEach((val, dx) => {
          if (val) {
            ctx.fillStyle = "rgba(255,255,255,0.1)";
            ctx.beginPath();
            ctx.roundRect(
              (piece.x + dx) * BLOCK + 2,
              (ghostY + dy) * BLOCK + 2,
              BLOCK - 4,
              BLOCK - 4,
              4
            );
            ctx.fill();
          }
        })
      );
    }

    // Current piece
    piece.shape.forEach((row, dy) =>
      row.forEach((val, dx) => {
        if (val) {
          ctx.fillStyle = piece.color;
          ctx.beginPath();
          ctx.roundRect(
            (piece.x + dx) * BLOCK + 2,
            (piece.y + dy) * BLOCK + 2,
            BLOCK - 4,
            BLOCK - 4,
            4
          );
          ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,0.25)";
          ctx.fillRect(
            (piece.x + dx) * BLOCK + 4,
            (piece.y + dy) * BLOCK + 4,
            BLOCK / 3,
            3
          );
        }
      })
    );

    // Next piece preview
    nctx.fillStyle = "#0f172a";
    nctx.fillRect(0, 0, 120, 120);
    const next = nextPieceRef.current;
    const offsetX = Math.floor((4 - next.shape[0].length) / 2);
    const offsetY = Math.floor((4 - next.shape.length) / 2);
    next.shape.forEach((row, dy) =>
      row.forEach((val, dx) => {
        if (val) {
          nctx.fillStyle = next.color;
          nctx.beginPath();
          nctx.roundRect(
            (offsetX + dx) * 28 + 8,
            (offsetY + dy) * 28 + 8,
            24,
            24,
            4
          );
          nctx.fill();
        }
      })
    );
  }, []);

  const endGame = useCallback(() => {
    runningRef.current = false;
    clearInterval(loopRef.current);
    const final = scoreRef.current;
    if (final > parseInt(localStorage.getItem("tetris-best") || "0")) {
      localStorage.setItem("tetris-best", final.toString());
      setBestScore(final);
    }
    setGameOver(true);
  }, []);

  const gameStep = useCallback(() => {
    if (pausedRef.current) return;
    const piece = pieceRef.current;
    if (isValid(boardRef.current, piece.shape, piece.x, piece.y + 1)) {
      pieceRef.current = { ...piece, y: piece.y + 1 };
    } else {
      const newBoard = placePiece(boardRef.current, piece);
      const { board: clearedBoard, cleared } = clearLines(newBoard);
      boardRef.current = clearedBoard;

      const points = SCORES[cleared] * levelRef.current;
      scoreRef.current += points;
      linesRef.current += cleared;
      levelRef.current = Math.floor(linesRef.current / 10) + 1;

      setScore(scoreRef.current);
      setLines(linesRef.current);
      setLevel(levelRef.current);

      const next = nextPieceRef.current;
      if (!isValid(boardRef.current, next.shape, next.x, next.y))
        return endGame();
      pieceRef.current = next;
      nextPieceRef.current = randomPiece();
    }
    draw();
  }, [draw, endGame]);

  const startGame = useCallback(() => {
    boardRef.current = createBoard();
    pieceRef.current = randomPiece();
    nextPieceRef.current = randomPiece();
    scoreRef.current = 0;
    linesRef.current = 0;
    levelRef.current = 1;
    pausedRef.current = false;
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
    setStarted(true);
    setPaused(false);
    runningRef.current = true;
    clearInterval(loopRef.current);
    loopRef.current = setInterval(gameStep, SPEEDS[difficultyRef.current]);
    draw();
  }, [gameStep, draw]);

  const moveLeft = useCallback(() => {
    const p = pieceRef.current;
    if (isValid(boardRef.current, p.shape, p.x - 1, p.y)) {
      pieceRef.current = { ...p, x: p.x - 1 };
      draw();
    }
  }, [draw]);

  const moveRight = useCallback(() => {
    const p = pieceRef.current;
    if (isValid(boardRef.current, p.shape, p.x + 1, p.y)) {
      pieceRef.current = { ...p, x: p.x + 1 };
      draw();
    }
  }, [draw]);

  const moveDown = useCallback(() => {
    const p = pieceRef.current;
    if (isValid(boardRef.current, p.shape, p.x, p.y + 1)) {
      pieceRef.current = { ...p, y: p.y + 1 };
      draw();
    }
  }, [draw]);

  const rotatePiece = useCallback(() => {
    const p = pieceRef.current;
    const rotated = rotate(p.shape);
    if (isValid(boardRef.current, rotated, p.x, p.y)) {
      pieceRef.current = { ...p, shape: rotated };
      draw();
    }
  }, [draw]);

  const hardDrop = useCallback(() => {
    const p = pieceRef.current;
    let newY = p.y;
    while (isValid(boardRef.current, p.shape, p.x, newY + 1)) newY++;
    pieceRef.current = { ...p, y: newY };
    draw();
    gameStep();
  }, [draw, gameStep]);

  const togglePause = useCallback(() => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
  }, []);

  // Keyboard
  useEffect(() => {
    function onKey(e) {
      if (!runningRef.current) return;
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          moveLeft();
          break;
        case "ArrowRight":
          e.preventDefault();
          moveRight();
          break;
        case "ArrowDown":
          e.preventDefault();
          moveDown();
          break;
        case "ArrowUp":
          e.preventDefault();
          rotatePiece();
          break;
        case " ":
          e.preventDefault();
          hardDrop();
          break;
        case "p":
        case "P":
          togglePause();
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moveLeft, moveRight, moveDown, rotatePiece, hardDrop, togglePause]);

  // Touch swipe
  useEffect(() => {
    let startX = 0,
      startY = 0,
      startTime = 0;
    function onTouchStart(e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
    }
    function onTouchEnd(e) {
      if (!runningRef.current) return;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      const dt = Date.now() - startTime;
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && dt < 200) {
        rotatePiece();
        return;
      }
      if (Math.abs(dx) > Math.abs(dy)) {
        dx > 0 ? moveRight() : moveLeft();
      } else {
        dy > 0 ? hardDrop() : rotatePiece();
      }
    }
    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [moveLeft, moveRight, rotatePiece, hardDrop]);

  useEffect(() => {
    draw();
  }, [draw]);
  useEffect(() => () => clearInterval(loopRef.current), []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        width: "100%",
        maxWidth: "500px",
        margin: "0 auto",
        paddingTop: "8px",
        paddingBottom: "8px",
      }}>
      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
        Tetris
      </h1>

      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "flex-start",
          justifyContent: "center",
          flexWrap: "wrap",
        }}>
        {/* Main Canvas */}
        <div
          style={{
            position: "relative",
            borderRadius: "12px",
            overflow: "hidden",
            border: "2px solid rgba(255,255,255,0.1)",
          }}>
          <canvas
            ref={canvasRef}
            width={COLS * BLOCK}
            height={ROWS * BLOCK}
            style={{ display: "block" }}
          />

          {(!started || gameOver || paused) && (
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
                    color: "#f87171",
                    fontSize: "2rem",
                    fontWeight: "bold",
                  }}>
                  Game Over!
                </p>
              )}
              {gameOver && (
                <p style={{ color: "rgba(255,255,255,0.5)" }}>Score: {score}</p>
              )}
              {paused && !gameOver && (
                <p
                  style={{
                    color: "#facc15",
                    fontSize: "2rem",
                    fontWeight: "bold",
                  }}>
                  Paused ⏸
                </p>
              )}
              {!started && !gameOver && (
                <p
                  style={{
                    color: "#a78bfa",
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                  }}>
                  🟦 Tetris
                </p>
              )}
              {paused ? (
                <button
                  onClick={togglePause}
                  style={{
                    background: "#ca8a04",
                    color: "white",
                    border: "none",
                    padding: "12px 28px",
                    borderRadius: "12px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}>
                  Resume
                </button>
              ) : (
                <button
                  onClick={startGame}
                  style={{
                    background: "#6d28d9",
                    color: "white",
                    border: "none",
                    padding: "12px 28px",
                    borderRadius: "12px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}>
                  {gameOver ? "Play Again" : "Start Game"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            minWidth: "120px",
          }}>
          {/* Next Piece */}
          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              borderRadius: "12px",
              padding: "10px",
              textAlign: "center",
            }}>
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "10px",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "8px",
              }}>
              Next
            </p>
            <canvas
              ref={nextCanvasRef}
              width={120}
              height={120}
              style={{ display: "block", margin: "0 auto" }}
            />
          </div>

          {/* Stats */}
          {[
            { label: "Score", value: score },
            { label: "Best", value: bestScore },
            { label: "Lines", value: lines },
            { label: "Level", value: level },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: "rgba(255,255,255,0.08)",
                borderRadius: "12px",
                padding: "10px",
                textAlign: "center",
              }}>
              <p
                style={{
                  color: "rgba(255,255,255,0.4)",
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

          {/* Difficulty */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {["Easy", "Medium", "Hard"].map((diff) => (
              <button
                key={diff}
                onClick={() => {
                  setDifficulty(diff);
                  difficultyRef.current = diff;
                }}
                style={{
                  padding: "6px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "12px",
                  background:
                    difficulty === diff ? "#6d28d9" : "rgba(255,255,255,0.08)",
                  color:
                    difficulty === diff ? "white" : "rgba(255,255,255,0.4)",
                }}>
                {diff}
              </button>
            ))}
          </div>

          {/* Pause */}
          {started && !gameOver && (
            <button
              onClick={togglePause}
              style={{
                padding: "8px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.6)",
                fontWeight: "600",
                fontSize: "12px",
              }}>
              {paused ? "▶ Resume" : "⏸ Pause"}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Controls */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
        }}>
        <button
          onClick={rotatePiece}
          style={{
            width: "56px",
            height: "56px",
            background: "rgba(255,255,255,0.1)",
            border: "none",
            borderRadius: "12px",
            color: "white",
            fontSize: "1.3rem",
            cursor: "pointer",
          }}>
          ↻
        </button>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={moveLeft}
            style={{
              width: "56px",
              height: "56px",
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: "12px",
              color: "white",
              fontSize: "1.3rem",
              cursor: "pointer",
            }}>
            ◀
          </button>
          <button
            onClick={hardDrop}
            style={{
              width: "56px",
              height: "56px",
              background: "#6d28d9",
              border: "none",
              borderRadius: "12px",
              color: "white",
              fontSize: "1.3rem",
              cursor: "pointer",
            }}>
            ⬇
          </button>
          <button
            onClick={moveRight}
            style={{
              width: "56px",
              height: "56px",
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: "12px",
              color: "white",
              fontSize: "1.3rem",
              cursor: "pointer",
            }}>
            ▶
          </button>
        </div>
      </div>

      <p
        style={{
          color: "rgba(255,255,255,0.3)",
          fontSize: "12px",
          textAlign: "center",
        }}>
        Arrow keys to move • Up to rotate • Space to drop • P to pause
      </p>
    </div>
  );
}

export default Tetris;
