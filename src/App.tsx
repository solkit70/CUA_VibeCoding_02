import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConsolePage } from './pages/ConsolePage';
import LandingPage from './components/LandingPage';
import './App.scss';

function App() {
  return (
    <Router>
      <div data-component="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/translator" element={<ConsolePage />} />
          <Route path="/translator-mod" element={<ConsolePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
