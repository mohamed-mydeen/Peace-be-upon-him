import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, MessageSquare, Hand, Hexagon, BookMarked, Library,
  Camera, Play, Users, Eye, Video,
  ChevronRight, AlertCircle
} from 'lucide-react';
import {
  getChannelInfo, getLatestVideos, formatCount, formatRelativeDate, formatDuration, isConfigured
} from '../services/youtube';
import PrayerTimes from '../components/prayer/PrayerTimes';
import './Home.css';

/* ── Skeleton helpers ── */
function StatSkeleton() {
  return (
    <div className="hm-stat-card">
      <div className="skeleton" style={{ width: 40, height: 20, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: 60, height: 12 }} />
    </div>
  );
}

function VideoSkeleton() {
  return (
    <div className="hm-video-row">
      <div className="hm-video-thumb skeleton" />
      <div className="hm-video-info">
        <div className="skeleton" style={{ height: 13, marginBottom: 8, borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 11, width: '55%', borderRadius: 4 }} />
      </div>
    </div>
  );
}

function NotConfigured() {
  return (
    <div className="yt-not-configured">
      <AlertCircle size={36} className="yt-nc-icon" />
      <h3 className="yt-nc-title">YouTube Integration Not Configured</h3>
      <p className="yt-nc-desc">
        Add <code>VITE_YOUTUBE_CHANNEL_ID</code> to your Vercel Environment Variables (and <code>YOUTUBE_API_KEY</code>) to enable YouTube channel integration.
      </p>
      <Link to="/about" className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
        Setup Instructions →
      </Link>
    </div>
  );
}

