import { useState, useEffect, useCallback } from "react";

const WORDS = [
  "REACT",
  "CRANE",
  "PLANT",
  "BRAIN",
  "FLAME",
  "STONE",
  "CLOUD",
  "BRUSH",
  "GRACE",
  "FROST",
  "BLOOM",
  "CHESS",
  "DRIVE",
  "EARTH",
  "FLAIR",
  "GLOOM",
  "HEART",
  "JUICE",
  "KNIFE",
  "LEMON",
  "MONTH",
  "NERVE",
  "OCEAN",
  "PEARL",
  "QUEEN",
  "RIVER",
  "SMITH",
  "TIGER",
  "ULTRA",
  "VENOM",
  "WATER",
  "XENON",
  "YOUTH",
  "ZEBRA",
  "APPLE",
  "BRAVE",
  "CRISP",
  "DERBY",
  "EAGLE",
  "FETCH",
  "GIANT",
  "HOVER",
  "IRONY",
  "JOKER",
  "KARMA",
  "LASER",
  "MAGIC",
  "NINJA",
  "OLIVE",
  "PIXEL",
  "QUIRK",
  "RADAR",
  "SPADE",
  "TOAST",
  "UMBRA",
  "VIBES",
  "WITCH",
  "XYLEM",
  "YEARN",
  "ZIPPY",
  "ACTOR",
  "BLAZE",
  "CANDY",
  "DITCH",
];

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

function getRandomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function evaluateGuess(guess, target) {
  const result = Array(WORD_LENGTH).fill("absent");
  const targetArr = target.split("");
  const guessArr = guess.split("");
  const used = Array(WORD_LENGTH).fill(false);

  // First pass — correct positions
  guessArr.forEach((letter, i) => {
    if (letter === targetArr[i]) {
      result[i] = "correct";
      used[i] = true;
    }
  });

  // Second pass — present but wrong position
  guessArr.forEach((letter, i) => {
    if (result[i] === "correct") return;
    const foundIdx = targetArr.findIndex((t, j) => t === letter && !used[j]);
    if (foundIdx !== -1) {
      result[i] = "present";
      used[foundIdx] = true;
    }
  });

  return result;
}

const TILE_COLORS = {
  correct: { bg: "#16a34a", border: "#16a34a", color: "white" },
  present: { bg: "#ca8a04", border: "#ca8a04", color: "white" },
  absent: { bg: "#374151", border: "#374151", color: "white" },
  empty: {
    bg: "transparent",
    border: "rgba(255,255,255,0.15)",
    color: "white",
  },
  active: {
    bg: "transparent",
    border: "rgba(255,255,255,0.4)",
    color: "white",
  },
};

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

