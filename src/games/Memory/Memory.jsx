import { useState, useEffect } from "react";

const EMOJIS = [
  "🐶",
  "🐱",
  "🐭",
  "🐹",
  "🐰",
  "🦊",
  "🐻",
  "🐼",
  "🐨",
  "🐯",
  "🦁",
  "🐮",
];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function createCards(count) {
  const selected = EMOJIS.slice(0, count);
  const doubled = [...selected, ...selected];
  return shuffle(doubled).map((emoji, i) => ({
    id: i,
    emoji,
    flipped: false,
    matched: false,
  }));
}

function Memory() {
  const [difficulty, setDifficulty] = useState("Medium");
  const [cards, setCards] = useState([]);
  const [selected, setSelected] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [bestMoves, setBestMoves] = useState(() => {
    const saved = localStorage.getItem("memory-best");
    return saved ? JSON.parse(saved) : { Easy: null, Medium: null, Hard: null };
  });
  const [locked, setLocked] = useState(false);

  const difficultyConfig = {
    Easy: { pairs: 6, grid: "repeat(4, 1fr)" },
    Medium: { pairs: 8, grid: "repeat(4, 1fr)" },
    Hard: { pairs: 12, grid: "repeat(6, 1fr)" },
  };

  function startGame(diff = difficulty) {
    const { pairs } = difficultyConfig[diff];
    setCards(createCards(pairs));
    setSelected([]);
    setMoves(0);
    setMatches(0);
    setGameOver(false);
    setLocked(false);
  }

  useEffect(() => {
    startGame();
  }, []);

  function handleCardClick(card) {
    if (locked || card.flipped || card.matched) return;
    if (selected.length === 1 && selected[0].id === card.id) return;

    const newCards = cards.map((c) =>
      c.id === card.id ? { ...c, flipped: true } : c
    );
    setCards(newCards);

    const newSelected = [...selected, card];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves((m) => m + 1);
      setLocked(true);

      const [first, second] = newSelected;

      if (first.emoji === second.emoji) {
        // Match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.emoji === first.emoji ? { ...c, matched: true } : c
            )
          );
          const newMatches = matches + 1;
          setMatches(newMatches);
          setSelected([]);
          setLocked(false);

          const totalPairs = difficultyConfig[difficulty].pairs;
          if (newMatches + 1 === totalPairs) {
            const finalMoves = moves + 1;
            setGameOver(true);
            const currentBest = bestMoves[difficulty];
            if (currentBest === null || finalMoves < currentBest) {
              const newBest = { ...bestMoves, [difficulty]: finalMoves };
              setBestMoves(newBest);
              localStorage.setItem("memory-best", JSON.stringify(newBest));
            }
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === first.id || c.id === second.id
                ? { ...c, flipped: false }
                : c
            )
          );
          setSelected([]);
          setLocked(false);
        }, 1000);
      }
    }
  }

  function changeDifficulty(diff) {
    setDifficulty(diff);
    startGame(diff);
  }

  const { grid, pairs } = difficultyConfig[difficulty];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
        width: "100%",
        maxWidth: "520px",
        margin: "0 auto",
      }}>
      {/* Title */}
      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-pink-400 to-rose-500 bg-clip-text text-transparent">
        Memory Card Flip
      </h1>

      {/* Stats */}
      <div style={{ display: "flex", gap: "10px", width: "100%" }}>
        {[
          { label: "Moves", value: moves },
          { label: "Matches", value: `${matches}/${pairs}` },
          { label: "Best", value: bestMoves[difficulty] ?? "-" },
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
                fontSize: "1.2rem",
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
              transition: "all 0.2s",
              background:
                difficulty === diff ? "#db2777" : "rgba(255,255,255,0.1)",
              color: difficulty === diff ? "white" : "rgba(255,255,255,0.5)",
            }}>
            {diff}
          </button>
        ))}
      </div>

      {/* Game Over */}
      {gameOver && (
        <div
          style={{
            background: "rgba(74,222,128,0.15)",
            border: "1px solid rgba(74,222,128,0.3)",
            borderRadius: "16px",
            padding: "16px 32px",
            textAlign: "center",
          }}>
          <p
            style={{
              color: "#4ade80",
              fontSize: "1.5rem",
              fontWeight: "bold",
            }}>
            You Won! 🎉
          </p>
          <p style={{ color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>
            Completed in {moves} moves
          </p>
          <button
            onClick={() => startGame()}
            style={{
              marginTop: "12px",
              background: "#db2777",
              color: "white",
              border: "none",
              padding: "10px 24px",
              borderRadius: "12px",
              fontWeight: "bold",
              cursor: "pointer",
            }}>
            Play Again
          </button>
        </div>
      )}

      {/* Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: grid,
          gap: "10px",
          width: "100%",
        }}>
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card)}
            style={{
              height: difficulty === "Hard" ? "65px" : "80px",
              borderRadius: "12px",
              cursor: card.flipped || card.matched ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: difficulty === "Hard" ? "1.5rem" : "2rem",
              transition: "all 0.3s",
              background: card.matched
                ? "rgba(74,222,128,0.2)"
                : card.flipped
                ? "rgba(255,255,255,0.15)"
                : "rgba(255,255,255,0.07)",
              border: card.matched
                ? "2px solid rgba(74,222,128,0.4)"
                : card.flipped
                ? "2px solid rgba(255,255,255,0.2)"
                : "2px solid transparent",
              transform:
                card.flipped || card.matched ? "scale(1.03)" : "scale(1)",
            }}>
            {card.flipped || card.matched ? card.emoji : "❓"}
          </div>
        ))}
      </div>

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

export default Memory;
