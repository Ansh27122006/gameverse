import { useState, useEffect } from "react";

const DIFFICULTIES = {
  Easy: { rows: 8, cols: 8, mines: 10 },
  Medium: { rows: 12, cols: 12, mines: 25 },
  Hard: { rows: 16, cols: 16, mines: 50 },
};

function createBoard(rows, cols, mines, firstRow, firstCol) {
  // Place mines avoiding first click
  const cells = Array(rows * cols).fill(false);
  let placed = 0;
  while (placed < mines) {
    const idx = Math.floor(Math.random() * rows * cols);
    const r = Math.floor(idx / cols);
    const c = idx % cols;
    if (
      !cells[idx] &&
      !(Math.abs(r - firstRow) <= 1 && Math.abs(c - firstCol) <= 1)
    ) {
      cells[idx] = true;
      placed++;
    }
  }

  // Build board
  return Array(rows)
    .fill(null)
    .map((_, r) =>
      Array(cols)
        .fill(null)
        .map((_, c) => {
          const isMine = cells[r * cols + c];
          const neighbors = getNeighbors(r, c, rows, cols);
          const count = neighbors.filter(
            ([nr, nc]) => cells[nr * cols + nc]
          ).length;
          return { isMine, count, revealed: false, flagged: false };
        })
    );
}

function getNeighbors(r, c, rows, cols) {
  const result = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr,
        nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) result.push([nr, nc]);
    }
  }
  return result;
}

function reveal(board, r, c, rows, cols) {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
  const stack = [[r, c]];
  while (stack.length > 0) {
    const [cr, cc] = stack.pop();
    const cell = newBoard[cr][cc];
    if (cell.revealed || cell.flagged) continue;
    cell.revealed = true;
    if (cell.count === 0 && !cell.isMine) {
      getNeighbors(cr, cc, rows, cols).forEach(([nr, nc]) => {
        if (!newBoard[nr][nc].revealed) stack.push([nr, nc]);
      });
    }
  }
  return newBoard;
}

