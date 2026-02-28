import { useState, useEffect, useCallback } from "react";

function createEmptyBoard() {
  return Array(4)
    .fill(null)
    .map(() => Array(4).fill(0));
}

function addRandomTile(board) {
  const empty = [];
  board.forEach((row, r) =>
    row.forEach((val, c) => {
      if (val === 0) empty.push([r, c]);
    })
  );
  if (empty.length === 0) return board;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const newBoard = board.map((row) => [...row]);
  newBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
  return newBoard;
}

function slideRow(row) {
  let arr = row.filter((v) => v !== 0);
  let score = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      score += arr[i];
      arr.splice(i + 1, 1);
    }
  }
  while (arr.length < 4) arr.push(0);
  return { row: arr, score };
}

function moveBoard(board, direction) {
  let newBoard = board.map((row) => [...row]);
  let totalScore = 0;
  let moved = false;

  function processRows(b) {
    return b.map((row) => {
      const { row: newRow, score } = slideRow(row);
      totalScore += score;
      if (newRow.join() !== row.join()) moved = true;
      return newRow;
    });
  }

  function transpose(b) {
    return b[0].map((_, i) => b.map((row) => row[i]));
  }

  function reverseRows(b) {
    return b.map((row) => [...row].reverse());
  }

  if (direction === "left") newBoard = processRows(newBoard);
  if (direction === "right")
    newBoard = reverseRows(processRows(reverseRows(newBoard)));
  if (direction === "up")
    newBoard = transpose(processRows(transpose(newBoard)));
  if (direction === "down")
    newBoard = transpose(
      reverseRows(processRows(reverseRows(transpose(newBoard))))
    );

  return { newBoard, totalScore, moved };
}

function isGameOver(board) {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) return false;
      if (c < 3 && board[r][c] === board[r][c + 1]) return false;
      if (r < 3 && board[r][c] === board[r + 1][c]) return false;
    }
  }
  return true;
}

const tileColors = {
  0: { bg: "rgba(255,255,255,0.05)", color: "transparent" },
  2: { bg: "#eee4da", color: "#776e65" },
  4: { bg: "#ede0c8", color: "#776e65" },
  8: { bg: "#f2b179", color: "#fff" },
  16: { bg: "#f59563", color: "#fff" },
  32: { bg: "#f67c5f", color: "#fff" },
  64: { bg: "#f65e3b", color: "#fff" },
  128: { bg: "#edcf72", color: "#fff" },
  256: { bg: "#edcc61", color: "#fff" },
  512: { bg: "#edc850", color: "#fff" },
  1024: { bg: "#edc53f", color: "#fff" },
  2048: { bg: "#edc22e", color: "#fff" },
};

function initBoard() {
  let b = createEmptyBoard();
  b = addRandomTile(b);
  b = addRandomTile(b);
  return b;
}

function Game2048() {
  const [board, setBoard] = useState(initBoard);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    return parseInt(localStorage.getItem("2048-best") || "0");
  });
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const handleMove = useCallback(
    (direction) => {
      if (gameOver) return;
      const { newBoard, totalScore, moved } = moveBoard(board, direction);
      if (!moved) return;

      const withNewTile = addRandomTile(newBoard);
      setBoard(withNewTile);

      setScore((prev) => {
        const newScore = prev + totalScore;
        if (newScore > bestScore) {
          setBestScore(newScore);
          localStorage.setItem("2048-best", newScore.toString());
        }
        return newScore;
      });

      if (withNewTile.some((row) => row.includes(2048))) setWon(true);
      if (isGameOver(withNewTile)) setGameOver(true);
    },
    [board, gameOver, bestScore]
  );

  useEffect(() => {
    function handleKey(e) {
      const map = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down",
      };
      if (map[e.key]) {
        e.preventDefault();
        handleMove(map[e.key]);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleMove]);

  // Touch support
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
      if (Math.abs(dx) > Math.abs(dy)) {
        handleMove(dx > 0 ? "right" : "left");
      } else {
        handleMove(dy > 0 ? "down" : "up");
      }
    }
    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [handleMove]);

  function resetGame() {
    setBoard(initBoard());
    setScore(0);
    setGameOver(false);
    setWon(false);
  }

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
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          2048
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

      {/* Board */}
      <div
        style={{
          background: "rgba(255,255,255,0.08)",
          borderRadius: "16px",
          padding: "12px",
          width: "100%",
          position: "relative",
        }}>
        {/* Game Over Overlay */}
        {(gameOver || won) && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.75)",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              zIndex: 10,
            }}>
            <p
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: won ? "#facc15" : "#f87171",
              }}>
              {won ? "You Win! 🎉" : "Game Over! 😢"}
            </p>
            <button
              onClick={resetGame}
              style={{
                background: "#9333ea",
                color: "white",
                border: "none",
                padding: "12px 28px",
                borderRadius: "12px",
                fontWeight: "bold",
                fontSize: "1rem",
                cursor: "pointer",
              }}>
              Play Again
            </button>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "10px",
          }}>
          {board.map((row, r) =>
            row.map((val, c) => {
              const colors = tileColors[val] || {
                bg: "#edc22e",
                color: "#fff",
              };
              return (
                <div
                  key={`${r}-${c}`}
                  style={{
                    height: "80px",
                    background: colors.bg,
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: val >= 1024 ? "1.2rem" : "1.5rem",
                    fontWeight: "bold",
                    color: colors.color,
                    transition: "all 0.1s",
                  }}>
                  {val !== 0 ? val : ""}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Instructions */}
      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>
        Use arrow keys or swipe to move tiles
      </p>

      {/* New Game Button */}
      <button
        onClick={resetGame}
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "none",
          color: "rgba(255,255,255,0.6)",
          padding: "10px 28px",
          borderRadius: "12px",
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "14px",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
        }>
        New Game
      </button>
    </div>
  );
}

export default Game2048;
