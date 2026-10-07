import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Providers
import { ThemeProvider, BookmarkProvider, SearchProvider } from './context/AppContext';

// Shared Components
import Navbar from './components/navbar/Navbar';
import Footer from './components/footer/Footer';
import GlobalSearch from './components/search/GlobalSearch';

// Pages
import Home from './pages/Home';
import { QuranIndex, QuranSurah } from './pages/Quran';
import { HadithIndex, HadithCollection, HadithCategoryDetail, HadithSearchPage } from './pages/Hadith';
import Dua from './pages/Dua';
import Dhikr from './pages/Dhikr';
import Explore from './pages/Explore';
import Library from './pages/Library';
import YouTubePage from './pages/YouTube';
import About from './pages/About';
import AfterSalah from './pages/AfterSalah';

// Scroll restoration component
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const location = useLocation();

  return (
    <ThemeProvider>
      <BookmarkProvider>
        <SearchProvider>
          <div className="app-container">
            <ScrollToTop />
            <Navbar />
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
              >
                <Routes location={location}>
                  {/* Home */}
                  <Route path="/" element={<Home />} />
                  
                  {/* Quran */}
                  <Route path="/quran" element={<QuranIndex />} />
                  <Route path="/quran/:id" element={<QuranSurah />} />
                  
                  {/* Hadith */}
                  <Route path="/hadith" element={<HadithIndex />} />
                  <Route path="/hadith/search" element={<HadithSearchPage />} />
                  <Route path="/hadith/categories/:id" element={<HadithCategoryDetail />} />
                  <Route path="/hadith/:id" element={<HadithCollection />} />
                  
                  {/* Other Features */}
                  <Route path="/dua" element={<Dua />} />
                  <Route path="/dhikr" element={<Dhikr />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/explore/:topic" element={<Explore />} />
                  <Route path="/library" element={<Library />} />
                  <Route path="/youtube" element={<YouTubePage />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/after-salah" element={<AfterSalah />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
            <Footer />
            <GlobalSearch />
          </div>
        </SearchProvider>
      </BookmarkProvider>
    </ThemeProvider>
  );
}
