// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from "./pages/Dashboard";
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        {/* Adicione outras rotas conforme necessário */}
      </Routes>
    </Router>
  );
}

export default App;