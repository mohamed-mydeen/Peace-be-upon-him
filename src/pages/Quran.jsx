import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Search, BookOpen, ChevronRight, ArrowLeft, Bookmark, Share2, Copy } from 'lucide-react';
import { getSurahs, getSurah, getAyahs } from '../services/quran';
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
                <span className="surah-arabic arabic-text" dir="rtl">{surah.name_arabic}</span>
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

  const copyAyah = (ayah) => {
    const text = ayah.translations?.find(t => t.resource_id === 819)?.text ||
                 ayah.translations?.[0]?.text || '';
    navigator.clipboard.writeText(`${ayah.verse_key} — ${text}`);
  };

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
            <h1 className="surah-detail-name arabic-text" dir="rtl">{surah.name_arabic}</h1>
            <p className="surah-detail-name-en">{surah.name_simple} — {surah.translated_name?.name}</p>

            {/* Bismillah (not for Al-Fatiha or At-Tawbah) */}
            {surah.id !== 1 && surah.id !== 9 && (
              <p className="bismillah arabic-text" dir="rtl">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
            )}

            {/* Bandar Baleela Audio Player */}
            <div className="surah-audio-player" style={{ marginTop: '1.5rem', background: 'var(--color-bg-card)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Recitation by <strong>Sheikh Bandar Baleela</strong></span>
              </p>
              <audio 
                controls 
                style={{ width: '100%', height: '40px', outline: 'none' }}
                src={`https://download.quranicaudio.com/quran/bandar_baleela/${String(surah.id).padStart(3, '0')}.mp3`}
                preload="none"
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
        )}

        {/* Ayahs */}
        <div className="ayahs-list">
          {loading
            ? Array(5).fill(0).map((_, i) => <AyahSkeleton key={i} />)
            : ayahs.map((ayah) => {
              const tamilTrans = ayah.translations?.find(t => t.resource_id === 133);
              const englishTrans = ayah.translations?.find(t => t.resource_id === 20);
              const bk = isBookmarked('ayah', ayah.verse_key);

              return (
                <article key={ayah.verse_key} className="ayah-card" id={`ayah-${ayah.verse_number}`}>
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
                  <p className="ayah-arabic arabic-text arabic-xl" dir="rtl" lang="ar">
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
          <div className="pagination">
            <button
              className="page-btn"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              aria-label="Previous page"
            >‹</button>
            <span className="page-btn active">{page} / {pagination.total_pages}</span>
            <button
              className="page-btn"
              disabled={page >= pagination.total_pages}
              onClick={() => setPage(p => p + 1)}
              aria-label="Next page"
            >›</button>
          </div>
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
