import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, BookOpen, MessageSquare, Heart, Loader } from 'lucide-react';
import { useSearch } from '../../context/AppContext';
import { searchQuran } from '../../services/quran';
import { fetchDuasData, searchDuas } from '../../services/dua';
import './GlobalSearch.css';

const QUICK_LINKS = [
  { label: 'Al-Fatiha', to: '/quran/1', type: 'Quran', icon: BookOpen },
  { label: 'Sahih al-Bukhari', to: '/hadith/bukhari', type: 'Collection', icon: MessageSquare },
  { label: 'Morning Adhkar', to: '/dua?category=morning', type: 'Dua', icon: Heart },
  { label: 'Parents', to: '/explore/parents', type: 'Topic', icon: null },
  { label: 'Youth & Iman', to: '/explore/youth', type: 'Topic', icon: null },
];

export default function GlobalSearch() {
  const { isOpen, close } = useSearch();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ quran: [], duas: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  const [allDuas, setAllDuas] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults({ quran: [], duas: [] });
      setTimeout(() => inputRef.current?.focus(), 50);
      
      // Lazily fetch duas for search
      if (!allDuas) {
        fetchDuasData().then(data => setAllDuas(data.duas || [])).catch(() => setAllDuas([]));
      }
    }
  }, [isOpen, allDuas]);

  const doSearch = useCallback(async (q) => {
    if (!q || q.length < 2) { setResults({ quran: [], duas: [] }); return; }
    setLoading(true);
    try {
      const duaSearchResults = allDuas ? searchDuas(allDuas, q) : [];
      const [quranRes, duaRes] = await Promise.allSettled([
        searchQuran(q),
        Promise.resolve({ results: duaSearchResults }),
      ]);
      setResults({
        quran: quranRes.status === 'fulfilled' ? (quranRes.value.results || []).slice(0, 5) : [],
        duas: duaRes.status === 'fulfilled' ? (duaRes.value.results || []).slice(0, 3) : [],
      });
    } finally {
      setLoading(false);
    }
  }, [allDuas]);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(query), 350);
    return () => clearTimeout(timerRef.current);
  }, [query, doSearch]);

  const go = (to) => { navigate(to); close(); };
  const hasResults = results.quran.length > 0 || results.duas.length > 0;

  if (!isOpen) return null;

  return (
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search">
      <div className="search-backdrop" onClick={close} aria-hidden="true" />
      <div className="search-modal">
        {/* Input */}
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search Quran, Hadith, Dua..."
            className="search-input"
            aria-label="Search"
            autoComplete="off"
            spellCheck={false}
          />
          {loading && <Loader size={16} className="search-spinner" aria-hidden="true" />}
          {!loading && query && (
            <button onClick={() => setQuery('')} className="search-clear" aria-label="Clear">
              <X size={15} />
            </button>
          )}
        </div>

        <div className="search-body">
          {!query && (
            <div className="search-quick">
              <p className="search-section-label">Quick Access</p>
              {QUICK_LINKS.map(({ label, to, type, icon: Icon }) => (
                <button key={to} className="search-result-item" onClick={() => go(to)}>
                  <div className="search-result-icon">
                    {Icon ? <Icon size={15} /> : <span style={{ fontSize: '12px' }}></span>}
                  </div>
                  <div>
                    <p className="search-result-title">{label}</p>
                    <p className="search-result-meta">{type}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {query && !loading && !hasResults && query.length >= 2 && (
            <div className="search-empty">
              <p>No results for "<strong>{query}</strong>"</p>
              <p className="search-empty-hint">Try searching in Tamil, English, or Arabic</p>
            </div>
          )}

          {hasResults && (
            <>
              {results.quran.length > 0 && (
                <div className="search-section">
                  <p className="search-section-label">Quran</p>
                  {results.quran.map((r, i) => (
                    <button
                      key={i}
                      className="search-result-item"
                      onClick={() => go(`/quran/${r.verse_key?.split(':')[0]}`)}
                    >
                      <div className="search-result-icon" style={{ background: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}>
                        <BookOpen size={14} />
                      </div>
                      <div>
                        <p className="search-result-title">{r.verse_key}</p>
                        <p className="search-result-excerpt">{r.text?.slice(0, 80)}...</p>
                      </div>
                    </button>
                  ))}
                  <button className="search-view-all" onClick={() => go(`/quran?q=${query}`)}>
                    View all Quran results →
                  </button>
                </div>
              )}

              {results.duas.length > 0 && (
                <div className="search-section">
                  <p className="search-section-label">Duas</p>
                  {results.duas.map((d) => (
                    <button
                      key={d.id}
                      className="search-result-item"
                      onClick={() => go(`/dua?category=${d.category}&id=${d.id}`)}
                    >
                      <div className="search-result-icon" style={{ background: 'var(--color-gold-subtle)', color: 'var(--color-gold)' }}>
                        <Heart size={14} />
                      </div>
                      <div>
                        <p className="search-result-title">{d.title}</p>
                        <p className="search-result-excerpt">{d.tamil}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer hint */}
        <div className="search-footer">
          <span className="search-hint-key">↑↓</span> navigate
          <span className="search-hint-key">↵</span> select
          <span className="search-hint-key">Esc</span> close
        </div>
      </div>
    </div>
  );
}
