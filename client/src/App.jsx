import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import ChangeViewer from './pages/ChangeViewer';

function App() {
  return (
    <Router>
      <div className="min-h-screen relative font-sans">
        {/* Animated Background */}
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#f5f5f7]">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute top-0 -right-40 w-[500px] h-[500px] bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-40 left-20 w-[500px] h-[500px] bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
        </div>

        <nav className="glass sticky top-0 z-50 flex justify-between items-center px-8 py-4">
          <div className="text-xl font-semibold tracking-tight">Focus UI</div>
          <div className="flex gap-4">
            <a href="/" className="text-sm font-medium hover:text-apple-blue transition-colors">Home</a>
            <a href="/dashboard" className="text-sm font-medium hover:text-apple-blue transition-colors">Dashboard</a>
          </div>
        </nav>

        <main className="max-w-6xl mx-auto px-4 py-12">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history/:id" element={<History />} />
            <Route path="/diff/:id" element={<ChangeViewer />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
