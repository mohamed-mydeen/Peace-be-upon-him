import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Search, ArrowLeft, Bookmark, AlertCircle } from 'lucide-react';
import { GRADES, getCollection, getCollections, getHadiths, getHadith, getHadithsForTopic, getTopics, getBooks, searchHadiths } from '../services/hadith';
import { useBookmarks } from '../context/AppContext';
import './Hadith.css';

//  Grade badge 
function GradeBadge({ grade }) {
  const g = grade?.toLowerCase();
  const cfg = GRADES[g] || GRADES.unknown;
  return <span className={`badge ${cfg.badge}`}>{cfg.label}</span>;
}

//  Collection list 
function CollectionList() {
  const [collections, setCollections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getCollections(), getTopics()])
      .then(([collectionRows, topicRows]) => {
        setCollections(collectionRows);
        setCategories(topicRows);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="page-wrapper fade-in" id="main-content">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title tamil-text" style={{ fontFamily: 'var(--font-tamil)' }}>ஹதீஸ் தொகுப்புகள்</h1>
          <p className="page-description tamil-text" style={{ fontFamily: 'var(--font-tamil)' }}>
            நம்பகமான ஹதீஸ் சேகரிப்புகள் — குத்துப் அஸ்-ஸித்தா
          </p>
        </div>

        {/* Collections grid */}
        {error && <div className="empty-state"><p className="empty-state-desc">{error}</p></div>}
        {!error && loading ? <div className="hadiths-list">{Array(3).fill(0).map((_, i) => <HadithSkeleton key={i} />)}</div> : null}
        {!error && !loading && collections.length === 0 && (
          <div className="empty-state"><p className="empty-state-title">No published collections yet</p><p className="empty-state-desc">Authentic collection records will appear here when an editor imports and publishes them.</p></div>
        )}
        <div className="collections-grid">
          {collections.map(col => (
            <Link key={col.id} to={`/hadith/${col.slug}`} className="collection-card card card-hover">
              <div className="collection-card-inner">
                <div className="collection-arabic arabic-text" dir="rtl">{col.arabic_name || col.arabicName}</div>
                <h2 className="collection-name">{col.name}</h2>
                <p className="collection-author">{col.author}</p>
                <p className="collection-desc">{col.description}</p>
                <div className="collection-footer">
                  <GradeBadge grade={col.grade} />
                  <span className="collection-count">{col.total?.toLocaleString()} ஹதீஸ்கள்</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Category browse */}
        <div className="hadith-section-header">
          <h2 className="section-title tamil-text" style={{ fontFamily: 'var(--font-tamil)' }}>தலைப்பு வாரியாக படிக்க</h2>
          <p className="section-subtitle tamil-text" style={{ fontFamily: 'var(--font-tamil)' }}>எளிதாக கண்டறிய தமிழ் தலைப்புகள்</p>
        </div>
        <div className="categories-grid">
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/hadith/categories/${cat.slug}`}
              className="category-card"
              style={{ '--cat-color': cat.color }}
            >
              <span className="category-icon">{cat.icon}</span>
              <span className="category-name">{cat.name}</span>
              <span className="category-tamil tamil-text">{cat.tamil}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

//  Collection detail 
function CollectionDetail({ collectionId }) {
  const [col, setCol] = useState(null);
  const [collectionLoading, setCollectionLoading] = useState(true);
  const [hadiths, setHadiths] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTab, setActiveTab] = useState('hadiths'); // 'hadiths' | 'books'
  const { isBookmarked, toggle: toggleBookmark } = useBookmarks();

  useEffect(() => {
    setCollectionLoading(true);
    getCollection(collectionId)
      .then(async result => {
        setCol(result);
        if (result) setBooks(await getBooks(result.id));
      })
      .catch(e => setError(e.message))
      .finally(() => setCollectionLoading(false));
  }, [collectionId]);

  useEffect(() => {
    if (!col) return;
    setLoading(true);
    getHadiths(col.id, { page, limit: 20 })
      .then(data => { setHadiths(data.hadiths || []); setTotalPages(data.totalPages); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [col, page]);

  if (collectionLoading) return <main className="page-wrapper"><div className="container"><div className="hadiths-list"><HadithSkeleton /></div></div></main>;
  if (!col) return (
    <main className="page-wrapper"><div className="container">
      <div className="empty-state"><p className="empty-state-title">Collection not found</p></div>
    </div></main>
  );

  return (
    <main className="page-wrapper fade-in" id="main-content">
      <div className="container">
        <Link to="/hadith" className="back-link"><ArrowLeft size={16} /> Collections</Link>

        <div className="collection-detail-header">
          <div className="coll-detail-arabic arabic-text" dir="rtl">{col.arabic_name || col.arabicName}</div>
          <h1 className="coll-detail-name">{col.name}</h1>
          <p className="coll-detail-author">{col.author}</p>
          <p className="coll-detail-desc">{col.description}</p>
          <div className="coll-detail-meta">
            <GradeBadge grade={col.grade} />
            <span className="badge badge-unknown">{col.total?.toLocaleString()} ஹதீஸ்கள்</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="hadith-tabs">
          <button
            className={`hadith-tab${activeTab === 'hadiths' ? ' active' : ''}`}
            onClick={() => setActiveTab('hadiths')}
          >ஹதீஸ்கள்</button>
          {books.length > 0 && (
            <button
              className={`hadith-tab${activeTab === 'books' ? ' active' : ''}`}
              onClick={() => setActiveTab('books')}
            >நூல்கள் ({books.length})</button>
          )}
        </div>

        {activeTab === 'books' && books.length > 0 && (
          <div className="books-list">
            {books.map(book => (
              <div key={book.id} className="book-row card">
                <div className="book-number">{book.number}</div>
                <div className="book-info">
                  <div className="book-name">{book.name}</div>
                  <div className="book-arabic arabic-text" dir="rtl">{book.arabicName}</div>
                </div>
                {book.count && <span className="book-count">{book.count} ஹதீஸ்கள்</span>}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'hadiths' && (
          <>
            {error && (
              <div className="hadith-error">
                <AlertCircle size={18} />
                <div>
                  <p>Unable to load hadiths.</p>
                  <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: 4 }}>{error}</p>
                </div>
              </div>
            )}

            {loading
              ? <div className="hadiths-list">{Array(5).fill(0).map((_, i) => <HadithSkeleton key={i} />)}</div>
              : (
                <div className="hadiths-list">
                  {hadiths.map((hadith, i) => {
                    const bk = isBookmarked('hadith', hadith.id);
                    return (
                      <article key={hadith.number || i} className="hadith-card card">
                        <div className="hadith-card-top">
                          <div className="hadith-num-badge">
                            #{hadith.number}
                          </div>
                          <div className="hadith-card-actions">
                            <GradeBadge grade={col.grade === 'Sahih' ? 'sahih' : 'mixed'} />
                            <button
                              className={`btn-icon${bk ? ' active' : ''}`}
                              onClick={() => toggleBookmark({
                                type: 'hadith',
                                id: hadith.id,
                                title: `${col.name} #${hadith.number}`,
                                subtitle: hadith.arab?.slice(0, 80),
                                href: `/hadith/${collectionId}/${hadith.number}`,
                              })}
                              aria-label={bk ? 'Remove bookmark' : 'Save hadith'}
                            >
                              <Bookmark size={15} fill={bk ? 'currentColor' : 'none'} />
                            </button>
                          </div>
                        </div>

                        {hadith.arab && (
                          <p className="hadith-arabic arabic-text arabic-md" dir="rtl" lang="ar">
                            {hadith.arab}
                          </p>
                        )}

                        {hadith.translation && (
                          <p className="hadith-translation tamil-text" style={{ marginTop: '1rem', lineHeight: 1.6, fontFamily: 'var(--font-tamil)' }}>
                            {hadith.translation}
                          </p>
                        )}

                        <div className="hadith-ref">
                          <span>{col.name}</span>
                          <span className="dot">·</span>
                          <span>Hadith {hadith.number}</span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )
            }

            {/* Pagination */}
            {totalPages > 1 && <div className="pagination">
              <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹ முந்தையது</button>
              <span className="page-btn active">{page} பக்கம்</span>
              <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>அடுத்தது ›</button>
            </div>}
          </>
        )}

        <p className="hadith-attribution">
          Hadith data from open Islamic APIs. Source: {col.name} by {col.author}.
          Grade information reflects the collection's overall scholarly consensus.
        </p>
      </div>
    </main>
  );
}

