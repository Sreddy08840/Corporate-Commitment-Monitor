import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AddCompany from './pages/AddCompany';
import AddNews from './pages/AddNews';
import './App.css';

/**
 * App shell: navigation + routed pages.
 */
function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="app__main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/companies/new" element={<AddCompany />} />
          <Route path="/news/new" element={<AddNews />} />
        </Routes>
      </main>
      <footer className="app__footer">
        <span>Corporate Commitment Monitor</span>
      </footer>
    </div>
  );
}

export default App;
