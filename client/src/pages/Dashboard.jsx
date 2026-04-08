import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Clock, Activity, ArrowRight, ExternalLink } from 'lucide-react';

export default function Dashboard() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/sites`);
      setSites(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = {
    none: 'bg-green-500',
    minor: 'bg-yellow-500',
    major: 'bg-red-500'
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-apple-blue border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-12">
        <h2 className="text-4xl font-bold tracking-tight">Active Trackers</h2>
        <Link to="/" className="px-6 py-2 bg-white/50 hover:bg-white/80 rounded-full backdrop-blur-sm border font-medium transition-all text-sm">
          + New Tracker
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sites.map((site, index) => (
          <motion.div
            key={site.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass rounded-3xl p-6 hover:shadow-lg transition-shadow relative overflow-hidden group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${statusColor[site.status || 'none']}`}></div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {site.status || 'tracking'}
                </span>
              </div>
              <a href={site.url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-apple-blue">
                <ExternalLink size={16} />
              </a>
            </div>

            <h3 className="font-medium text-lg text-gray-900 truncate mb-1" title={site.url}>
              {site.url.replace(/^https?:\/\/(www\.)?/, '')}
            </h3>

            <div className="flex items-center text-xs text-gray-500 gap-1 mb-8">
              <Clock size={12} />
              <span>Checked {new Date(site.last_checked || site.created_at).toLocaleString()}</span>
            </div>

            <Link
              to={`/history/${site.id}`}
              className="flex items-center justify-between text-sm font-medium text-apple-blue group-hover:underline"
            >
              <span>View History</span>
              <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        ))}
        {sites.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-500 glass rounded-3xl">
            No trackers added yet.
          </div>
        )}
      </div>
    </div>
  );
}
