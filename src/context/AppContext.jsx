import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

// ============================================
// THEME CONTEXT
// ============================================
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme(t => t === 'dark' ? 'light' : 'dark');
  }, []);

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};

// ============================================
// BOOKMARK CONTEXT
// ============================================
const BookmarkContext = createContext(null);

function loadBookmarks() {
  try {
    return JSON.parse(localStorage.getItem('bookmarks') || '[]');
  } catch { return []; }
}

export function BookmarkProvider({ children }) {
  const [bookmarks, setBookmarks] = useState(loadBookmarks);
  const [toastMsg, setToastMsg] = useState('');
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 2500);
  }, []);

  const save = useCallback(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => { save(); }, [bookmarks, save]);

  const isBookmarked = useCallback((type, id) =>
    bookmarks.some(b => b.type === type && b.id === String(id)), [bookmarks]);

  const toggle = useCallback((item) => {
    setBookmarks(prev => {
      const exists = prev.some(b => b.type === item.type && b.id === String(item.id));
      if (exists) {
        showToast('Bookmark removed');
        return prev.filter(b => !(b.type === item.type && b.id === String(item.id)));
      } else {
        showToast('Saved to library');
        return [...prev, { ...item, id: String(item.id), savedAt: new Date().toISOString() }];
      }
    });
  }, [showToast]);

  const remove = useCallback((type, id) => {
    setBookmarks(prev => prev.filter(b => !(b.type === type && b.id === String(id))));
    showToast('Removed from library');
  }, [showToast]);

  return (
    <BookmarkContext.Provider value={{ bookmarks, isBookmarked, toggle, remove }}>
      {children}
      {toastMsg && (
        <div className="toast-container">
          <div className="toast">{toastMsg}</div>
        </div>
      )}
    </BookmarkContext.Provider>
  );
}

export const useBookmarks = () => {
  const ctx = useContext(BookmarkContext);
  if (!ctx) throw new Error('useBookmarks must be used inside BookmarkProvider');
  return ctx;
};

// ============================================
// SEARCH CONTEXT (Global search modal)
// ============================================
const SearchContext = createContext(null);

export function SearchProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <SearchContext.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      {children}
    </SearchContext.Provider>
  );
}

export const useSearch = () => {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used inside SearchProvider');
  return ctx;
};
