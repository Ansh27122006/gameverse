import { useState } from "react";
import { useNavigate } from "react-router-dom";
import games from "../data/games";

const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbyalqDRYg5m_8Odwfjr7vttjhEb6x1MYhRXY8fYtC3ORmRD89MloVf44xZYyyIZd3DC/exec";

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: "8px" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          style={{
            fontSize: "2rem",
            cursor: "pointer",
            transition: "transform 0.1s",
            color:
              star <= (hovered || value) ? "#facc15" : "rgba(255,255,255,0.2)",
            transform: star <= hovered ? "scale(1.2)" : "scale(1)",
          }}>
          ★
        </span>
      ))}
    </div>
  );
}

function SuccessMessage({ message }) {
  return (
    <div
      style={{
        background: "rgba(74,222,128,0.15)",
        border: "1px solid rgba(74,222,128,0.3)",
        borderRadius: "16px",
        padding: "20px",
        textAlign: "center",
      }}>
      <p style={{ fontSize: "2rem", marginBottom: "8px" }}>🎉</p>
      <p style={{ color: "#4ade80", fontWeight: "bold", fontSize: "1.1rem" }}>
        {message}
      </p>
    </div>
  );
}

async function submitToSheet(data) {
  await fetch(SHEET_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

function RateGameTab() {
  const [selectedGame, setSelectedGame] = useState("");
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!selectedGame || rating === 0) return;
    setLoading(true);
    await submitToSheet({
      type: "Rating",
      game: selectedGame,
      rating: `${rating}/5`,
      message,
    });
    setLoading(false);
    setSubmitted(true);
  }

  if (submitted)
    return (
      <SuccessMessage message="Thanks for your review! It means a lot 🌟" />
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <p
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "14px",
            marginBottom: "10px",
          }}>
          Select a game
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "8px",
          }}>
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.name)}
              style={{
                padding: "10px",
                borderRadius: "12px",
                border: "2px solid",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s",
                borderColor:
                  selectedGame === game.name
                    ? "#9333ea"
                    : "rgba(255,255,255,0.1)",
                background:
                  selectedGame === game.name
                    ? "rgba(147,51,234,0.2)"
                    : "rgba(255,255,255,0.05)",
              }}>
              <span style={{ fontSize: "1.2rem" }}>{game.icon}</span>
              <span
                style={{
                  color: "white",
                  fontSize: "13px",
                  fontWeight: "600",
                  marginLeft: "8px",
                }}>
                {game.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "14px",
            marginBottom: "10px",
          }}>
          Your rating
        </p>
        <StarRating
          value={rating}
          onChange={setRating}
        />
      </div>

      <div>
        <p
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "14px",
            marginBottom: "10px",
          }}>
          Comment{" "}
          <span style={{ color: "rgba(255,255,255,0.3)" }}>(optional)</span>
        </p>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What did you think about the game?"
          rows={3}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "12px",
            padding: "12px",
            color: "white",
            fontSize: "14px",
            resize: "none",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selectedGame || rating === 0 || loading}
        style={{
          padding: "14px",
          borderRadius: "14px",
          border: "none",
          fontWeight: "bold",
          fontSize: "15px",
          cursor: selectedGame && rating > 0 ? "pointer" : "not-allowed",
          transition: "all 0.2s",
          background:
            selectedGame && rating > 0 ? "#9333ea" : "rgba(255,255,255,0.1)",
          color: selectedGame && rating > 0 ? "white" : "rgba(255,255,255,0.3)",
        }}>
        {loading ? "Submitting..." : "Submit Review ✨"}
      </button>
    </div>
  );
}

function SuggestGameTab() {
  const [suggestion, setSuggestion] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!suggestion.trim()) return;
    setLoading(true);
    await submitToSheet({
      type: "Suggestion",
      game: suggestion,
      rating: "",
      message: reason,
    });
    setLoading(false);
    setSubmitted(true);
  }

  if (submitted)
    return (
      <SuccessMessage message="Great suggestion! We'll consider it for the next update 🚀" />
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <p
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "14px",
            marginBottom: "10px",
          }}>
          Game you'd like to see
        </p>
        <input
          value={suggestion}
          onChange={(e) => setSuggestion(e.target.value)}
          placeholder="e.g. Pac-Man, Chess, Sudoku..."
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "12px",
            padding: "12px",
            color: "white",
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div>
        <p
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "14px",
            marginBottom: "10px",
          }}>
          Why would you like this game?{" "}
          <span style={{ color: "rgba(255,255,255,0.3)" }}>(optional)</span>
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Tell us why you'd love to play this..."
          rows={3}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "12px",
            padding: "12px",
            color: "white",
            fontSize: "14px",
            resize: "none",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!suggestion.trim() || loading}
        style={{
          padding: "14px",
          borderRadius: "14px",
          border: "none",
          fontWeight: "bold",
          fontSize: "15px",
          cursor: suggestion.trim() ? "pointer" : "not-allowed",
          transition: "all 0.2s",
          background: suggestion.trim() ? "#0891b2" : "rgba(255,255,255,0.1)",
          color: suggestion.trim() ? "white" : "rgba(255,255,255,0.3)",
        }}>
        {loading ? "Submitting..." : "Send Suggestion 💡"}
      </button>
    </div>
  );
}

