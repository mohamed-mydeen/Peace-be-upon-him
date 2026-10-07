import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { requireSupabase } from '../lib/supabase';

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

export function BookmarkProvider({ children }) {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 2500);
  }, []);

  const load = useCallback(async () => {
    if (!user) {
      setBookmarks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    const client = requireSupabase();
    const { data, error: queryError } = await client
      .from('bookmarks')
      .select('id, content_type, created_at, hadith:hadiths(id, hadith_number, arabic, tamil, english, source_reference, collection:hadith_collections(name)), ayah:quran_ayahs(id, surah_id, ayah_number, arabic, tamil, english), dua:duas(id, title, tamil_title, arabic, meaning_tamil, source_reference)')
      .order('created_at', { ascending: false });
    if (queryError) {
      setError(queryError.message);
      setLoading(false);
      throw queryError;
    }
    setBookmarks((data || []).map((row) => {
      const content = row.hadith || row.ayah || row.dua;
      const type = row.content_type;
      const contentId = content?.id;
      const title = type === 'hadith'
        ? `${content.collection?.name || 'Hadith'} #${content.hadith_number}`
        : type === 'ayah'
          ? `Quran ${content.surah_id}:${content.ayah_number}`
          : content?.title || content?.tamil_title;
      const subtitle = type === 'hadith'
        ? content?.tamil || content?.english || content?.arabic
        : type === 'ayah'
          ? content?.english || content?.tamil || content?.arabic
          : content?.meaning_tamil || content?.arabic;
      const href = type === 'hadith'
        ? `/hadith/${content.collection?.slug || ''}`
        : type === 'ayah'
          ? `/quran/${content.surah_id}#ayah-${content.ayah_number}`
          : `/dua`;
      return { id: contentId, bookmarkId: row.id, type, title, subtitle, href, savedAt: row.created_at };
    }));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load().catch((loadError) => setError(loadError.message));
  }, [load]);

  const isBookmarked = useCallback((type, id) =>
    bookmarks.some(b => b.type === type && b.id === String(id)), [bookmarks]);

  const toggle = useCallback(async (item) => {
    if (!user) {
      showToast('Sign in to save items');
      return;
    }
    const client = requireSupabase();
    const existing = bookmarks.find(b => b.type === item.type && b.id === String(item.id));
    const contentColumn = { hadith: 'hadith_id', ayah: 'ayah_id', dua: 'dua_id' }[item.type];
    if (!contentColumn || !item.id) throw new Error('A valid saved content item is required.');

    if (existing) {
      const { error: deleteError } = await client.from('bookmarks').delete().eq('id', existing.bookmarkId);
      if (deleteError) {
        setError(deleteError.message);
        showToast('Unable to remove bookmark');
        throw deleteError;
      }
      showToast('Bookmark removed');
    } else {
      const { error: insertError } = await client.from('bookmarks').insert({
        user_id: user.id,
        content_type: item.type,
        [contentColumn]: item.id,
      });
      if (insertError) {
        setError(insertError.message);
        showToast('Unable to save bookmark');
        throw insertError;
      }
      showToast('Saved to library');
    }
    await load();
  }, [bookmarks, load, showToast, user]);

  const remove = useCallback(async (type, id) => {
    const bookmark = bookmarks.find(b => b.type === type && b.id === String(id));
    if (!bookmark) return;
    const { error: deleteError } = await requireSupabase().from('bookmarks').delete().eq('id', bookmark.bookmarkId);
    if (deleteError) {
      setError(deleteError.message);
      throw deleteError;
    }
    showToast('Removed from library');
    await load();
  }, [bookmarks, load, showToast]);

  return (
    <BookmarkContext.Provider value={{ bookmarks, isBookmarked, toggle, remove, loading, error, reload: load }}>
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
