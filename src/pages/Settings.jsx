import { QURAN_RECITERS } from '../services/quran';
import { useLang, useQuranAudioSettings, useTheme } from '../context/AppContext';
import ReciterPicker from '../components/quran/ReciterPicker';
import './Settings.css';

export default function Settings() {
  const { lang, setLang, t, languages } = useLang();
  const { theme, setTheme } = useTheme();
  const { reciterId, setReciterId } = useQuranAudioSettings();

  const THEMES = [
    { id: 'light', label: t('themeLight') },
    { id: 'dark', label: t('themeDark') },
    { id: 'system', label: t('themeSystem') },
  ];

  return (
    <main className="page-wrapper fade-in settings-page" id="main-content">
      <div className="container">
        <div className="settings-header">
          <div className="settings-heading-copy">
            <h1 className="settings-title">{t('settingsTitle')}</h1>
            <p className="settings-desc">{t('settingsDesc')}</p>
          </div>
        </div>

        <section className="settings-card" aria-labelledby="lang-heading">
          <div className="settings-card-header">
            <div>
              <h2 id="lang-heading" className="settings-card-title">{t('appLanguage')}</h2>
              <p className="settings-card-subtitle">{t('appLanguageDesc')}</p>
            </div>
          </div>

          <div className="lang-grid" role="radiogroup" aria-label="Select language">
            {languages.map(l => (
              <button
                key={l.code}
                role="radio"
                aria-checked={lang === l.code}
                className={`lang-btn ${lang === l.code ? 'active' : ''}`}
                onClick={() => setLang(l.code)}
                dir={l.dir}
              >
                <span className="lang-native">{l.nativeName}</span>
                <span className="lang-label">{l.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="settings-card" aria-labelledby="theme-heading">
          <div className="settings-card-header">
            <div>
              <h2 id="theme-heading" className="settings-card-title">{t('theme')}</h2>
              <p className="settings-card-subtitle">{t('themeDesc')}</p>
            </div>
          </div>

          <div className="theme-grid" role="radiogroup" aria-label="Select theme">
            {THEMES.map(th => (
              <button
                key={th.id}
                role="radio"
                aria-checked={theme === th.id}
                className={`theme-btn ${theme === th.id ? 'active' : ''}`}
                onClick={() => setTheme(th.id)}
              >
                <span className="theme-btn-label">{th.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="settings-card" aria-labelledby="reciter-heading">
          <div className="settings-card-header">
            <div>
              <h2 id="reciter-heading" className="settings-card-title">Quran recitation</h2>
              <p className="settings-card-subtitle">Choose your preferred reciter for Quran playback.</p>
            </div>
          </div>
          <span className="reciter-select-label">Default reciter</span>
          <ReciterPicker
            reciters={QURAN_RECITERS}
            value={reciterId}
            onChange={setReciterId}
            label="Default Quran reciter"
          />
          <p className="settings-card-subtitle reciter-note">
            Bandar Baleela is available as a full-Surah recitation. Other reciters play ayah by ayah.
          </p>
        </section>

        <div className="settings-info-card">
          <p>
            {lang === 'ar' && <span dir="rtl">تم حفظ تفضيلاتك تلقائياً في هذا الجهاز.</span>}
            {lang === 'ta' && <span>உங்கள் விருப்பங்கள் இந்த சாதனத்தில் தானாக சேமிக்கப்படுகின்றன.</span>}
            {lang === 'en' && <span>Your preferences are automatically saved on this device.</span>}
          </p>
        </div>
      </div>
    </main>
  );
}
