import { useParams, useNavigate } from "react-router-dom";
import TicTacToe from "../games/TicTacToe/TicTacToe";
import RPS from "../games/RPS/RPS";
import Game2048 from "../games/Game2048/Game2048";
import Snake from "../games/Snake/Snake";
import Memory from "../games/Memory/Memory";
import Breakout from "../games/Breakout/Breakout";
import Wordle from "../games/Wordle/Wordle";
import Minesweeper from "../games/Minesweeper/Minesweeper";
import Tetris from "../games/Tetris/Tetris";
import Flappy from "../games/Flappy/Flappy";

const gameComponents = {
  tictactoe: <TicTacToe />,
  rps: <RPS />,
  2048: <Game2048 />,
  snake: <Snake />,
  memory: <Memory />,
  breakout: <Breakout />,
  wordle: <Wordle />,
  minesweeper: <Minesweeper />,
  tetris: <Tetris />,
  flappy: <Flappy />,
};

function GamePage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const game = gameComponents[gameId];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="flex items-center px-6 py-4 border-b border-white/10">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-all text-sm font-semibold">
          ← Back to GameVerse
        </button>
      </nav>
      <div className="flex items-center justify-center px-4 py-10">
        {game ? (
          game
        ) : (
          <div className="text-center">
            <p className="text-5xl mb-4">😕</p>
            <p className="text-white/50 text-lg">Game not found</p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 px-6 py-2 bg-purple-600 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-all">
              Go Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default GamePage;
