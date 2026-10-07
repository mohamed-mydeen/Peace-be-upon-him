import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Bookmark, Copy, Share2, Filter, Heart } from 'lucide-react';
import { DUA_CATEGORIES, DUAS, searchDuas } from '../services/dua';
import { useBookmarks } from '../context/AppContext';
import './Dua.css';

export default function Dua() {
  const [searchParams, setSearchParams] = useSearchParams();
  const catParam = searchParams.get('category') || 'all';
  const queryParam = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(queryParam);
  const { isBookmarked, toggle: toggleBookmark } = useBookmarks();

  // Filter logic
  const filteredDuas = useMemo(() => {
    let result = DUAS;
    if (query) {
      result = searchDuas(query);
    }
    if (catParam !== 'all') {
      result = result.filter(d => d.category === catParam);
    }
    return result;
  }, [query, catParam]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(prev => {
      if (query) prev.set('q', query);
      else prev.delete('q');
      return prev;
    });
  };

  const setCategory = (catId) => {
    setSearchParams(prev => {
      if (catId === 'all') prev.delete('category');
      else prev.set('category', catId);
      return prev;
    });
  };

  return (
    <main className="page-wrapper fade-in" id="main-content">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Dua Library</h1>
          <p className="page-description tamil-text" style={{ fontFamily: 'var(--font-tamil)' }}>
            அன்றாட வாழ்க்கைக்கு தேவையான துஆக்கள்
          </p>
        </div>

        {/* Categories Bar */}
        <div className="dua-categories-wrapper">
          <div className="dua-categories">
            <button
              className={`dua-cat-btn${catParam === 'all' ? ' active' : ''}`}
              onClick={() => setCategory('all')}
            >
              All
            </button>
            {DUA_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className={`dua-cat-btn${catParam === cat.id ? ' active' : ''}`}
                onClick={() => setCategory(cat.id)}
              >
                <span>{cat.icon}</span> {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="dua-search-bar">
          <Search size={16} className="dua-search-icon" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search duas by title, meaning, or topic..."
            className="dua-search-input"
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

        {/* Results */}
        <div className="dua-list">
          {filteredDuas.length === 0 ? (
            <div className="empty-state">
              <Heart size={40} className="empty-state-icon" />
              <p className="empty-state-title">No duas found</p>
              <p className="empty-state-desc">Try searching with different words or categories.</p>
            </div>
          ) : (
            filteredDuas.map(dua => {
              const bk = isBookmarked('dua', dua.id);
              return (
                <article key={dua.id} className="dua-card card">
                  <div className="dua-card-header">
                    <div className="dua-title-wrap">
                      <h2 className="dua-title">{dua.title}</h2>
                      <span className="dua-tamil-title tamil-text">{dua.tamil}</span>
                    </div>
                    <div className="dua-actions">
                      <button
                        className={`btn-icon${bk ? ' active' : ''}`}
                        onClick={() => toggleBookmark({
                          type: 'dua',
                          id: dua.id,
                          title: dua.title,
                          subtitle: dua.meaning_tamil,
                          href: `/dua?category=${dua.category}#${dua.id}`
                        })}
                      >
                        <Bookmark size={16} fill={bk ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>

                  <p className="dua-arabic arabic-text arabic-md" dir="rtl">{dua.arabic}</p>
                  
                  {dua.transliteration && (
                    <div className="dua-translit">
                      <span className="trans-label">Transliteration</span>
                      <p>{dua.transliteration}</p>
                    </div>
                  )}

                  <div className="dua-meanings">
                    <div className="dua-meaning-tamil">
                      <span className="trans-label">பொருள்</span>
                      <p className="tamil-text">{dua.meaning_tamil}</p>
                    </div>
                    <div className="dua-meaning-english">
                      <span className="trans-label">Meaning</span>
                      <p>{dua.meaning_english}</p>
                    </div>
                  </div>

                  {dua.note && (
                    <div className="dua-note">
                      <strong>Note:</strong> {dua.note}
                    </div>
                  )}

                  <div className="dua-footer">
                    <span className="dua-ref">{dua.reference}</span>
                    <span className={`badge ${dua.grade.toLowerCase() === 'sahih' ? 'badge-sahih' : 'badge-unknown'}`}>
                      {dua.grade}
                    </span>
                    {dua.count > 1 && (
                      <span className="badge badge-primary">Repeat: {dua.count}x</span>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
