import { useState, useEffect } from 'react';
import { MonitorPlay as YoutubeIcon, ExternalLink, Play, AlertCircle } from 'lucide-react';
import { getLatestVideos, formatRelativeDate, formatDuration, formatCount, isConfigured } from '../services/youtube';

export default function YouTubePage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nextPage, setNextPage] = useState('');

  const loadVideos = async (token = '') => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }
    
    try {
      const data = await getLatestVideos({ maxResults: 12, pageToken: token });
      if (token) {
        setVideos(prev => [...prev, ...data.videos]);
      } else {
        setVideos(data.videos || []);
      }
      setNextPage(data.nextPageToken || '');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadVideos(); }, []);

  return (
    <main className="page-wrapper fade-in" id="main-content">
      <div className="container">
        <div className="page-header text-center" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: '16px', background: 'rgba(255,0,0,0.1)', borderRadius: '50%', marginBottom: '16px', color: '#ff0000' }}>
            <YoutubeIcon size={32} />
          </div>
          <h1 className="page-title">Peace be upon him YouTube</h1>
          <p className="page-description tamil-text" style={{ fontFamily: 'var(--font-tamil)' }}>
            இஸ்லாமிய விளக்கங்கள் மற்றும் பயான்கள்
          </p>
          <div style={{ marginTop: '1.5rem' }}>
            <a 
              href={`https://www.youtube.com/channel/${import.meta.env.VITE_YOUTUBE_CHANNEL_ID || '@NoorTamil'}?sub_confirmation=1`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ background: '#ff0000', borderColor: '#ff0000' }}
            >
              Subscribe to Channel
            </a>
          </div>
        </div>

        {!isConfigured ? (
          <div className="empty-state">
            <AlertCircle size={40} className="empty-state-icon" />
            <p className="empty-state-title">YouTube Not Configured</p>
            <p className="empty-state-desc">Please add your YouTube API key to the .env file.</p>
          </div>
        ) : loading && videos.length === 0 ? (
          <div className="videos-grid">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="video-card">
                <div className="video-thumb skeleton" />
                <div className="video-info">
                  <div className="skeleton" style={{ height: 14, marginBottom: 8, borderRadius: 4 }} />
                  <div className="skeleton" style={{ height: 12, width: '60%', borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="empty-state">
            <AlertCircle size={40} className="empty-state-icon" style={{ color: 'var(--color-error)' }} />
            <p className="empty-state-title">Unable to load videos</p>
            <p className="empty-state-desc">{error}</p>
          </div>
        ) : (
          <>
            <div className="videos-grid" style={{ marginBottom: '3rem' }}>
              {videos.map(video => (
                <a 
                  key={video.id} 
                  href={video.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="video-card"
                >
                  <div className="video-thumb-wrap">
                    {video.thumbnail 
                      ? <img src={video.thumbnail} alt="" className="video-thumb" loading="lazy" />
                      : <div className="video-thumb video-thumb-placeholder"><Play size={32} /></div>
                    }
                    {video.duration && (
                      <span className="video-duration">{formatDuration(video.duration)}</span>
                    )}
                    <div className="video-play-overlay"><Play size={28} fill="currentColor" /></div>
                  </div>
                  <div className="video-info">
                    <h3 className="video-title">{video.title}</h3>
                    <div className="video-meta">
                      {video.viewCount && <span>{formatCount(video.viewCount)} views</span>}
                      {video.viewCount && video.publishedAt && <span className="video-dot">·</span>}
                      {video.publishedAt && <span>{formatRelativeDate(video.publishedAt)}</span>}
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {nextPage && (
              <div style={{ textAlign: 'center' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => loadVideos(nextPage)}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More Videos'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
