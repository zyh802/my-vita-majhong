import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import HomePage from './pages/HomePage/HomePage';
import GamePage from './pages/GamePage/GamePage';
import ResultPage from './pages/ResultPage/ResultPage';

function App() {
  return (
    <BrowserRouter>
      <GameProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game/:levelId" element={<GamePage />} />
          <Route path="/result/:levelId" element={<ResultPage />} />
        </Routes>
      </GameProvider>
    </BrowserRouter>
  );
}

export default App;
