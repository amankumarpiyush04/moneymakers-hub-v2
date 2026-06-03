import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, BookOpen, Clock, Loader2, RefreshCw } from 'lucide-react';
import { downloadsAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function DashboardLibrary() {
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchLibrary = () => {
    setLoading(true);
    downloadsAPI.getLibrary()
      .then(({ data }) => {
        setLibrary(data.library || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching library:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  const handleDownload = async (productId, title) => {
    setDownloadingId(productId);
    try {
      const { data } = await downloadsAPI.download(productId);
      
      if (data.success && data.downloadUrl) {
        // Trigger file download in browser
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.setAttribute('download', data.filename || `${title}.pdf`);
        link.setAttribute('target', '_blank');
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        toast.success(`Download started! Remaining attempts: ${data.downloadsRemaining}`);
        
        // Refresh library stats (download count, etc.)
        fetchLibrary();
      } else {
        toast.error('Could not download ebook.');
      }
    } catch (err) {
      console.error('Download error:', err);
      toast.error(err.response?.data?.message || 'Error downloading ebook');
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-emerald-500 h-8 w-8" />
      </div>
    );
  }

  if (library.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-900/10 border border-dashed border-gray-850 rounded-2xl">
        <BookOpen size={48} className="mx-auto text-gray-600 mb-4" />
        <h3 className="text-lg font-bold mb-2">No ebooks in your library</h3>
        <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">
          You haven't purchased any ebooks yet. Start browsing our catalog to pick your first guide.
        </p>
        <Link
          to="/browse"
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-555 text-white font-bold rounded-lg text-sm transition-colors"
        >
          Browse Ebooks
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold font-sora text-white">Your Ebook Library</h2>
          <p className="text-sm text-gray-400">Access and download your digital products below.</p>
        </div>
        <button
          onClick={fetchLibrary}
          className="p-2 bg-gray-900 border border-gray-800 rounded-lg hover:border-gray-700 text-gray-400 hover:text-white transition-colors"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {library.map((item) => {
          const { product, downloadsUsed, downloadsRemaining, lastDownloadedAt } = item;
          if (!product) return null;
          
          return (
            <div
              key={product._id}
              className="bg-gray-900/40 border border-gray-850 p-6 rounded-2xl flex flex-col sm:flex-row gap-6 hover:border-gray-750 transition-colors"
            >
              {/* Ebook thumbnail */}
              <div className="w-24 aspect-[4/5] bg-gradient-to-br from-emerald-950/20 to-gray-950 border border-gray-800 rounded-xl overflow-hidden shrink-0 flex items-center justify-center p-3 relative mx-auto sm:mx-0">
                {product.coverImage?.url ? (
                  <img
                    src={product.coverImage.url}
                    alt={product.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col justify-between h-full w-full">
                    <BookOpen size={20} className="text-emerald-505" />
                    <span className="text-[7px] font-bold text-gray-405 line-clamp-2 leading-tight">{product.title}</span>
                  </div>
                )}
              </div>

              {/* Specs & downloads */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-450 uppercase tracking-widest block mb-1">
                    {product.category}
                  </span>
                  <Link
                    to={`/ebook/${product.slug}`}
                    className="text-base font-bold text-white hover:text-emerald-400 transition-colors line-clamp-1 mb-1 font-sora block"
                  >
                    {product.title}
                  </Link>
                  <p className="text-xs text-gray-500 mb-4">By {product.author}</p>

                  <div className="space-y-1.5 text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span className="text-gray-550">Download attempts</span>
                      <span className="font-semibold text-gray-300">{downloadsUsed} used / {downloadsRemaining} remaining</span>
                    </div>
                    {lastDownloadedAt && (
                      <div className="flex justify-between items-center gap-1.5 text-[10px] text-gray-500">
                        <span className="flex items-center gap-1"><Clock size={10} /> Last downloaded</span>
                        <span>{new Date(lastDownloadedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(product._id, product.title)}
                  disabled={downloadingId === product._id || downloadsRemaining <= 0}
                  className={`w-full mt-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    downloadsRemaining <= 0
                      ? 'bg-gray-800 border border-gray-700 text-gray-550 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-555 text-white'
                  }`}
                >
                  {downloadingId === product._id ? (
                    <>
                      <Loader2 className="animate-spin" size={16} /> Generating link...
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      {downloadsRemaining <= 0 ? 'Limit Reached' : 'Download File'}
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
