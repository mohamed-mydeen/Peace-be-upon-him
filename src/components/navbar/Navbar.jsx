import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Home, BookOpen, MessageSquare, Heart, Hash, Compass,
  Library, MonitorPlay, Info, Search, Sun, Moon, Menu, X,
  Bookmark, ChevronRight
} from 'lucide-react';
import { useTheme, useSearch } from '../../context/AppContext';
import '../../styles/navbar.css';

const NAV_LINKS = [
  { to: '/', label: 'Home', tamil: 'முகப்பு', icon: Home, exact: true },
  { to: '/quran', label: 'Quran', tamil: 'குர்ஆன்', icon: BookOpen },
  { to: '/hadith', label: 'Hadith', tamil: 'ஹதீஸ்', icon: MessageSquare },
  { to: '/dua', label: 'Dua', tamil: 'துஆ', icon: Heart },
  { to: '/dhikr', label: 'Dhikr', tamil: 'திக்ர்', icon: Hash },
  { to: '/explore', label: 'Explore', tamil: 'கண்டறி', icon: Compass },
  { to: '/library', label: 'Library', tamil: 'நூலகம்', icon: Library },
  { to: '/youtube', label: 'YouTube', tamil: 'யூட்யூப்', icon: MonitorPlay },
];

const BOTTOM_NAV = [
  { to: '/', label: 'முகப்பு', icon: Home, exact: true },
  { to: '/quran', label: 'குர்ஆன்', icon: BookOpen },
  { to: '/hadith', label: 'ஹதீஸ்', icon: MessageSquare },
  { to: '/explore', label: 'கண்டறி', icon: Compass },
];

const MENU_LINKS = [
  { to: '/dua', label: 'Dua', tamil: 'துஆ', icon: Heart },
  { to: '/dhikr', label: 'Dhikr', tamil: 'திக்ர்', icon: Hash },
  { to: '/library', label: 'Library', tamil: 'நூலகம்', icon: Library },
  { to: '/youtube', label: 'YouTube', tamil: 'யூட்யூப்', icon: MonitorPlay },
  { to: '/about', label: 'About', tamil: 'பற்றி', icon: Info },
];

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const { open: openSearch } = useSearch();
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
            {NAV_LINKS.map(({ to, label, icon: Icon, exact }) => (
              <NavLink
                key={to}
                to={to}
                end={exact}
                className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}
                role="menuitem"
              >
                <Icon size={15} aria-hidden="true" />
                {label}
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
              <span>Search...</span>
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
          {BOTTOM_NAV.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
              aria-label={label}
            >
              <div className="bottom-nav-item-icon">
                <Icon size={20} aria-hidden="true" />
              </div>
              <span className="bottom-nav-item-label">{label}</span>
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
            <span className="bottom-nav-item-label">மேலும்</span>
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
          <span className="mobile-menu-title">மேலும் பக்கங்கள்</span>
          <button
            className="btn-icon"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mobile-menu-grid">
          {MENU_LINKS.map(({ to, label, tamil, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `mobile-menu-link${isActive ? ' active' : ''}`}
            >
              <Icon size={22} aria-hidden="true" />
              <span>{tamil}</span>
            </NavLink>
          ))}
          <button
            className="mobile-menu-link"
            onClick={() => { openSearch(); setMenuOpen(false); }}
          >
            <Search size={22} aria-hidden="true" />
            <span>தேடல்</span>
          </button>
          <button className="mobile-menu-link" onClick={() => { toggle(); setMenuOpen(false); }}>
            {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
            <span>{theme === 'dark' ? 'ஒளி' : 'இருள்'}</span>
          </button>
        </div>
      </div>
    </>
  );
}
