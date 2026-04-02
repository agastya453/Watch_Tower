import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search } from 'lucide-react';

export default function Landing() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:5000/api/track', { url });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to track URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center"
      >
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
          Intelligence, <br /> automated.
        </h1>
        <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto">
          Track any website. Detect changes instantly. Review differences with absolute clarity.
        </p>

        <form onSubmit={handleTrack} className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full pl-12 pr-4 py-4 rounded-2xl glass focus:outline-none focus:ring-2 focus:ring-apple-blue transition-all"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-4 bg-apple-dark text-white rounded-full font-medium hover:bg-black transition-colors disabled:opacity-50"
          >
            {loading ? 'Initializing Tracker...' : 'Start Tracking'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
