import { useLocation, Link, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function ChangeViewer() {
  const location = useLocation();
  const snapshot = location.state?.snapshot;

  if (!snapshot) {
    return <Navigate to="/dashboard" />;
  }

  const added = snapshot.diff_added ? JSON.parse(snapshot.diff_added) : [];
  const removed = snapshot.diff_removed ? JSON.parse(snapshot.diff_removed) : [];

  return (
    <div className="w-full">
      <Link to={`/history/${snapshot.site_id}`} className="flex items-center text-sm font-medium text-gray-500 hover:text-apple-dark mb-8 gap-2 w-max">
        <ArrowLeft size={16} /> Back to Timeline
      </Link>
      
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Change Viewer</h2>
        <p className="text-gray-500 text-sm">
          Differences identified on {new Date(snapshot.timestamp).toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full min-h-[60vh]">
        {/* Removed Section */}
        <div className="glass rounded-3xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
             <h3 className="font-semibold text-lg text-gray-800">Old Content (Removed)</h3>
             <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-semibold">
               -{removed.length} changes
             </span>
          </div>
          <div className="flex-1 bg-white/50 rounded-2xl p-4 overflow-y-auto font-mono text-sm leading-relaxed border border-red-100 shadow-inner max-h-[500px]">
            {removed.length === 0 ? (
                <span className="text-gray-400 italic">No content removed.</span>
            ) : (
              removed.map((text, i) => (
                <div key={i} className="mb-2 bg-red-100 text-red-800 px-2 py-1 rounded inline-block mr-2 break-all">
                  <del>{text}</del>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Added Section */}
        <div className="glass rounded-3xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
             <h3 className="font-semibold text-lg text-gray-800">New Content (Added)</h3>
             <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-semibold">
               +{added.length} changes
             </span>
          </div>
          <div className="flex-1 bg-white/50 rounded-2xl p-4 overflow-y-auto font-mono text-sm leading-relaxed border border-green-100 shadow-inner max-h-[500px]">
             {added.length === 0 ? (
                <span className="text-gray-400 italic">No content added.</span>
            ) : (
              added.map((text, i) => (
                <div key={i} className="mb-2 bg-green-100 text-green-800 px-2 py-1 rounded inline-block mr-2 break-all">
                  <span>{text}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
