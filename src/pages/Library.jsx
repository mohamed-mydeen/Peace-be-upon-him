import { Link } from 'react-router-dom';
import { Library as LibraryIcon, Bookmark, Trash2, ExternalLink } from 'lucide-react';
import { useBookmarks } from '../context/AppContext';

export default function Library() {
  const { bookmarks, remove } = useBookmarks();

  const quranBookmarks = bookmarks.filter(b => b.type === 'ayah');
  const hadithBookmarks = bookmarks.filter(b => b.type === 'hadith');
  const duaBookmarks = bookmarks.filter(b => b.type === 'dua');

  return (
    <main className="page-wrapper fade-in" id="main-content">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="page-header text-center" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: '16px', background: 'var(--color-primary-subtle)', borderRadius: '50%', marginBottom: '16px', color: 'var(--color-primary)' }}>
            <LibraryIcon size={32} />
          </div>
          <h1 className="page-title">My Library</h1>
          <p className="page-description tamil-text" style={{ fontFamily: 'var(--font-tamil)' }}>
            சேமிக்கப்பட்ட குர்ஆன், ஹதீஸ் மற்றும் துஆக்கள்
          </p>
        </div>

        {bookmarks.length === 0 ? (
          <div className="empty-state">
            <Bookmark size={40} className="empty-state-icon" />
            <p className="empty-state-title">Your library is empty</p>
            <p className="empty-state-desc">Save your favorite Ayahs, Hadiths, and Duas to read them later.</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <Link to="/quran" className="btn btn-secondary btn-sm">Browse Quran</Link>
              <Link to="/hadith" className="btn btn-secondary btn-sm">Browse Hadith</Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            {/* Quran */}
            {quranBookmarks.length > 0 && (
              <section>
                <h2 className="section-title" style={{ marginBottom: '1rem' }}>Saved Ayahs ({quranBookmarks.length})</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {quranBookmarks.map(b => (
                    <div key={b.id} className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>{b.title}</h3>
                        <p 
                          style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}
                          dangerouslySetInnerHTML={{ __html: b.subtitle }}
                        />
                        <Link to={b.href} className="btn btn-ghost btn-sm" style={{ padding: 0 }}>
                          Read full Ayah <ExternalLink size={14} />
                        </Link>
                      </div>
                      <button className="btn-icon" onClick={() => remove(b.type, b.id)} aria-label="Remove">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Hadith */}
            {hadithBookmarks.length > 0 && (
              <section>
                <h2 className="section-title" style={{ marginBottom: '1rem' }}>Saved Hadith ({hadithBookmarks.length})</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {hadithBookmarks.map(b => (
                    <div key={b.id} className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>{b.title}</h3>
                        <p 
                          className="arabic-text notranslate" 
                          dir="rtl" 
                          translate="no" 
                          style={{ fontSize: '1.2rem', color: 'var(--color-primary)', marginBottom: '1rem' }}
                          dangerouslySetInnerHTML={{ __html: b.subtitle }}
                        />
                        <Link to={b.href} className="btn btn-ghost btn-sm" style={{ padding: 0 }}>
                          Read full Hadith <ExternalLink size={14} />
                        </Link>
                      </div>
                      <button className="btn-icon" onClick={() => remove(b.type, b.id)} aria-label="Remove">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Dua */}
            {duaBookmarks.length > 0 && (
              <section>
                <h2 className="section-title" style={{ marginBottom: '1rem' }}>Saved Duas ({duaBookmarks.length})</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {duaBookmarks.map(b => (
                    <div key={b.id} className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-gold)', marginBottom: '0.5rem' }}>{b.title}</h3>
                        <p 
                          className="tamil-text" 
                          style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}
                          dangerouslySetInnerHTML={{ __html: b.subtitle }}
                        />
                        <Link to={b.href} className="btn btn-ghost btn-sm" style={{ padding: 0 }}>
                          Read full Dua <ExternalLink size={14} />
                        </Link>
                      </div>
                      <button className="btn-icon" onClick={() => remove(b.type, b.id)} aria-label="Remove">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
