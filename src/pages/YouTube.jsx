import { useState, useEffect } from 'react';
import { MonitorPlay as YoutubeIcon, Play, AlertCircle } from 'lucide-react';
import { getLatestVideos, getLatestFullVideos, formatRelativeDate, formatDuration, formatCount, isConfigured } from '../services/youtube';
import FriendlyError from '../components/ui/FriendlyError';
import { parseError } from '../utils/errorHandling';

export default function YouTubePage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nextPage, setNextPage] = useState('');
  const [videoType, setVideoType] = useState('all');

  const loadVideos = async (token = '', type = videoType) => {
    try {
      const getVideos = type === 'full' ? getLatestFullVideos : getLatestVideos;
      const data = await getVideos({ maxResults: 12, pageToken: token });
      if (token) {
        setVideos(prev => [...prev, ...data.videos]);
      } else {
        setVideos(data.videos || []);
      }
      setNextPage(data.nextPageToken || '');
    } catch (e) {
      setError(parseError(e, 'YouTube videos'));
    } finally {
      setLoading(false);
    }
  };

  const selectVideoType = type => {
    setLoading(true);
    setError('');
    setVideoType(type);
    setVideos([]);
    setNextPage('');
    loadVideos('', type);
  };

  useEffect(() => {
    if (isConfigured) loadVideos();
  }, []);

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

        {isConfigured && (
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                className={`btn ${videoType === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => selectVideoType('all')}
                disabled={loading}
                aria-pressed={videoType === 'all'}
              >
                All Uploads
              </button>
              <button
                className={`btn ${videoType === 'full' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => selectVideoType('full')}
                disabled={loading}
                aria-pressed={videoType === 'full'}
              >
                Full-length Videos
              </button>
            </div>
            {videoType === 'full' && (
              <p className="page-description" style={{ marginTop: '0.5rem' }}>
                Videos longer than 3 minutes. Shorts appear under All Uploads.
              </p>
            )}
          </div>
        )}

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
          <div style={{ marginTop: '2rem' }}>
            <FriendlyError 
              title={error.title} 
              message={error.message} 
              icon={error.icon} 
              onRetry={() => loadVideos()} 
            />
          </div>
        ) : (
          <>
            {videos.length > 0 ? (
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
                      <h3 className="video-title">
                        {video.title ? video.title.replace(/#\S+/g, '').replace(/\s+/g, ' ').trim() : ''}
                      </h3>
                      <div className="video-meta">
                        {video.viewCount && <span>{formatCount(video.viewCount)} views</span>}
                        {video.viewCount && video.publishedAt && <span className="video-dot">·</span>}
                        {video.publishedAt && <span>{formatRelativeDate(video.publishedAt)}</span>}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p className="empty-state-title">
                  {videoType === 'full' ? 'No full-length videos found in these uploads' : 'No videos found'}
                </p>
                <p className="empty-state-desc">
                  {videoType === 'full'
                    ? 'Load more to check older uploads, or browse all uploads.'
                    : 'Check back later for new uploads.'}
                </p>
              </div>
            )}

            {nextPage && (
              <div style={{ textAlign: 'center' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setLoading(true);
                    setError('');
                    loadVideos(nextPage);
                  }}
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
