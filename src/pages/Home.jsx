import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MonitorPlay, Camera, Play, ExternalLink, Users, Eye, Video, ChevronRight, AlertCircle } from 'lucide-react';
import {
  getChannelInfo, getLatestVideos, formatCount, formatRelativeDate, formatDuration, isConfigured
} from '../services/youtube';
import './Home.css';

//  Skeleton helpers 
function StatSkeleton() {
  return (
    <div className="stat-card">
      <div className="skeleton" style={{ width: 40, height: 20, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: 60, height: 12 }} />
    </div>
  );
}

function VideoSkeleton() {
  return (
    <div className="video-card">
      <div className="video-thumb skeleton" />
      <div className="video-info">
        <div className="skeleton" style={{ height: 14, marginBottom: 8, borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 12, width: '60%', borderRadius: 4 }} />
      </div>
    </div>
  );
}

//  YouTube Not Configured 
function NotConfigured() {
  return (
    <div className="yt-not-configured">
      <AlertCircle size={36} className="yt-nc-icon" />
      <h3 className="yt-nc-title">YouTube Integration Not Configured</h3>
      <p className="yt-nc-desc">
        Add your <code>VITE_YOUTUBE_API_KEY</code> and <code>VITE_YOUTUBE_CHANNEL_ID</code> to a <code>.env</code> file to enable YouTube channel integration.
      </p>
      <Link to="/about" className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
        Setup Instructions →
      </Link>
    </div>
  );
}

//  Video Card 
function VideoCard({ video }) {
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="video-card"
      aria-label={`Watch: ${video.title}`}
    >
      <div className="video-thumb-wrap">
        {video.thumbnail
          ? <img src={video.thumbnail} alt="" className="video-thumb" loading="lazy" />
          : <div className="video-thumb video-thumb-placeholder"><Play size={32} /></div>
        }
        {video.duration && (
          <span className="video-duration">{formatDuration(video.duration)}</span>
        )}
        <div className="video-play-overlay" aria-hidden="true">
          <Play size={28} fill="currentColor" />
        </div>
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
  );
}

