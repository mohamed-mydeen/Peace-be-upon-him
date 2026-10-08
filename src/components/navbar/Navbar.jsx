import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Home, BookOpen, MessageSquare, Heart, Hash, Compass,
  Library, MonitorPlay, Info, Search, Sun, Moon, Menu, X,
  Bookmark, ChevronRight, Settings
} from 'lucide-react';
import { useTheme, useSearch, useLang } from '../../context/AppContext';
import '../../styles/navbar.css';

const NAV_LINKS = [
  { to: '/', key: 'home', icon: Home, exact: true },
  { to: '/quran', key: 'quran', icon: BookOpen },
  { to: '/hadith', key: 'hadith', icon: MessageSquare },
  { to: '/dua', key: 'dua', icon: Heart },
  { to: '/dhikr', key: 'dhikr', icon: Hash },
  { to: '/explore', key: 'explore', icon: Compass },
  { to: '/library', key: 'library', icon: Library },
  { to: '/youtube', key: 'youtube', icon: MonitorPlay },
];

const BOTTOM_NAV = [
  { to: '/', key: 'home', icon: Home, exact: true },
  { to: '/quran', key: 'quran', icon: BookOpen },
  { to: '/hadith', key: 'hadith', icon: MessageSquare },
  { to: '/explore', key: 'explore', icon: Compass },
];

const MENU_LINKS = [
  { to: '/dua', key: 'dua', icon: Heart },
  { to: '/dhikr', key: 'dhikr', icon: Hash },
  { to: '/library', key: 'library', icon: Library },
  { to: '/youtube', key: 'youtube', icon: MonitorPlay },
  { to: '/about', key: 'about', icon: Info },
  { to: '/settings', key: 'settings', icon: Settings },
];

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const { open: openSearch } = useSearch();
  const { t, lang } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`} role="navigation" aria-label="Main navigation">
        <div className="container navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo" aria-label="Islamic Reminders Tamil - Home">
            <img src="/channels4_profile.jpg" alt="Peace be upon him Logo" className="navbar-logo-img" />
            <div className="navbar-logo-text">
              <span className="navbar-logo-name">Peace be upon him</span>
              <span className="navbar-logo-sub">இஸ்லாமிய அறிவு</span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="navbar-links" role="menubar">
            {NAV_LINKS.map(({ to, key, icon: Icon, exact }) => (
              <NavLink
                key={to}
                to={to}
                end={exact}
                className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}
                role="menuitem"
              >
                <Icon size={15} aria-hidden="true" />
                {t(key)}
              </NavLink>
            ))}
          </div>

          {/* Actions */}
          <div className="navbar-actions">
            {/* Search */}
            <button
              className="navbar-search-btn"
              onClick={openSearch}
              aria-label="Search (Ctrl+K)"
              title="Search (Ctrl+K)"
            >
              <Search size={15} aria-hidden="true" />
              <span>{t('search')}...</span>
              <span className="navbar-search-shortcut">⌘K</span>
            </button>

            {/* Theme toggle */}
            <button
              className="theme-toggle"
              onClick={toggle}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Mobile hamburger */}
            <button
              className="navbar-hamburger"
              onClick={() => setMenuOpen(v => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav" role="navigation" aria-label="Mobile navigation">
        <div className="bottom-nav-items">
          {BOTTOM_NAV.map(({ to, key, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
              aria-label={t(key)}
            >
              <div className="bottom-nav-item-icon">
                <Icon size={20} aria-hidden="true" />
              </div>
              <span className="bottom-nav-item-label">{t(key)}</span>
            </NavLink>
          ))}
          <button
            className={`bottom-nav-item${menuOpen ? ' active' : ''}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="More menu"
          >
            <div className="bottom-nav-item-icon">
              <Menu size={20} aria-hidden="true" />
            </div>
            <span className="bottom-nav-item-label">{t('more')}</span>
          </button>
        </div>
      </nav>

      {/* Mobile drawer overlay */}
      <div
        className={`mobile-menu-overlay${menuOpen ? ' open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <div
        className={`mobile-menu-drawer${menuOpen ? ' open' : ''}`}
        role="dialog"
        aria-label="Menu"
        aria-modal="true"
      >
        <div className="mobile-menu-header">
          <span className="mobile-menu-title">{t('morePages')}</span>
          <button
            className="btn-icon"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mobile-menu-grid">
          {MENU_LINKS.map(({ to, key, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `mobile-menu-link${isActive ? ' active' : ''}`}
            >
              <Icon size={22} aria-hidden="true" />
              <span>{t(key)}</span>
            </NavLink>
          ))}
          <button
            className="mobile-menu-link"
            onClick={() => { openSearch(); setMenuOpen(false); }}
          >
            <Search size={22} aria-hidden="true" />
            <span>{t('search')}</span>
          </button>
          <button className="mobile-menu-link" onClick={() => { toggle(); setMenuOpen(false); }}>
            {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
            <span>{theme === 'dark' ? t('light') : t('dark')}</span>
          </button>
        </div>
      </div>
    </>
  );
}
