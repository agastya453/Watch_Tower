import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Activity, ArrowLeft, GitCommit } from 'lucide-react';

export default function History() {
  const { id } = useParams();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/history/${id}`);
        setHistory(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [id]);

  const typeConfig = {
    none: { color: 'text-gray-400', bg: 'bg-gray-100', label: 'No Change' },
    minor: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Minor update' },
    major: { color: 'text-red-500', bg: 'bg-red-100', label: 'Major change' }
  };

  if (loading) {
     return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-apple-blue border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Link to="/dashboard" className="flex items-center text-sm font-medium text-gray-500 hover:text-apple-dark mb-8 gap-2">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <h2 className="text-4xl font-bold tracking-tight mb-12">Website Timeline</h2>

      <div className="relative border-l border-gray-200 ml-4 pb-12">
        {history.map((snapshot, index) => {
          const config = typeConfig[snapshot.change_type] || typeConfig.none;
          
          return (
            <motion.div
              key={snapshot.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="mb-10 ml-8 relative"
            >
              <span className={`absolute -left-[42px] flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-[#f5f5f7] ${config.bg} ${config.color}`}>
                <GitCommit size={16} />
              </span>
              
              <div className="glass rounded-2xl p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg text-gray-900">{config.label}</h3>
                  </div>
                  <time className="text-sm text-gray-500">
                    {new Date(snapshot.timestamp).toLocaleString()}
                  </time>
                </div>
                
                {snapshot.change_type !== 'none' && (
                   <Link
                      to={`/diff/${snapshot.id}`}
                      state={{ snapshot }}
                      className="mt-4 inline-flex items-center text-sm font-medium text-apple-blue hover:underline"
                   >
                     <Activity size={14} className="mr-1" />
                     View Differences
                   </Link>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