function ReportBugTab() {
  const [selectedGame, setSelectedGame] = useState("");
  const [bugDesc, setBugDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!selectedGame || !bugDesc.trim()) return;
    setLoading(true);
    await submitToSheet({
      type: "Bug Report",
      game: selectedGame,
      rating: "",
      message: bugDesc,
    });
    setLoading(false);
    setSubmitted(true);
  }

  if (submitted)
    return <SuccessMessage message="Bug reported! We'll fix it asap 🐛" />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div>
        <p
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "14px",
            marginBottom: "10px",
          }}>
          Which game has the bug?
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "8px",
          }}>
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.name)}
              style={{
                padding: "10px",
                borderRadius: "12px",
                border: "2px solid",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s",
                borderColor:
                  selectedGame === game.name
                    ? "#dc2626"
                    : "rgba(255,255,255,0.1)",
                background:
                  selectedGame === game.name
                    ? "rgba(220,38,38,0.2)"
                    : "rgba(255,255,255,0.05)",
              }}>
              <span style={{ fontSize: "1.2rem" }}>{game.icon}</span>
              <span
                style={{
                  color: "white",
                  fontSize: "13px",
                  fontWeight: "600",
                  marginLeft: "8px",
                }}>
                {game.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "14px",
            marginBottom: "10px",
          }}>
          Describe the bug
        </p>
        <textarea
          value={bugDesc}
          onChange={(e) => setBugDesc(e.target.value)}
          placeholder="What happened? What did you expect to happen?"
          rows={4}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "12px",
            padding: "12px",
            color: "white",
            fontSize: "14px",
            resize: "none",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selectedGame || !bugDesc.trim() || loading}
        style={{
          padding: "14px",
          borderRadius: "14px",
          border: "none",
          fontWeight: "bold",
          fontSize: "15px",
          cursor: selectedGame && bugDesc.trim() ? "pointer" : "not-allowed",
          transition: "all 0.2s",
          background:
            selectedGame && bugDesc.trim()
              ? "#dc2626"
              : "rgba(255,255,255,0.1)",
          color:
            selectedGame && bugDesc.trim() ? "white" : "rgba(255,255,255,0.3)",
        }}>
        {loading ? "Submitting..." : "Report Bug 🐛"}
      </button>
    </div>
  );
}

function Feedback() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("rate");

  const tabs = [
    { id: "rate", label: "⭐ Rate a Game" },
    { id: "suggest", label: "💡 Suggest a Game" },
    { id: "bug", label: "🐛 Report a Bug" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#030712", color: "white" }}>
      {/* Navbar */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          padding: "16px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
        <button
          onClick={() => navigate("/")}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.6)",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
          }}>
          ← Back to GameVerse
        </button>
      </nav>

      <div
        style={{ maxWidth: "520px", margin: "0 auto", padding: "32px 16px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              background: "linear-gradient(to right, #a78bfa, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "8px",
            }}>
            Share Your Thoughts 💬
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "15px" }}>
            Your feedback helps us make GameVerse better for everyone
          </p>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: "6px",
            background: "rgba(255,255,255,0.05)",
            padding: "6px",
            borderRadius: "16px",
            marginBottom: "28px",
          }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: "10px 6px",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "12px",
                transition: "all 0.2s",
                background:
                  activeTab === tab.id
                    ? "rgba(255,255,255,0.12)"
                    : "transparent",
                color: activeTab === tab.id ? "white" : "rgba(255,255,255,0.4)",
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            padding: "24px",
          }}>
          {activeTab === "rate" && <RateGameTab />}
          {activeTab === "suggest" && <SuggestGameTab />}
          {activeTab === "bug" && <ReportBugTab />}
        </div>
      </div>
    </div>
  );
}

export default Feedback;
