import { useState } from "react";
import GameCard from "../components/GameCard";
import games from "../data/games";

function Home() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Arcade", "Strategy", "Puzzle", "Classic"];

  const filteredGames = games.filter((game) => {
    const matchesSearch = game.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || game.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          🎮 GameVerse
        </h1>
        <div className="flex items-center gap-4">
          <p className="text-white/50 text-sm hidden sm:block">
            No login needed. Just play.
          </p>
          <a
            href="/feedback"
            className="text-sm font-semibold bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-xl transition-all text-white">
            💬 Feedback
          </a>
        </div>
      </nav>

      {/* Hero */}
      <div className="text-center py-16 px-4">
        <h2 className="text-4xl sm:text-6xl font-extrabold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
          Play Instantly.
        </h2>
        <p className="text-white/60 text-lg max-w-xl mx-auto">
          A collection of fun games — no login, no download, just open and play.
        </p>
      </div>

      {/* Search */}
      <div className="px-6 max-w-2xl mx-auto mb-6">
        <input
          type="text"
          placeholder="Search games..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-all"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 px-6 max-w-2xl mx-auto mb-10 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 
              ${
                activeCategory === cat
                  ? "bg-purple-600 text-white"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Game Grid */}
      <div className="px-6 max-w-6xl mx-auto pb-16">
        {filteredGames.length === 0 ? (
          <p className="text-center text-white/40 text-lg mt-20">
            No games found 😕
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
