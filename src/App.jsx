import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import GamePage from "./pages/GamePage";
import Feedback from "./pages/Feedback";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Home />}
        />
        <Route
          path="/game/:gameId"
          element={<GamePage />}
        />
        <Route
          path="/feedback"
          element={<Feedback />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
