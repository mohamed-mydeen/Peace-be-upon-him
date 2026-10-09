import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Providers
import {
  LanguageProvider,
  ThemeProvider,
  QuranAudioSettingsProvider,
  BookmarkProvider,
  SearchProvider,
} from './context/AppContext';
import { AuthProvider } from './context/AuthContext';

// Shared Components
import Navbar from './components/navbar/Navbar';
import Footer from './components/footer/Footer';
import GlobalSearch from './components/search/GlobalSearch';
import AuthModal from './components/auth/AuthModal';

// Pages
import Home from './pages/Home';
import {
  QuranIndex,
  QuranSurah
} from './pages/Quran';
import {
  HadithIndex,
  HadithCollection,
  HadithCategoryDetail,
  HadithSearchPage,
  HadithBook
} from './pages/Hadith';
import Dua from './pages/Dua';
import Dhikr from './pages/Dhikr';
import Explore from './pages/Explore';
import Library from './pages/Library';
import YouTubePage from './pages/YouTube';
import About from './pages/About';
import AfterSalah from './pages/AfterSalah';
import Settings from './pages/Settings';
import NearbyMasjids from './pages/NearbyMasjids';
import Lessons from './pages/Lessons';
import NamesOfAllah from './pages/NamesOfAllah';
import WelcomeScreen from './components/WelcomeScreen';
import QiblaPage from './pages/Qibla';

// Scroll restoration
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function useDisableBrowserZoomAndCopy() {
  useEffect(() => {
    const isEditableTarget = target =>
      target instanceof Element &&
      target.closest('input, textarea, select, [contenteditable="true"]');

    const preventZoomShortcut = event => {
      if (!(event.ctrlKey || event.metaKey)) return;
      if (['+', '=', '-', '0'].includes(event.key)) event.preventDefault();
    };
    const preventWheelZoom = event => {
      if (event.ctrlKey) event.preventDefault();
    };
    const preventGestureZoom = event => event.preventDefault();
    const preventPageCopy = event => {
      if (!isEditableTarget(event.target)) event.preventDefault();
    };
    const preventPageContextMenu = event => {
      if (!isEditableTarget(event.target)) event.preventDefault();
    };

    document.addEventListener('keydown', preventZoomShortcut, true);
    document.addEventListener('wheel', preventWheelZoom, { capture: true, passive: false });
    document.addEventListener('gesturestart', preventGestureZoom, { passive: false });
    document.addEventListener('gesturechange', preventGestureZoom, { passive: false });
    document.addEventListener('copy', preventPageCopy, true);
    document.addEventListener('cut', preventPageCopy, true);
    document.addEventListener('contextmenu', preventPageContextMenu, true);

    return () => {
      document.removeEventListener('keydown', preventZoomShortcut, true);
      document.removeEventListener('wheel', preventWheelZoom, true);
      document.removeEventListener('gesturestart', preventGestureZoom);
      document.removeEventListener('gesturechange', preventGestureZoom);
      document.removeEventListener('copy', preventPageCopy, true);
      document.removeEventListener('cut', preventPageCopy, true);
      document.removeEventListener('contextmenu', preventPageContextMenu, true);
    };
  }, []);
}

export default function App() {
  const location = useLocation();
  const [hasStarted, setHasStarted] = useState(
    () => localStorage.getItem('peace-welcome-complete') === 'true',
  );

  const startApp = () => {
    localStorage.setItem('peace-welcome-complete', 'true');
    setHasStarted(true);
  };

  const [showAuth, setShowAuth] = useState(false);

  useDisableBrowserZoomAndCopy();

  return (
    <AuthProvider>
    <LanguageProvider>
      <ThemeProvider>
        <QuranAudioSettingsProvider>
          <BookmarkProvider>
            <SearchProvider>
              {!hasStarted ? (
                <WelcomeScreen onGetStarted={startApp} />
              ) : (
                <div className="app-container">
                  <ScrollToTop />
                  <Navbar onAuthClick={() => setShowAuth(true)} />
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={location.pathname}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                    >
                      <Routes location={location}>
                        <Route path="/" element={<Home />} />
                        <Route path="/quran" element={<QuranIndex />} />
                        <Route path="/quran/:id" element={<QuranSurah />} />
                        <Route path="/hadith" element={<HadithIndex />} />
                        <Route path="/hadith/search" element={<HadithSearchPage />} />
                        <Route path="/hadith/categories/:id" element={<HadithCategoryDetail />} />
                        <Route path="/hadith/:id" element={<HadithCollection />} />
                        <Route path="/hadith/:id/book/:bookId" element={<HadithBook />} />
                        <Route path="/dua" element={<Dua />} />
                        <Route path="/dhikr" element={<Dhikr />} />
                        <Route path="/explore" element={<Explore />} />
                        <Route path="/explore/:topic" element={<Explore />} />
                        <Route path="/library" element={<Library />} />
                        <Route path="/youtube" element={<YouTubePage />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/after-salah" element={<AfterSalah />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/nearby-masjids" element={<NearbyMasjids />} />
                        <Route path="/lessons" element={<Lessons />} />
                        <Route path="/lessons/:subjectId" element={<Lessons />} />
                        <Route path="/lessons/:subjectId/:lessonId" element={<Lessons />} />
                        <Route path="/names-of-allah" element={<NamesOfAllah />} />
                        <Route path="/qibla" element={<QiblaPage />} />
                      </Routes>
                    </motion.div>
                  </AnimatePresence>
                  {location.pathname === '/' && <Footer />}
                  <GlobalSearch />
                  {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
                </div>
              )}
            </SearchProvider>
          </BookmarkProvider>
        </QuranAudioSettingsProvider>
      </ThemeProvider>
    </LanguageProvider>
    </AuthProvider>
  );
}