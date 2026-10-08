import { Settings as SettingsIcon, Globe, Palette, Sun, Moon, Monitor, CheckCircle } from 'lucide-react';
import { useLang } from '../context/AppContext';
import { useTheme } from '../context/AppContext';
import './Settings.css';

export default function Settings() {
  const { lang, setLang, t, languages } = useLang();
  const { theme, setTheme } = useTheme();

  const THEMES = [
    { id: 'light', icon: <Sun size={20} />, label: t('themeLight') },
    { id: 'dark', icon: <Moon size={20} />, label: t('themeDark') },
    { id: 'system', icon: <Monitor size={20} />, label: t('themeSystem') },
  ];

  return (
    <main className="page-wrapper fade-in settings-page" id="main-content">
      <div className="container">
        {/* Header */}
        <div className="settings-header">
          <div className="settings-icon-wrap">
            <SettingsIcon size={28} />
          </div>
          <h1 className="settings-title">{t('settingsTitle')}</h1>
          <p className="settings-desc">{t('settingsDesc')}</p>
        </div>

        {/* Language Card */}
        <section className="settings-card" aria-labelledby="lang-heading">
          <div className="settings-card-header">
            <Globe size={20} className="settings-card-icon" />
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
                <span className="lang-flag">{l.flag}</span>
                <span className="lang-native">{l.nativeName}</span>
                <span className="lang-label">{l.label}</span>
                {lang === l.code && (
                  <span className="lang-check" aria-hidden="true">
                    <CheckCircle size={16} />
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Theme Card */}
        <section className="settings-card" aria-labelledby="theme-heading">
          <div className="settings-card-header">
            <Palette size={20} className="settings-card-icon" />
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
                <span className="theme-btn-icon">{th.icon}</span>
                <span className="theme-btn-label">{th.label}</span>
                {theme === th.id && (
                  <span className="theme-check" aria-hidden="true">
                    <CheckCircle size={14} />
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Info card */}
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