/* ── Video Card ── */
function VideoCard({ video }) {
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="hm-video-row"
      aria-label={`Watch: ${video.title}`}
    >
      <div className="hm-video-thumb-wrap">
        {video.thumbnail
          ? <img src={video.thumbnail} alt="" className="hm-video-thumb" loading="lazy" />
          : <div className="hm-video-thumb hm-video-thumb-placeholder"><Play size={24} /></div>
        }
        {video.duration && (
          <span className="hm-video-duration">{formatDuration(video.duration)}</span>
        )}
      </div>
      <div className="hm-video-info">
        <h4 className="hm-video-title">
          {video.title ? video.title.replace(/#\S+/g, '').replace(/\s+/g, ' ').trim() : ''}
        </h4>
        <div className="hm-video-meta">
          {video.viewCount && <span>{formatCount(video.viewCount)} views</span>}
          {video.viewCount && video.publishedAt && <span>•</span>}
          {video.publishedAt && <span>{formatRelativeDate(video.publishedAt)}</span>}
        </div>
      </div>
    </a>
  );
}

/* ── Feature items config ── */
const FEATURES = [
  { to: '/quran',       label: 'Quran',       tamil: 'குர்ஆன்',          arabic: 'قرآن',      icon: BookOpen,    accentColor: '#e9a825' },
  { to: '/hadith',      label: 'Hadith',      tamil: 'ஹதீஸ்',            arabic: 'حديث',      icon: MessageSquare, accentColor: '#df94be' },
  { to: '/dua',         label: 'Dua',         tamil: 'துஆ',              arabic: 'دعاء',      icon: Hand,        accentColor: '#6de0b0' },
  { to: '/dhikr',       label: 'Dhikr',       tamil: 'திக்ர்',           arabic: 'ذكر',       icon: Hexagon,     accentColor: '#f3ca56' },
  { to: '/after-salah', label: 'After Salah', tamil: 'தொழுகைக்குப் பின்', arabic: 'بعد الصلاة', icon: BookMarked,  accentColor: '#9fd7bb' },
  { to: '/library',     label: 'Library',     tamil: 'நூலகம்',           arabic: 'مكتبة',     icon: Library,     accentColor: '#86baa5' },
];

/* ══════════════════════════════════════════════════
   MAIN HOME PAGE
══════════════════════════════════════════════════ */
export default function Home() {
  const [channel, setChannel] = useState(null);
  const [videos, setVideos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!isConfigured) { setLoading(false); return; }
    (async () => {
      try {
        const [ch, vids] = await Promise.all([getChannelInfo(), getLatestVideos({ maxResults: 4 })]);
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
    <main className="hm-page fade-in" id="main-content">

      {/* ── HERO BANNER ── */}
      <section className="hm-hero" aria-label="Channel introduction">
        {/* Decorative background icon */}
        <span className="hm-hero-bg-icon" aria-hidden="true">📖</span>

        <div className="hm-hero-inner">
          <div className="hm-hero-pill arabic-text notranslate" dir="rtl" translate="no">
            قُرْآن • حَدِيث • سُنَّة
          </div>
          <h1 className="hm-hero-title">Peace Be Upon Him</h1>
          <p className="hm-hero-desc">
            Authentic Islamic knowledge in Tamil — Quran, Hadith, Dua and Sunnah explained clearly for Tamil-speaking Muslims.
          </p>
          <div className="hm-hero-actions">
            <a
              href={channel?.customUrl
                ? `https://www.youtube.com/${channel.customUrl}`
                : `https://www.youtube.com/channel/UCqqdcoMxWpjUltJExFyZ9AQ`}
              target="_blank"
              rel="noopener noreferrer"
              className="hm-btn-yt"
              id="hero-watch-btn"
            >
              <Play size={15} aria-hidden="true" fill="currentColor" />
              Watch on YouTube
            </a>
            <a
              href="https://www.instagram.com/peace_be_upon_him__?stkn=MW5uY2RrNWZqbXc1Ng=="
              target="_blank"
              rel="noopener noreferrer"
              className="hm-btn-ig"
              id="hero-instagram-btn"
            >
              <Camera size={15} aria-hidden="true" />
              Instagram
            </a>
          </div>
        </div>
      </section>

      {/* ── PRAYER TIMES ── */}
      <section className="hm-section" aria-label="Prayer Times">
        <PrayerTimes />
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="hm-section" aria-label="Quick access to Islamic resources">
        <div className="hm-section-header">
          <h2 className="hm-section-title">Features</h2>
          <span className="hm-section-sub tamil-text">அம்சங்கள்</span>
        </div>
        <div className="hm-features-grid">
          {FEATURES.map(({ to, label, tamil, arabic, icon: Icon, accentColor }) => (
            <Link key={to} to={to} className="hm-feature-card" id={`feature-${label.toLowerCase()}`}>
              <div className="hm-feature-icon-wrap" style={{ '--feature-accent': accentColor }}>
                <Icon size={20} aria-hidden="true" />
              </div>
              <div className="hm-feature-text">
                <div className="hm-feature-name">
                  {label}
                  <span className="hm-feature-arabic arabic-text notranslate" dir="rtl" translate="no" style={{ color: accentColor }}>
                    {arabic}
                  </span>
                </div>
                <div className="hm-feature-tamil tamil-text">{tamil}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CHANNEL STATS ── */}
      <section className="hm-section" aria-label="Channel statistics">
        <div className="hm-section-header">
          <div>
            <h2 className="hm-section-title">Channel Statistics</h2>
            <p className="hm-section-sub">Live data from YouTube</p>
          </div>
          <a
            href={channel?.customUrl
              ? `https://youtube.com/${channel.customUrl}`
              : `https://www.youtube.com/channel/UCqqdcoMxWpjUltJExFyZ9AQ`}
            target="_blank"
            rel="noopener noreferrer"
            className="hm-link-sm"
          >
            Visit Channel <ChevronRight size={12} />
          </a>
        </div>

        {!isConfigured
          ? <NotConfigured />
          : loading
          ? (
            <div className="hm-stats-wrap">
              <div className="hm-stats-grid">
                <StatSkeleton /><StatSkeleton /><StatSkeleton />
              </div>
            </div>
          )
          : error
          ? (
            <div className="yt-error">
              <AlertCircle size={20} /><span>{error}</span>
            </div>
          )
          : channel && (
            <div className="hm-stats-wrap">
              <div className="hm-stats-grid">
                {!channel.hiddenSubscribers && channel.subscriberCount && (
                  <div className="hm-stat-card">
                    <Users size={18} className="hm-stat-icon" aria-hidden="true" />
                    <p className="hm-stat-number">{formatCount(channel.subscriberCount)}</p>
                    <p className="hm-stat-label">Subscribers</p>
                  </div>
                )}
                {channel.viewCount && (
                  <div className="hm-stat-card">
                    <Eye size={18} className="hm-stat-icon" aria-hidden="true" />
                    <p className="hm-stat-number">{formatCount(channel.viewCount)}</p>
                    <p className="hm-stat-label">Total Views</p>
                  </div>
                )}
                {channel.videoCount && (
                  <div className="hm-stat-card">
                    <Video size={18} className="hm-stat-icon" aria-hidden="true" />
                    <p className="hm-stat-number">{formatCount(channel.videoCount)}</p>
                    <p className="hm-stat-label">Videos</p>
                  </div>
                )}
              </div>
            </div>
          )
        }
      </section>

      {/* ── LATEST VIDEOS ── */}
      <section className="hm-section" aria-label="Latest videos">
        <div className="hm-section-header">
          <div>
            <h2 className="hm-section-title">Latest Videos</h2>
            <p className="hm-section-sub tamil-text">புதிய வீடியோக்கள்</p>
          </div>
          <Link to="/youtube" className="hm-link-sm" id="view-all-videos">
            View all <ChevronRight size={12} />
          </Link>
        </div>

        {!isConfigured
          ? <NotConfigured />
          : loading
          ? (
            <div className="hm-videos-list">
              {Array(3).fill(0).map((_, i) => <VideoSkeleton key={i} />)}
            </div>
          )
          : error
          ? (
            <div className="yt-error">
              <AlertCircle size={20} /><span>{error}</span>
            </div>
          )
          : videos.length > 0
          ? <div className="hm-videos-list">{videos.map(v => <VideoCard key={v.id} video={v} />)}</div>
          : <div className="empty-state"><p className="empty-state-title">No videos available</p></div>
        }
      </section>

    </main>
  );
}
