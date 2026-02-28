import { useNavigate } from "react-router-dom";

function GameCard({ game }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/game/${game.id}`)}
      className={`bg-gradient-to-br ${game.color} rounded-2xl p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl flex flex-col gap-3`}>
      <div className="text-5xl">{game.icon}</div>
      <div>
        <span className="text-xs font-semibold text-white/70 uppercase tracking-widest">
          {game.category}
        </span>
        <h2 className="text-white text-xl font-bold mt-1">{game.name}</h2>
        <p className="text-white/80 text-sm mt-1">{game.description}</p>
      </div>
      <button className="mt-auto bg-white/20 hover:bg-white/30 text-white text-sm font-semibold py-2 px-4 rounded-xl transition-all duration-200 w-fit">
        Play Now →
      </button>
    </div>
  );
}

export default GameCard;
