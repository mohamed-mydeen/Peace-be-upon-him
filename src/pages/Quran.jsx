import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, ArrowLeft, Bookmark, Copy, Play } from 'lucide-react';
import { getSurahs, getSurah, getAyahs, getSurahAyahAudio } from '../services/quran';
import { useBookmarks } from '../context/AppContext';
import './Quran.css';

//  Skeleton 
function SurahSkeleton() {
  return (
    <div className="surah-row skeleton-row">
      <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 8 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: 14, width: '50%', marginBottom: 6, borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 12, width: '30%', borderRadius: 4 }} />
      </div>
    </div>
  );
}

function AyahSkeleton() {
  return (
    <div className="ayah-card" style={{ opacity: 0.5 }}>
      <div className="skeleton" style={{ height: 40, marginBottom: 12, borderRadius: 4 }} />
      <div className="skeleton" style={{ height: 14, width: '80%', marginBottom: 8, borderRadius: 4 }} />
      <div className="skeleton" style={{ height: 12, width: '60%', borderRadius: 4 }} />
    </div>
  );
}

//  Surah List 
function SurahList() {
  const [surahs, setSurahs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getSurahs()
      .then(data => { setSurahs(data); setFiltered(data); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!query.trim()) { setFiltered(surahs); return; }
    const q = query.toLowerCase();
    setFiltered(surahs.filter(s =>
      s.name_simple?.toLowerCase().includes(q) ||
      s.name_arabic?.includes(query) ||
      s.translated_name?.name?.toLowerCase().includes(q) ||
      String(s.id) === query.trim()
    ));
  }, [query, surahs]);

  if (error) return (
    <div className="quran-error">
      <p>Unable to load Quran data. Please check your internet connection.</p>
      <p className="error-detail">{error}</p>
    </div>
  );

  return (
    <main className="page-wrapper fade-in" id="main-content">
      <div className="container">
        <div className="quran-header">
          <div>
            <h1 className="page-title">القرآن الكريم</h1>
            <p className="page-description">The Holy Quran • 114 Surahs • Tamil & English Translations</p>
          </div>
          <div className="quran-revelation-types">
            <span className="badge badge-primary">Makki</span>
            <span className="badge badge-gold">Madani</span>
          </div>
        </div>

        {/* Search */}
        <div className="quran-search-wrap">
          <Search size={16} className="quran-search-icon" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search Surah by name or number..."
            className="quran-search"
            aria-label="Search Surahs"
          />
        </div>

        {/* Surah list */}
        <div className="surah-list" role="list" aria-label="List of Surahs">
          {loading
            ? Array(20).fill(0).map((_, i) => <SurahSkeleton key={i} />)
            : filtered.length === 0
            ? <p className="empty-state-title" style={{ padding: '2rem 0' }}>No Surah found</p>
            : filtered.map(surah => (
              <Link
                key={surah.id}
                to={`/quran/${surah.id}`}
                className="surah-row"
                role="listitem"
                aria-label={`Surah ${surah.name_simple}`}
              >
                <div className="surah-number">
                  <span>{surah.id}</span>
                </div>
                <div className="surah-info">
                  <div className="surah-name-row">
                    <span className="surah-name-en">{surah.name_simple}</span>
                    <span className="surah-meaning">{surah.translated_name?.name}</span>
                  </div>
                  <div className="surah-meta-row">
                    <span className={`badge badge-sm ${surah.revelation_place === 'makkah' ? 'badge-primary' : 'badge-gold'}`}>
                      {surah.revelation_place === 'makkah' ? 'Makki' : 'Madani'}
                    </span>
                    <span className="surah-ayah-count">{surah.verses_count} Ayahs</span>
                  </div>
                </div>
                <span className="surah-arabic arabic-text notranslate" dir="rtl" translate="no">{surah.name_arabic}</span>
                <ChevronRight size={16} className="surah-arrow" aria-hidden="true" />
              </Link>
            ))
          }
        </div>

        <p className="quran-attribution">
          Arabic text and translations provided by <a href="https://quran.com" target="_blank" rel="noopener noreferrer">Quran.com</a>. Tamil translation: Abdul Hameed Baqavi.
        </p>
      </div>
    </main>
  );
}