const NUMBER_COLORS = {
  1: "#60a5fa",
  2: "#4ade80",
  3: "#f87171",
  4: "#818cf8",
  5: "#fb7185",
  6: "#34d399",
  7: "#a78bfa",
  8: "#94a3b8",
};
function HowToPlay({ onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "20px",
        overflowY: "auto",
      }}>
      <div
        style={{
          background: "#1e293b",
          borderRadius: "20px",
          padding: "28px",
          maxWidth: "380px",
          width: "100%",
          border: "1px solid rgba(255,255,255,0.1)",
          maxHeight: "90vh",
          overflowY: "auto",
          margin: "auto",
        }}>
        <h2
          style={{
            color: "white",
            fontSize: "1.4rem",
            fontWeight: "bold",
            marginBottom: "16px",
            textAlign: "center",
          }}>
          💣 How to Play Minesweeper
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: "12px",
              padding: "14px",
            }}>
            <p
              style={{
                color: "#60a5fa",
                fontWeight: "bold",
                marginBottom: "6px",
              }}>
              🖱️ Left Click
            </p>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>
              Reveal a cell. If it's a mine — game over! If it's safe, a number
              appears showing how many mines are nearby.
            </p>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: "12px",
              padding: "14px",
            }}>
            <p
              style={{
                color: "#f87171",
                fontWeight: "bold",
                marginBottom: "6px",
              }}>
              🚩 Right Click (or Long Press)
            </p>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>
              Place a flag on a cell you think has a mine. This protects you
              from accidentally clicking it.
            </p>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: "12px",
              padding: "14px",
            }}>
            <p
              style={{
                color: "#4ade80",
                fontWeight: "bold",
                marginBottom: "8px",
              }}>
              🔢 What do numbers mean?
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "14px",
                marginBottom: "10px",
              }}>
              Each number tells you how many of its 8 surrounding cells contain
              mines. Use this to figure out where mines are hiding!
            </p>
            {/* Visual Example */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 40px)",
                gap: "4px",
                margin: "0 auto",
                width: "fit-content",
              }}>
              {[
                { label: "1", color: "#60a5fa", bg: "rgba(255,255,255,0.08)" },
                { label: "1", color: "#60a5fa", bg: "rgba(255,255,255,0.08)" },
                { label: "1", color: "#60a5fa", bg: "rgba(255,255,255,0.08)" },
                { label: "1", color: "#60a5fa", bg: "rgba(255,255,255,0.08)" },
                { label: "💣", color: "white", bg: "#ef4444" },
                { label: "1", color: "#60a5fa", bg: "rgba(255,255,255,0.08)" },
                { label: "1", color: "#60a5fa", bg: "rgba(255,255,255,0.08)" },
                { label: "1", color: "#60a5fa", bg: "rgba(255,255,255,0.08)" },
                { label: "1", color: "#60a5fa", bg: "rgba(255,255,255,0.08)" },
              ].map((cell, i) => (
                <div
                  key={i}
                  style={{
                    width: "40px",
                    height: "40px",
                    background: cell.bg,
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: cell.color,
                    fontWeight: "bold",
                    fontSize: "14px",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}>
                  {cell.label}
                </div>
              ))}
            </div>
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "12px",
                textAlign: "center",
                marginTop: "8px",
              }}>
              All 8 cells around the mine show "1"
            </p>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: "12px",
              padding: "14px",
            }}>
            <p
              style={{
                color: "#facc15",
                fontWeight: "bold",
                marginBottom: "6px",
              }}>
              🏆 How to Win
            </p>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>
              Reveal every safe cell without hitting a mine. Your first click is
              always safe!
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            width: "100%",
            marginTop: "20px",
            background: "#475569",
            color: "white",
            border: "none",
            padding: "12px",
            borderRadius: "12px",
            fontWeight: "bold",
            fontSize: "15px",
            cursor: "pointer",
          }}>
          Got it, Let's Play! 🚀
        </button>
      </div>
    </div>
  );
}
function Minesweeper() {
  const [difficulty, setDifficulty] = useState("Easy");
  const [board, setBoard] = useState(null);
  const [gameState, setGameState] = useState("idle"); // idle, playing, won, lost
  const [minesLeft, setMinesLeft] = useState(DIFFICULTIES["Easy"].mines);
  const [time, setTime] = useState(0);
  const [showHelp, setShowHelp] = useState(true);
  const [bestTimes, setBestTimes] = useState(() => {
    const saved = localStorage.getItem("minesweeper-best");
    return saved ? JSON.parse(saved) : { Easy: null, Medium: null, Hard: null };
  });

  const { rows, cols, mines } = DIFFICULTIES[difficulty];

  // Timer
  useEffect(() => {
    if (gameState !== "playing") return;
    const timer = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  function startGame(diff = difficulty) {
    setBoard(null);
    setGameState("idle");
    setTime(0);
    setMinesLeft(DIFFICULTIES[diff].mines);
  }

  function changeDifficulty(diff) {
    setDifficulty(diff);
    startGame(diff);
  }

  function handleClick(r, c) {
    if (gameState === "won" || gameState === "lost") return;

    // First click — generate board
    if (!board || gameState === "idle") {
      const newBoard = createBoard(rows, cols, mines, r, c);
      const revealed = reveal(newBoard, r, c, rows, cols);
      setBoard(revealed);
      setGameState("playing");
      return;
    }

    const cell = board[r][c];
    if (cell.revealed || cell.flagged) return;

    if (cell.isMine) {
      // Reveal all mines
      const newBoard = board.map((row) =>
        row.map((cell) => ({
          ...cell,
          revealed: cell.isMine ? true : cell.revealed,
        }))
      );
      setBoard(newBoard);
      setGameState("lost");
      return;
    }

    const newBoard = reveal(board, r, c, rows, cols);
    setBoard(newBoard);
    checkWin(newBoard);
  }

  function handleRightClick(e, r, c) {
    e.preventDefault();
    if (!board || gameState !== "playing") return;
    const cell = board[r][c];
    if (cell.revealed) return;
    const newBoard = board.map((row) => row.map((c) => ({ ...c })));
    newBoard[r][c].flagged = !newBoard[r][c].flagged;
    setBoard(newBoard);
    setMinesLeft((m) => (newBoard[r][c].flagged ? m - 1 : m + 1));
  }

  function checkWin(newBoard) {
    const allSafeRevealed = newBoard.every((row) =>
      row.every((cell) => cell.isMine || cell.revealed)
    );
    if (allSafeRevealed) {
      setGameState("won");
      if (bestTimes[difficulty] === null || time < bestTimes[difficulty]) {
        const newBest = { ...bestTimes, [difficulty]: time };
        setBestTimes(newBest);
        localStorage.setItem("minesweeper-best", JSON.stringify(newBest));
      }
    }
  }

  function getCellStyle(cell, gameState) {
    if (cell.revealed) {
      if (cell.isMine)
        return { background: "#ef4444", border: "1px solid #dc2626" };
      return {
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.05)",
      };
    }
    return {
      background: "rgba(255,255,255,0.12)",
      border: "1px solid rgba(255,255,255,0.15)",
      cursor: "pointer",
    };
  }

  const cellSize =
    difficulty === "Hard" ? 32 : difficulty === "Medium" ? 36 : 44;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        width: "100%",
        maxWidth: "600px",
        margin: "0 auto",
      }}>
      {showHelp && <HowToPlay onClose={() => setShowHelp(false)} />}

      {/* Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-slate-400 to-gray-300 bg-clip-text text-transparent">
          Minesweeper
        </h1>
        <button
          onClick={() => setShowHelp(true)}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "none",
            color: "rgba(255,255,255,0.7)",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.2)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
          }>
          ?
        </button>
      </div>

      {/* Stats bar */}
      <div style={{ display: "flex", gap: "10px", width: "100%" }}>
        {[
          { label: "💣 Mines", value: minesLeft },
          { label: "⏱ Time", value: `${time}s` },
          {
            label: "🏆 Best",
            value:
              bestTimes[difficulty] !== null
                ? `${bestTimes[difficulty]}s`
                : "-",
          },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              flex: 1,
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
                fontSize: "1.1rem",
              }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Difficulty */}
      <div style={{ display: "flex", gap: "8px" }}>
        {["Easy", "Medium", "Hard"].map((diff) => (
          <button
            key={diff}
            onClick={() => changeDifficulty(diff)}
            style={{
              padding: "6px 18px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "13px",
              background:
                difficulty === diff ? "#475569" : "rgba(255,255,255,0.1)",
              color: difficulty === diff ? "white" : "rgba(255,255,255,0.5)",
            }}>
            {diff}
          </button>
        ))}
      </div>

      {/* Game Status */}
      {(gameState === "won" || gameState === "lost") && (
        <div
          style={{
            background:
              gameState === "won"
                ? "rgba(74,222,128,0.15)"
                : "rgba(248,113,113,0.15)",
            border: `1px solid ${
              gameState === "won"
                ? "rgba(74,222,128,0.3)"
                : "rgba(248,113,113,0.3)"
            }`,
            borderRadius: "16px",
            padding: "12px 28px",
            textAlign: "center",
          }}>
          <p
            style={{
              color: gameState === "won" ? "#4ade80" : "#f87171",
              fontSize: "1.3rem",
              fontWeight: "bold",
            }}>
            {gameState === "won" ? "You Win! 🎉" : "Boom! 💥 Game Over"}
          </p>
          <button
            onClick={() => startGame()}
            style={{
              marginTop: "10px",
              background: gameState === "won" ? "#16a34a" : "#dc2626",
              color: "white",
              border: "none",
              padding: "8px 24px",
              borderRadius: "10px",
              fontWeight: "bold",
              cursor: "pointer",
            }}>
            Play Again
          </button>
        </div>
      )}

      {/* Board */}
      <div
        style={{
          overflowX: "auto",
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}>
        {!board ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              padding: "40px",
            }}>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "1.1rem" }}>
              Click any cell to start!
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
                gap: "3px",
              }}>
              {Array(rows)
                .fill(null)
                .map((_, r) =>
                  Array(cols)
                    .fill(null)
                    .map((_, c) => (
                      <div
                        key={`${r}-${c}`}
                        onClick={() => handleClick(r, c)}
                        style={{
                          width: cellSize,
                          height: cellSize,
                          background: "rgba(255,255,255,0.1)",
                          border: "1px solid rgba(255,255,255,0.15)",
                          borderRadius: "4px",
                          cursor: "pointer",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(255,255,255,0.2)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(255,255,255,0.1)")
                        }
                      />
                    ))
                )}
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
              gap: "3px",
            }}>
            {board.map((row, r) =>
              row.map((cell, c) => (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleClick(r, c)}
                  onContextMenu={(e) => handleRightClick(e, r, c)}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: difficulty === "Hard" ? "12px" : "14px",
                    fontWeight: "bold",
                    transition: "all 0.1s",
                    userSelect: "none",
                    ...getCellStyle(cell, gameState),
                  }}
                  onMouseEnter={(e) => {
                    if (!cell.revealed)
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.22)";
                  }}
                  onMouseLeave={(e) => {
                    if (!cell.revealed)
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.12)";
                  }}>
                  {cell.flagged && !cell.revealed ? (
                    "🚩"
                  ) : cell.revealed && cell.isMine ? (
                    "💣"
                  ) : cell.revealed && cell.count > 0 ? (
                    <span style={{ color: NUMBER_COLORS[cell.count] }}>
                      {cell.count}
                    </span>
                  ) : null}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>
        Left click to reveal • Right click to flag
      </p>

      {/* New Game */}
      <button
        onClick={() => startGame()}
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

export default Minesweeper;