//  Main Home Page 
export default function Home() {
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isConfigured) { setLoading(false); return; }
    (async () => {
      try {
        const [ch, vids] = await Promise.all([getChannelInfo(), getLatestVideos({ maxResults: 8 })]);
        setChannel(ch);
        setVideos(vids.videos || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="page-wrapper fade-in" id="main-content">

      {/*  HERO  */}
      <section className="hero-section" aria-label="Channel introduction">
        <div className="container">
          <div className="hero-inner">
            <div className="hero-badge">
              <MonitorPlay size={14} aria-hidden="true" />
              <span>Islamic Reminders in Tamil</span>
            </div>

            <h1 className="hero-title">
              Peace Be Upon Him
            </h1>

            <p className="hero-subtitle">
              <span className="hero-sub-arabic arabic-text" dir="rtl">قُرْآن • حَدِيث • سُنَّة</span>
            </p>

            <p className="hero-desc">
              Authentic Islamic knowledge in Tamil — Quran, Hadith, Dua and Sunnah explained clearly for Tamil-speaking Muslims.
            </p>

            <div className="hero-actions">
              <a
                href={channel?.customUrl
                  ? `https://www.youtube.com/${channel.customUrl}`
                  : `https://www.youtube.com/channel/UCqqdcoMxWpjUltJExFyZ9AQ`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-lg"
                id="hero-watch-btn"
              >
                <MonitorPlay size={18} aria-hidden="true" />
                Watch on YouTube
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-lg"
                id="hero-instagram-btn"
              >
                <Camera size={18} aria-hidden="true" />
                Follow on Instagram
              </a>
            </div>
          </div>
        </div>
      </section>

      {/*  QUICK NAV  */}
      <section className="quick-nav-section" aria-label="Quick access to Islamic resources">
        <div className="container">
          <div className="quick-nav-grid">
            {[
              { to: '/quran', label: 'Quran', tamil: 'குர்ஆன்', arabic: 'قرآن', color: '#1a6b3a' },
              { to: '/hadith', label: 'Hadith', tamil: 'ஹதீஸ்', arabic: 'حديث', color: '#2980b9' },
              { to: '/dua', label: 'Dua', tamil: 'துஆ', arabic: 'دعاء', color: '#c8973a' },
              { to: '/dhikr', label: 'Dhikr', tamil: 'திக்ர்', arabic: 'ذكر', color: '#8e44ad' },
              { to: '/after-salah', label: 'After Salah', tamil: 'தொழுகைக்குப் பின்', arabic: 'بعد الصلاة', color: '#c0392b' },
              { to: '/explore', label: 'Explore', tamil: 'கண்டறி', arabic: 'استكشاف', color: '#16a085' },
              { to: '/library', label: 'Library', tamil: 'நூலகம்', arabic: 'مكتبة', color: '#e67e22' },
            ].map(({ to, label, tamil, arabic, color }) => (
              <Link key={to} to={to} className="quick-nav-card" id={`quick-nav-${label.toLowerCase()}`}>
                <span
                  className="quick-nav-arabic arabic-text"
                  dir="rtl"
                  style={{ color }}
                >
                  {arabic}
                </span>
                <span className="quick-nav-label">{label}</span>
                <span className="quick-nav-tamil tamil-text">{tamil}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/*  CHANNEL STATS  */}
      <section className="section" aria-label="Channel statistics">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Channel Statistics</h2>
              <p className="section-subtitle">Live data from YouTube</p>
            </div>
            {(channel?.customUrl || true) && (
              <a
                href={channel?.customUrl
                  ? `https://youtube.com/${channel.customUrl}`
                  : `https://www.youtube.com/channel/UCqqdcoMxWpjUltJExFyZ9AQ`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm"
              >
                <ExternalLink size={14} />
                Visit Channel
              </a>
            )}
          </div>

          {!isConfigured
            ? <NotConfigured />
            : loading
            ? (
              <div className="stats-grid">
                <StatSkeleton /><StatSkeleton /><StatSkeleton />
              </div>
            )
            : error
            ? (
              <div className="yt-error">
                <AlertCircle size={20} />
                <span>Unable to load channel data: {error}</span>
              </div>
            )
            : channel && (
              <div className="stats-grid">
                {!channel.hiddenSubscribers && channel.subscriberCount && (
                  <div className="stat-card">
                    <Users size={20} className="stat-icon" aria-hidden="true" />
                    <p className="stat-number">{formatCount(channel.subscriberCount)}</p>
                    <p className="stat-label">Subscribers</p>
                  </div>
                )}
                {channel.viewCount && (
                  <div className="stat-card">
                    <Eye size={20} className="stat-icon" aria-hidden="true" />
                    <p className="stat-number">{formatCount(channel.viewCount)}</p>
                    <p className="stat-label">Total Views</p>
                  </div>
                )}
                {channel.videoCount && (
                  <div className="stat-card">
                    <Video size={20} className="stat-icon" aria-hidden="true" />
                    <p className="stat-number">{formatCount(channel.videoCount)}</p>
                    <p className="stat-label">Videos</p>
                  </div>
                )}
              </div>
            )
          }
        </div>
      </section>

      {/*  LATEST VIDEOS  */}
      <section className="section" aria-label="Latest videos">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Latest Videos</h2>
              <p className="section-subtitle tamil-text" style={{ fontFamily: 'var(--font-tamil)' }}>
                புதிய வீடியோக்கள்
              </p>
            </div>
            <Link to="/youtube" className="btn btn-ghost btn-sm" id="view-all-videos">
              View all <ChevronRight size={14} />
            </Link>
          </div>

          {!isConfigured
            ? <NotConfigured />
            : loading
            ? (
              <div className="videos-grid">
                {Array(4).fill(0).map((_, i) => <VideoSkeleton key={i} />)}
              </div>
            )
            : error
            ? (
              <div className="yt-error">
                <AlertCircle size={20} />
                <span>Unable to load videos: {error}</span>
              </div>
            )
            : videos.length > 0
            ? <div className="videos-grid">{videos.map(v => <VideoCard key={v.id} video={v} />)}</div>
            : <div className="empty-state"><p className="empty-state-title">No videos available</p></div>
          }
        </div>
      </section>

      {/*  SOCIAL  */}
      <section className="section social-section" aria-label="Social media links">
        <div className="container">
          <div className="social-cards">
            <a
              href={`https://www.youtube.com/channel/${import.meta.env.VITE_YOUTUBE_CHANNEL_ID || '@NoorTamil'}`}
              target="_blank" rel="noopener noreferrer"
              className="social-card social-card-yt"
            >
              <MonitorPlay size={28} aria-hidden="true" />
              <div>
                <p className="social-card-name">YouTube</p>
                <p className="social-card-sub">Islamic Reminders in Tamil</p>
              </div>
              <ExternalLink size={16} className="social-card-arrow" />
            </a>
            <a
              href="https://www.instagram.com/NoorTamil"
              target="_blank" rel="noopener noreferrer"
              className="social-card social-card-ig"
            >
              <Camera size={28} aria-hidden="true" />
              <div>
                <p className="social-card-name">Instagram</p>
                <p className="social-card-sub">Daily Islamic reminders</p>
              </div>
              <ExternalLink size={16} className="social-card-arrow" />
            </a>
          </div>
        </div>
      </section>

    </main>
  );
}