function HadithSkeleton() {
  return (
    <div className="hadith-card card" style={{ opacity: 0.5 }}>
      <div className="skeleton" style={{ height: 14, width: '20%', marginBottom: 12, borderRadius: 4 }} />
      <div className="skeleton" style={{ height: 32, marginBottom: 10, borderRadius: 4 }} />
      <div className="skeleton" style={{ height: 12, width: '40%', borderRadius: 4 }} />
    </div>
  );
}

//  Category detail 
function CategoryDetail({ categoryId }) {
  const [cat, setCat] = useState(null);
  const [hadiths, setHadiths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isBookmarked, toggle: toggleBookmark } = useBookmarks();

  useEffect(() => {
    setLoading(true);
    getTopics()
      .then(async topics => {
        const topic = topics.find(item => item.slug === categoryId);
        setCat(topic || null);
        setHadiths(topic ? await getHadithsForTopic(topic.id) : []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [categoryId]);

  if (!cat) return (
    <main className="page-wrapper"><div className="container">
      <div className="empty-state"><p className="empty-state-title">Category not found</p></div>
    </div></main>
  );

  return (
    <main className="page-wrapper fade-in" id="main-content">
      <div className="container">
        <Link to="/hadith" className="back-link"><ArrowLeft size={16} /> Hadith</Link>
        <div className="page-header">
          <div>
            <p className="category-page-icon">{cat.icon}</p>
            <h1 className="page-title">{cat.name}</h1>
            <p className="page-description tamil-text" style={{ fontFamily: 'var(--font-tamil)' }}>{cat.tamil_name || cat.tamil}</p>
          </div>

          {error && <div className="hadith-error"><AlertCircle size={18} />{error}</div>}
        </div>

        {loading ? (
          <div className="hadiths-list">{Array(3).fill(0).map((_, i) => <HadithSkeleton key={i} />)}</div>
        ) : hadiths.length > 0 ? (
          <div className="hadiths-list">
            {hadiths.map((hadith, i) => {
              const bk = isBookmarked('hadith', hadith.id);
              return (
                <article key={hadith.number || i} className="hadith-card card">
                  <div className="hadith-card-top">
                    <span className="hadith-num-badge">#{hadith.number}</span>
                    <div className="hadith-card-actions">
                      <GradeBadge grade="sahih" />
                      <button
                        className={`btn-icon${bk ? ' active' : ''}`}
                        onClick={() => toggleBookmark({
                          type: 'hadith',
                          id: hadith.id,
                          title: `Sahih al-Bukhari #${hadith.number}`,
                          subtitle: hadith.arab?.slice(0, 80),
                          href: `/hadith/bukhari/${hadith.number}`,
                        })}
                        aria-label={bk ? 'Remove bookmark' : 'Save hadith'}
                      >
                        <Bookmark size={15} fill={bk ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>

                  {hadith.arab && (
                    <p className="hadith-arabic arabic-text arabic-md" dir="rtl" lang="ar">
                      {hadith.arab}
                    </p>
                  )}

                  {hadith.translation && (
                    <p className="hadith-translation tamil-text" style={{ marginTop: '1rem', lineHeight: 1.6, fontFamily: 'var(--font-tamil)' }}>
                      {hadith.translation}
                    </p>
                  )}

                  <div className="hadith-ref">
                    <span>Sahih al-Bukhari</span>
                    <span className="dot">·</span>
                    <span>Hadith {hadith.number}</span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <p className="empty-state-title">No specific hadiths found</p>
            <p className="empty-state-desc">Try browsing the main collections instead.</p>
          </div>
        )}
      </div>
    </main>
  );
}

//  Hadith Search 
function HadithSearch() {
  const [query, setQuery] = useState('');
  const [collections, setCollections] = useState([]);
  const [collection, setCollection] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getCollections().then(rows => {
      setCollections(rows);
      setCollection(rows[0]?.id || '');
    }).catch(e => setError(e.message));
  }, []);

  const doSearch = async () => {
    if (!query.trim() || !collection) return;
    setLoading(true);
    setSearched(true);
    setError('');
    try {
      const data = await searchHadiths(query, { collectionId: collection, page: 1, limit: 20 });
      setResults(data.hadiths);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-wrapper fade-in" id="main-content">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title tamil-text" style={{ fontFamily: 'var(--font-tamil)' }}>ஹதீஸ் தேட</h1>
          <p className="page-description tamil-text" style={{ fontFamily: 'var(--font-tamil)' }}>முக்கிய வார்த்தை, ராவி அல்லது ஹதீஸ் எண் மூலம் தேடுங்கள்</p>
        </div>

        <div className="hadith-search-bar">
          <div className="hadith-search-row">
            <select
              value={collection}
              onChange={e => setCollection(e.target.value)}
              className="hadith-collection-select"
              aria-label="Select collection"
            >
              {collections.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search hadiths..."
              onKeyDown={e => e.key === 'Enter' && doSearch()}
              className="hadith-search-input"
              aria-label="Search query"
            />
            <button className="btn btn-primary" onClick={doSearch} disabled={loading}>
              {loading ? 'தேடுகிறது...' : <><Search size={16} /> தேட</>}
            </button>
          </div>
        </div>

        {searched && !loading && (
          <p className="search-result-count">
            {results.length} result{results.length !== 1 ? 's' : ''} in             {collections.find(c => c.id === collection)?.name}
          </p>
        )}

        <div className="hadiths-list">
          {results.map((h, i) => (
            <article key={i} className="hadith-card card">
              <div className="hadith-card-top">
                <span className="hadith-num-badge">#{h.number}</span>
                <GradeBadge grade="mixed" />
              </div>
              {h.arab && <p className="hadith-arabic arabic-text arabic-md" dir="rtl">{h.arab}</p>}
              {h.translation && <p className="hadith-translation tamil-text" style={{ marginTop: '0.5rem', lineHeight: 1.5, fontSize: '0.95rem', fontFamily: 'var(--font-tamil)' }}>{h.translation.substring(0, 150)}...</p>}
              <div className="hadith-ref">
                <span>{collections.find(c => c.id === collection)?.name}</span>
                <span className="dot">·</span>
                <span>#{h.number}</span>
              </div>
            </article>
          ))}
        </div>

        {searched && results.length === 0 && !loading && (
          <div className="empty-state">
            <Search size={40} className="empty-state-icon" />
            <p className="empty-state-title tamil-text" style={{ fontFamily: 'var(--font-tamil)' }}>முடிவுகள் எதுவும் இல்லை</p>
            <p className="empty-state-desc tamil-text" style={{ fontFamily: 'var(--font-tamil)' }}>வேறு வார்த்தைகளில் தேட முயற்சிக்கவும் அல்லது வேறு தொகுப்பை தேர்வு செய்யவும்</p>
          </div>
        )}
        {error && <div className="hadith-error"><AlertCircle size={18} />{error}</div>}
      </div>
    </main>
  );
}

//  Router exports 
export function HadithIndex() { return <CollectionList />; }
export function HadithCollection() {
  const { id } = useParams();
  return <CollectionDetail collectionId={id} />;
}
function HadithDetail() {
  const { id: collectionSlug, number } = useParams();
  const [item, setItem] = useState(null);
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isBookmarked, toggle: toggleBookmark } = useBookmarks();

  useEffect(() => {
    Promise.all([getCollection(collectionSlug), getHadith(collectionSlug, number)])
      .then(([collectionRow, hadith]) => {
        setCollection(collectionRow);
        setItem(hadith);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [collectionSlug, number]);

  if (loading) return <main className="page-wrapper"><div className="container"><HadithSkeleton /></div></main>;
  if (error || !item) return <main className="page-wrapper"><div className="container"><div className="empty-state"><p className="empty-state-title">{error || 'Hadith not found'}</p></div></div></main>;

  const bookmarked = isBookmarked('hadith', item.id);
  return (
    <main className="page-wrapper fade-in" id="main-content">
      <div className="container">
        <Link to={`/hadith/${collectionSlug}`} className="back-link"><ArrowLeft size={16} /> {collection?.name}</Link>
        <article className="hadith-card card">
          <div className="hadith-card-top">
            <span className="hadith-num-badge">#{item.number}</span>
            <button className={`btn-icon${bookmarked ? ' active' : ''}`} onClick={() => toggleBookmark({
              type: 'hadith', id: item.id, title: `${collection?.name} #${item.number}`,
              subtitle: item.arab, href: `/hadith/${collectionSlug}/${number}`,
            })} aria-label={bookmarked ? 'Remove bookmark' : 'Save hadith'}>
              <Bookmark size={15} fill={bookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>
          {item.arab && <p className="hadith-arabic arabic-text arabic-md" dir="rtl">{item.arab}</p>}
          {item.translation && <p className="hadith-translation tamil-text">{item.translation}</p>}
          {item.narrator && <p>{item.narrator}</p>}
          <div className="hadith-ref">{item.source_reference}</div>
        </article>
      </div>
    </main>
  );
}
export function HadithCategoryDetail() {
  const { id } = useParams();
  return <CategoryDetail categoryId={id} />;
}
export function HadithItemDetail() { return <HadithDetail />; }
export function HadithSearchPage() { return <HadithSearch />; }