function Wordle() {
  const [target, setTarget] = useState(getRandomWord);
  const [guesses, setGuesses] = useState([]);
  const [current, setCurrent] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [message, setMessage] = useState("");
  const [shake, setShake] = useState(false);
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem("wordle-stats");
    return saved ? JSON.parse(saved) : { played: 0, wins: 0, streak: 0 };
  });

  function showMessage(msg, duration = 1500) {
    setMessage(msg);
    setTimeout(() => setMessage(""), duration);
  }

  const submitGuess = useCallback(() => {
    if (current.length !== WORD_LENGTH) {
      showMessage("Word must be 5 letters!");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    const evaluation = evaluateGuess(current, target);
    const newGuesses = [...guesses, { word: current, evaluation }];
    setGuesses(newGuesses);
    setCurrent("");

    const isWin = current === target;
    const isLose = newGuesses.length === MAX_GUESSES && !isWin;

    if (isWin) {
      setGameOver(true);
      setWon(true);
      showMessage("Brilliant! 🎉", 3000);
      const newStats = {
        played: stats.played + 1,
        wins: stats.wins + 1,
        streak: stats.streak + 1,
      };
      setStats(newStats);
      localStorage.setItem("wordle-stats", JSON.stringify(newStats));
    } else if (isLose) {
      setGameOver(true);
      showMessage(`The word was ${target}`, 4000);
      const newStats = {
        played: stats.played + 1,
        wins: stats.wins,
        streak: 0,
      };
      setStats(newStats);
      localStorage.setItem("wordle-stats", JSON.stringify(newStats));
    }
  }, [current, guesses, target, stats]);

  const handleKey = useCallback(
    (key) => {
      if (gameOver) return;
      if (key === "ENTER") {
        submitGuess();
        return;
      }
      if (key === "⌫" || key === "BACKSPACE") {
        setCurrent((p) => p.slice(0, -1));
        return;
      }
      if (/^[A-Z]$/.test(key) && current.length < WORD_LENGTH) {
        setCurrent((p) => p + key);
      }
    },
    [gameOver, current, submitGuess]
  );

  useEffect(() => {
    function onKey(e) {
      handleKey(e.key.toUpperCase());
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleKey]);

  function resetGame() {
    setTarget(getRandomWord());
    setGuesses([]);
    setCurrent("");
    setGameOver(false);
    setWon(false);
    setMessage("");
  }

  // Build keyboard letter states
  const letterStates = {};
  guesses.forEach(({ word, evaluation }) => {
    word.split("").forEach((letter, i) => {
      const current = letterStates[letter];
      const next = evaluation[i];
      if (current === "correct") return;
      if (current === "present" && next !== "correct") return;
      letterStates[letter] = next;
    });
  });

  // Build full grid
  const grid = Array(MAX_GUESSES)
    .fill(null)
    .map((_, rowIdx) => {
      if (rowIdx < guesses.length) return guesses[rowIdx];
      if (rowIdx === guesses.length && !gameOver) {
        const tiles = Array(WORD_LENGTH)
          .fill("")
          .map((_, i) => ({
            letter: current[i] || "",
            state: current[i] ? "active" : "empty",
          }));
        return { word: current, tiles, isCurrent: true };
      }
      return {
        word: "",
        tiles: Array(WORD_LENGTH).fill({ letter: "", state: "empty" }),
      };
    });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        width: "100%",
        maxWidth: "420px",
        margin: "0 auto",
      }}>
      {/* Title */}
      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">
        Wordle
      </h1>

      {/* Stats */}
      <div style={{ display: "flex", gap: "10px", width: "100%" }}>
        {[
          { label: "Played", value: stats.played },
          { label: "Wins", value: stats.wins },
          { label: "Streak", value: stats.streak },
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

      {/* Message */}
      <div
        style={{
          minHeight: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
        {message && (
          <div
            style={{
              background: "rgba(255,255,255,0.9)",
              color: "#0f172a",
              padding: "8px 20px",
              borderRadius: "20px",
              fontWeight: "bold",
              fontSize: "14px",
            }}>
            {message}
          </div>
        )}
      </div>

      {/* Grid */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          width: "100%",
        }}>
        {grid.map((row, rowIdx) => (
          <div
            key={rowIdx}
            style={{
              display: "flex",
              gap: "6px",
              justifyContent: "center",
              animation:
                shake && rowIdx === guesses.length ? "shake 0.5s" : "none",
            }}>
            {row.isCurrent
              ? row.tiles.map((tile, colIdx) => {
                  const colors = TILE_COLORS[tile.state];
                  return (
                    <div
                      key={colIdx}
                      style={{
                        width: "56px",
                        height: "56px",
                        border: `2px solid ${colors.border}`,
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        color: colors.color,
                        background: colors.bg,
                        transition: "border-color 0.1s",
                        transform: tile.letter ? "scale(1.05)" : "scale(1)",
                      }}>
                      {tile.letter}
                    </div>
                  );
                })
              : Array(WORD_LENGTH)
                  .fill(null)
                  .map((_, colIdx) => {
                    const letter = row.word?.[colIdx] || "";
                    const state = row.evaluation?.[colIdx] || "empty";
                    const colors = TILE_COLORS[state];
                    return (
                      <div
                        key={colIdx}
                        style={{
                          width: "56px",
                          height: "56px",
                          border: `2px solid ${colors.border}`,
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.5rem",
                          fontWeight: "bold",
                          color: colors.color,
                          background: colors.bg,
                          transition: "all 0.3s",
                        }}>
                        {letter}
                      </div>
                    );
                  })}
          </div>
        ))}
      </div>

      {/* Keyboard */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          width: "100%",
          marginTop: "8px",
        }}>
        {KEYBOARD_ROWS.map((row, i) => (
          <div
            key={i}
            style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
            {row.map((key) => {
              const state = letterStates[key];
              const isWide = key === "ENTER" || key === "⌫";
              const bg =
                state === "correct"
                  ? "#16a34a"
                  : state === "present"
                  ? "#ca8a04"
                  : state === "absent"
                  ? "#1f2937"
                  : "rgba(255,255,255,0.15)";
              return (
                <button
                  key={key}
                  onClick={() => handleKey(key)}
                  style={{
                    padding: isWide ? "14px 10px" : "14px 0",
                    width: isWide ? "64px" : "36px",
                    borderRadius: "8px",
                    border: "none",
                    background: bg,
                    color: "white",
                    fontWeight: "bold",
                    fontSize: isWide ? "11px" : "14px",
                    cursor: "pointer",
                    transition: "background 0.3s",
                  }}>
                  {key}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Play Again */}
      {gameOver && (
        <button
          onClick={resetGame}
          style={{
            background: "#0d9488",
            color: "white",
            border: "none",
            padding: "12px 32px",
            borderRadius: "12px",
            fontWeight: "bold",
            fontSize: "1rem",
            cursor: "pointer",
            marginTop: "8px",
          }}>
          New Word
        </button>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0) }
          20%, 60% { transform: translateX(-8px) }
          40%, 80% { transform: translateX(8px) }
        }
      `}</style>
    </div>
  );
}

export default Wordle;
