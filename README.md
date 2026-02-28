# 🎮 GameVerse

A collection of 10 classic games built with React, Tailwind CSS, and Vanilla JavaScript. No login required — just open and play!

🔗 **Live Demo:** [gameverse-play.vercel.app](https://gameverse-play.vercel.app)

---

## 🕹️ Games

| Game | Category | Description |
|------|----------|-------------|
| 🐍 Snake | Arcade | Eat food, grow longer, don't hit the walls |
| 🟦 Tetris | Arcade | Stack falling blocks and clear lines |
| 🐦 Flappy Bird | Arcade | Tap to fly and dodge the pipes |
| 🔢 2048 | Puzzle | Slide tiles and reach 2048 |
| 📝 Wordle | Puzzle | Guess the 5-letter word in 6 tries |
| 🃏 Memory Card | Puzzle | Find all matching pairs |
| 🧱 Breakout | Arcade | Smash all bricks with your ball |
| 💣 Minesweeper | Strategy | Clear the board without hitting a mine |
| ❌ Tic Tac Toe | Strategy | Classic X and O battle |
| ✊ Rock Paper Scissors | Classic | Beat the computer |

---

## ✨ Features

- 🎯 10 fully playable games
- 📱 Fully responsive — works on mobile and desktop
- 💾 High scores saved with localStorage
- 🏆 Difficulty levels on most games
- 💬 Feedback system — rate games, suggest new ones, report bugs
- 🔍 Search and filter games by category
- ⚡ No login, no signup — instant access

---

## 🛠️ Tech Stack

- **React** — component architecture and routing
- **Tailwind CSS** — styling and responsive layout
- **Vanilla JavaScript** — game logic
- **Canvas API** — Snake, Tetris, Flappy Bird, Breakout
- **React Router** — page navigation
- **localStorage** — score persistence
- **Google Sheets + Apps Script** — feedback collection

---

## 🏗️ Project Structure
```
src/
├── components/       # Reusable UI components
├── games/            # Individual game folders
│   ├── Snake/
│   ├── Tetris/
│   ├── Flappy/
│   ├── Game2048/
│   ├── Wordle/
│   ├── Memory/
│   ├── Breakout/
│   ├── Minesweeper/
│   ├── TicTacToe/
│   └── RPS/
├── pages/            # Home, GamePage, Feedback
└── data/             # games.js — single source of truth
```

---

## 🚀 Run Locally
```bash
git clone https://github.com/YOURUSERNAME/gameverse.git
cd gameverse
npm install
npm run dev
```

---

## 💡 Architecture Decisions
- Each game has a `.jsx` wrapper and `.js` logic file — keeping React and game logic separated
- `games.js` is the single source of truth — adding a new game only requires one new entry here
- Canvas API used for physics-based games (Snake, Tetris, Flappy, Breakout) for smooth 60fps rendering
- `useRef` used for game state instead of `useState` to prevent unnecessary re-renders during game loops

---

## 📬 Feedback
Have a suggestion or found a bug? Visit the [Feedback page](https://gameverse-play.vercel.app/feedback)!

---

Made with ❤️ by [Ansh Preet Kaur](https://github.com/Ansh27122006)
