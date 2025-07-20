import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConsolePage } from './pages/ConsolePage';
import LandingPage from './components/LandingPage';
import EnglishCoachPage from './pages/EnglishCoachPage';
import GlobalStyle from './styles/GlobalStyle';
import './App.scss';

function App() {
  return (
    <Router>
      <GlobalStyle />
      <div data-component="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/translator" element={<ConsolePage />} />
          <Route path="/translator-mod" element={<ConsolePage />} />
          <Route path="/english-coach" element={<EnglishCoachPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
