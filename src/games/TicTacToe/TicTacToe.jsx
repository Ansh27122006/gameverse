import { useState, useEffect } from "react";

const initialBoard = Array(9).fill(null);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return null;
}

function TicTacToe() {
  const [board, setBoard] = useState(initialBoard);
  const [isXTurn, setIsXTurn] = useState(true);
  const [scores, setScores] = useState(() => {
    const saved = localStorage.getItem("tictactoe-scores");
    return saved ? JSON.parse(saved) : { X: 0, O: 0 };
  });
  const [gameOver, setGameOver] = useState(false);
  const [status, setStatus] = useState("Player X's turn");

  const result = calculateWinner(board);
  const isDraw = !result && board.every((cell) => cell !== null);

  useEffect(() => {
    if (result) {
      setStatus(`Player ${result.winner} wins! 🎉`);
      setGameOver(true);
      const newScores = {
        ...scores,
        [result.winner]: scores[result.winner] + 1,
      };
      setScores(newScores);
      localStorage.setItem("tictactoe-scores", JSON.stringify(newScores));
    } else if (isDraw) {
      setStatus("It's a draw! 🤝");
      setGameOver(true);
    } else {
      setStatus(`Player ${isXTurn ? "X" : "O"}'s turn`);
    }
  }, [board]);

  function handleClick(index) {
    if (board[index] || gameOver) return;
    const newBoard = [...board];
    newBoard[index] = isXTurn ? "X" : "O";
    setBoard(newBoard);
    setIsXTurn(!isXTurn);
  }

  function resetGame() {
    setBoard(initialBoard);
    setIsXTurn(true);
    setGameOver(false);
    setStatus("Player X's turn");
  }

  function resetScores() {
    const reset = { X: 0, O: 0 };
    setScores(reset);
    localStorage.setItem("tictactoe-scores", JSON.stringify(reset));
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "24px",
        width: "100%",
        maxWidth: "400px",
        margin: "0 auto",
      }}>
      {/* Title */}
      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
        Tic Tac Toe
      </h1>

      {/* Scoreboard */}
      <div className="flex gap-10 bg-white/10 rounded-2xl px-8 py-4">
        <div className="text-center">
          <p className="text-white/50 text-xs uppercase tracking-widest">
            Player X
          </p>
          <p className="text-3xl font-bold text-blue-400">{scores.X}</p>
        </div>
        <div className="text-center">
          <p className="text-white/50 text-xs uppercase tracking-widest">
            Player O
          </p>
          <p className="text-3xl font-bold text-pink-400">{scores.O}</p>
        </div>
      </div>

      {/* Status */}
      <p className="text-white/70 text-lg font-semibold">{status}</p>

      {/* Board */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
          width: "100%",
        }}>
        {board.map((cell, index) => {
          const isWinningCell = result?.line.includes(index);
          return (
            <button
              key={index}
              onClick={() => handleClick(index)}
              style={{
                height: "100px",
                fontSize: "2.5rem",
                fontWeight: "bold",
                borderRadius: "16px",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s",
                background: isWinningCell ? "#9333ea" : "rgba(255,255,255,0.1)",
                color: cell === "X" ? "#60a5fa" : "#f472b6",
                transform: isWinningCell ? "scale(1.05)" : "scale(1)",
              }}
              onMouseEnter={(e) => {
                if (!isWinningCell)
                  e.target.style.background = "rgba(255,255,255,0.2)";
              }}
              onMouseLeave={(e) => {
                if (!isWinningCell)
                  e.target.style.background = "rgba(255,255,255,0.1)";
              }}>
              {cell}
            </button>
          );
        })}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "12px", width: "100%" }}>
        <button
          onClick={resetGame}
          className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold transition-all">
          {gameOver ? "Play Again" : "Restart"}
        </button>
        <button
          onClick={resetScores}
          className="px-5 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-all text-sm">
          Reset Scores
        </button>
      </div>
    </div>
  );
}

export default TicTacToe;
