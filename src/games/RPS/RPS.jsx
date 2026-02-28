import { useState } from "react";

const choices = [
  { id: "rock", emoji: "✊", label: "Rock" },
  { id: "paper", emoji: "🖐️", label: "Paper" },
  { id: "scissors", emoji: "✌️", label: "Scissors" },
];

function getResult(player, computer) {
  if (player === computer) return "draw";
  if (
    (player === "rock" && computer === "scissors") ||
    (player === "paper" && computer === "rock") ||
    (player === "scissors" && computer === "paper")
  )
    return "win";
  return "lose";
}

function RPS() {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState(null);
  const [scores, setScores] = useState(() => {
    const saved = localStorage.getItem("rps-scores");
    return saved ? JSON.parse(saved) : { wins: 0, losses: 0, draws: 0 };
  });
  const [animating, setAnimating] = useState(false);

  function handleChoice(choiceId) {
    if (animating) return;
    setAnimating(true);
    setResult(null);
    setPlayerChoice(null);
    setComputerChoice(null);

    setTimeout(() => {
      const computer = choices[Math.floor(Math.random() * choices.length)].id;
      const outcome = getResult(choiceId, computer);

      setPlayerChoice(choiceId);
      setComputerChoice(computer);
      setResult(outcome);

      const newScores = {
        ...scores,
        wins: outcome === "win" ? scores.wins + 1 : scores.wins,
        losses: outcome === "lose" ? scores.losses + 1 : scores.losses,
        draws: outcome === "draw" ? scores.draws + 1 : scores.draws,
      };
      setScores(newScores);
      localStorage.setItem("rps-scores", JSON.stringify(newScores));
      setAnimating(false);
    }, 600);
  }

  function resetScores() {
    const reset = { wins: 0, losses: 0, draws: 0 };
    setScores(reset);
    localStorage.setItem("rps-scores", JSON.stringify(reset));
  }

  const resultConfig = {
    win: { text: "You Win! 🎉", color: "#4ade80" },
    lose: { text: "You Lose! 😢", color: "#f87171" },
    draw: { text: "It's a Draw! 🤝", color: "#facc15" },
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "28px",
        width: "100%",
        maxWidth: "420px",
        margin: "0 auto",
      }}>
      {/* Title */}
      <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
        Rock Paper Scissors
      </h1>

      {/* Scoreboard */}
      <div style={{ display: "flex", gap: "16px", width: "100%" }}>
        {[
          { label: "Wins", value: scores.wins, color: "#4ade80" },
          { label: "Draws", value: scores.draws, color: "#facc15" },
          { label: "Losses", value: scores.losses, color: "#f87171" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.08)",
              borderRadius: "16px",
              padding: "16px",
              textAlign: "center",
            }}>
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}>
              {item.label}
            </p>
            <p
              style={{
                color: item.color,
                fontSize: "2rem",
                fontWeight: "bold",
              }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Battle Area */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "24px",
          width: "100%",
          minHeight: "120px",
        }}>
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: "12px",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}>
            You
          </p>
          <div
            style={{ fontSize: "4rem", minWidth: "80px", textAlign: "center" }}>
            {animating
              ? "🤔"
              : playerChoice
              ? choices.find((c) => c.id === playerChoice)?.emoji
              : "❓"}
          </div>
        </div>

        <div
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "rgba(255,255,255,0.3)",
          }}>
          VS
        </div>

        <div style={{ textAlign: "center" }}>
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: "12px",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}>
            Computer
          </p>
          <div
            style={{ fontSize: "4rem", minWidth: "80px", textAlign: "center" }}>
            {animating
              ? "🤔"
              : computerChoice
              ? choices.find((c) => c.id === computerChoice)?.emoji
              : "❓"}
          </div>
        </div>
      </div>

      {/* Result */}
      <div style={{ minHeight: "40px", textAlign: "center" }}>
        {result && (
          <p
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: resultConfig[result].color,
            }}>
            {resultConfig[result].text}
          </p>
        )}
      </div>

      {/* Choice Buttons */}
      <div style={{ display: "flex", gap: "12px", width: "100%" }}>
        {choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => handleChoice(choice.id)}
            style={{
              flex: 1,
              padding: "16px 8px",
              borderRadius: "16px",
              border: "2px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.08)",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.18)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            }}>
            <span style={{ fontSize: "2.5rem" }}>{choice.emoji}</span>
            <span
              style={{ color: "white", fontSize: "13px", fontWeight: "600" }}>
              {choice.label}
            </span>
          </button>
        ))}
      </div>

      {/* Reset */}
      <button
        onClick={resetScores}
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "none",
          color: "rgba(255,255,255,0.5)",
          padding: "10px 24px",
          borderRadius: "12px",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: "600",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
        }>
        Reset Scores
      </button>
    </div>
  );
}

export default RPS;