//  Surah Detail 
function SurahDetail({ surahId }) {
  const [surah, setSurah] = useState(null);
  const [ayahs, setAyahs] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isBookmarked, toggle: toggleBookmark } = useBookmarks();

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioTracks, setAudioTracks] = useState([]);
  const [playingIndex, setPlayingIndex] = useState(-1);
  const [audioLoading, setAudioLoading] = useState(true);
  const [audioError, setAudioError] = useState('');
  const audioRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    Promise.all([getSurah(surahId), getAyahs(surahId, { page })])
      .then(([s, { verses, pagination: pg }]) => {
        setSurah(s);
        setAyahs(verses);
        setPagination(pg);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [surahId, page]);

  useEffect(() => {
    let cancelled = false;
    setAudioTracks([]);
    setPlayingIndex(-1);
    setIsPlaying(false);
    setAudioError('');
    setAudioLoading(true);
    getSurahAyahAudio(surahId)
      .then(tracks => { if (!cancelled) setAudioTracks(tracks); })
      .catch(e => {
        if (!cancelled) setAudioError(e.message);
      })
      .finally(() => {
        if (!cancelled) setAudioLoading(false);
      });

    return () => {
      cancelled = true;
      audioRef.current?.pause();
    };
  }, [surahId]);

  const copyAyah = (ayah) => {
    const text = ayah.translations?.find(t => t.resource_id === 819)?.text ||
                 ayah.translations?.[0]?.text || '';
    navigator.clipboard.writeText(`${ayah.verse_key} — ${text}`);
  };

  // Audio Controls
  const playAudioAt = (index) => {
    const track = audioTracks[index];
    const audio = audioRef.current;
    if (!track || !audio) return;
    const ayahNumber = Number(track.verseKey.split(':')[1]);
    const trackPage = Math.floor((ayahNumber - 1) / 10) + 1;
    if (trackPage !== page) setPage(trackPage);
    setPlayingIndex(index);
    setAudioError('');
    audio.src = track.url;
    audio.play().catch(e => {
      setAudioError(`Unable to play Ayah ${track.verseKey}: ${e.message}`);
      setIsPlaying(false);
    });
  };

  const togglePlay = () => {
    if (!audioRef.current || audioLoading || audioTracks.length === 0) return;
    if (isPlaying) {
      audioRef.current.pause();
      return;
    }
    playAudioAt(playingIndex < 0 ? 0 : playingIndex);
  };

  const handleAudioEnded = () => {
    if (playingIndex + 1 < audioTracks.length) playAudioAt(playingIndex + 1);
    else {
      setPlayingIndex(-1);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (playingIndex < 0) return;
    const verseKey = audioTracks[playingIndex]?.verseKey;
    const ayahNumber = Number(verseKey?.split(':')[1]);
    const activePage = Math.floor((ayahNumber - 1) / 10) + 1;
    const activeAyah = ayahs.find(ayah => ayah.verse_key === verseKey);
    if (activeAyah) {
      document.getElementById(`ayah-${activeAyah.verse_number}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (verseKey && !ayahs.some(ayah => ayah.verse_key === verseKey) && page !== activePage) {
      setPage(activePage);
    }
  }, [playingIndex, audioTracks, ayahs, page]);

  if (error) return (
    <main className="page-wrapper"><div className="container">
      <p className="quran-error">{error}</p>
    </div></main>
  );

  return (
    <main className="page-wrapper fade-in" id="main-content">
      <div className="container">
        {/* Back */}
        <Link to="/quran" className="back-link">
          <ArrowLeft size={16} /> All Surahs
        </Link>

        {/* Surah header */}
        {surah && (
          <div className="surah-detail-header">
            <div className="surah-detail-meta">
              <span className="badge badge-primary">Surah {surah.id}</span>
              <span className={`badge ${surah.revelation_place === 'makkah' ? 'badge-primary' : 'badge-gold'}`}>
                {surah.revelation_place === 'makkah' ? 'Makki' : 'Madani'}
              </span>
              <span className="badge badge-unknown">{surah.verses_count} Ayahs</span>
            </div>
            <h1 className="surah-detail-name arabic-text notranslate" dir="rtl" translate="no">{surah.name_arabic}</h1>
            <p className="surah-detail-name-en">{surah.name_simple} — {surah.translated_name?.name}</p>

            {/* Bismillah (not for Al-Fatiha or At-Tawbah) */}
            {surah.id !== 1 && surah.id !== 9 && (
              <p className="bismillah arabic-text notranslate" dir="rtl" translate="no">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
            )}

            {/* Ayah-by-Ayah Audio Player */}
            <div className="surah-audio-player" style={{ marginTop: '1.5rem', background: 'var(--color-bg-card)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>Recitation: Mishari Rashid al-Afasy</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  {audioLoading ? 'Loading recitation...' : playingIndex >= 0 ? `Playing Ayah ${audioTracks[playingIndex]?.verseKey}` : 'Ayah-by-Ayah Recitation'}
                </p>
              </div>
              <button 
                className="btn btn-primary" 
                onClick={togglePlay}
                disabled={audioTracks.length === 0 || audioLoading}
                aria-label={isPlaying ? 'Pause recitation' : 'Play recitation'}
                style={{ borderRadius: '50%', width: '48px', height: '48px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {isPlaying ? (
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                ) : (
                  <Play fill="currentColor" size={24} />
                )}
              </button>
            </div>
            {audioError && <p className="error-detail" role="alert">{audioError}</p>}
            
            {/* Hidden audio element */}
            <audio 
              ref={audioRef}
              onEnded={handleAudioEnded}
              onPause={() => setIsPlaying(false)}
              onPlay={() => {
                setIsPlaying(true);
                setAudioError('');
              }}
              onError={() => {
                const audioErrorCode = audioRef.current?.error?.code;
                if (audioErrorCode) {
                  setAudioError(`Recitation audio failed to load (media error ${audioErrorCode}).`);
                  setIsPlaying(false);
                }
              }}
              preload="none"
            />
          </div>
        )}

        {/* Ayahs */}
        <div className="ayahs-list">
          {loading
            ? Array(5).fill(0).map((_, i) => <AyahSkeleton key={i} />)
            : ayahs.map(ayah => {
              const tamilTrans = ayah.translations?.find(t => t.resource_id === 133);
              const englishTrans = ayah.translations?.find(t => t.resource_id === 20);
              const bk = isBookmarked('ayah', ayah.verse_key);
              const isAyahPlaying = audioTracks[playingIndex]?.verseKey === ayah.verse_key;

              return (
                <article 
                  key={ayah.verse_key} 
                  className={`ayah-card ${isAyahPlaying ? 'playing-highlight' : ''}`}
                  id={`ayah-${ayah.verse_number}`}
                  style={isAyahPlaying ? { borderColor: 'var(--color-primary)', boxShadow: '0 4px 12px rgba(26, 107, 58, 0.15)', transform: 'scale(1.02)', transition: 'all 0.3s ease' } : { transition: 'all 0.3s ease' }}
                >
                  <div className="ayah-top">
                    <span className="ayah-number" aria-label={`Ayah ${ayah.verse_number}`}>
                      {ayah.verse_number}
                    </span>
                    <div className="ayah-actions">
                      <button
                        className={`btn-icon${bk ? ' active' : ''}`}
                        onClick={() => toggleBookmark({
                          type: 'ayah', id: ayah.verse_key,
                          title: `Quran ${ayah.verse_key}`,
                          subtitle: englishTrans?.text?.slice(0, 80),
                          href: `/quran/${surahId}#ayah-${ayah.verse_number}`,
                        })}
                        aria-label={bk ? 'Remove bookmark' : 'Bookmark ayah'}
                        title={bk ? 'Remove bookmark' : 'Bookmark'}
                      >
                        <Bookmark size={15} fill={bk ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => copyAyah(ayah)}
                        aria-label="Copy ayah"
                        title="Copy"
                      >
                        <Copy size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Arabic */}
                  <p className="ayah-arabic arabic-text arabic-xl notranslate" dir="rtl" translate="no" lang="ar">
                    {ayah.text_uthmani}
                  </p>

                  {/* Tamil translation */}
                  {tamilTrans && (
                    <div className="ayah-translation ayah-tamil">
                      <span className="trans-label">தமிழ்</span>
                      <p
                        className="tamil-text"
                        dangerouslySetInnerHTML={{ __html: tamilTrans.text }}
                        lang="ta"
                      />
                    </div>
                  )}

                  {/* English translation */}
                  {englishTrans && (
                    <div className="ayah-translation ayah-english">
                      <span className="trans-label">English</span>
                      <p dangerouslySetInnerHTML={{ __html: englishTrans.text }} lang="en" />
                    </div>
                  )}

                  <p className="ayah-ref">Quran {ayah.verse_key}</p>
                </article>
              );
            })
          }
        </div>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <nav className="pagination" aria-label="Surah pages">
            <button
              className="page-btn"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              aria-label="Previous page"
            ><ChevronLeft size={18} strokeWidth={2.5} /></button>
            <span className="pagination-current" aria-live="polite">
              {page} <span aria-hidden="true">/</span> {pagination.total_pages}
            </span>
            <button
              className="page-btn"
              disabled={page >= pagination.total_pages}
              onClick={() => setPage(p => p + 1)}
              aria-label="Next page"
            ><ChevronRight size={18} strokeWidth={2.5} /></button>
          </nav>
        )}

        <p className="quran-attribution">
          Arabic text and translations from <a href="https://quran.com" target="_blank" rel="noopener noreferrer">Quran.com</a>. Tamil: Abdul Hameed Baqavi. English: Saheeh International.
        </p>
      </div>
    </main>
  );
}

//  Router 
export function QuranIndex() { return <SurahList />; }
export function QuranSurah() {
  const { id } = useParams();
  return <SurahDetail surahId={id} />;
}
