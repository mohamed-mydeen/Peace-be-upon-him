import { useState, useEffect } from 'react';
import { Clock, MapPin, Loader2, AlertCircle } from 'lucide-react';
import masjidBg from '../../assets/masjid-banner.svg';
import './PrayerTimes.css';

const DISTRICTS = [
  'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli',
  'Salem', 'Tirunelveli', 'Vellore', 'Erode',
  'Thoothukudi', 'Tiruppur', 'Kanyakumari', 'Thanjavur'
];

const PRAYERS = [
  { name: 'FAJR',    arabic: 'الفجر',  key: 'Fajr'    },
  { name: 'SUNRISE', arabic: 'الشروق', key: 'Sunrise'  },
  { name: 'DHUHR',   arabic: 'الظهر',  key: 'Dhuhr'   },
  { name: 'ASR',     arabic: 'العصر',  key: 'Asr'     },
  { name: 'MAGHRIB', arabic: 'المغرب', key: 'Maghrib'  },
  { name: 'ISHA',    arabic: 'العشاء', key: 'Isha'    },
];  

function formatTime(time24) {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  let h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${minutes} ${ampm}`;
}

/** Returns index of the current/upcoming prayer (the one after last passed) */
function getActivePrayerIndex(timings) {
  if (!timings) return -1;
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();

  // Build array of [prayerIndex, totalMinutes]
  const times = PRAYERS.map((p, i) => {
    const t = timings[p.key];
    if (!t) return [i, 9999];
    const [h, m] = t.split(':').map(Number);
    return [i, h * 60 + m];
  });

  // Find last prayer whose time has passed
  let activeIdx = 0;
  for (let i = 0; i < times.length; i++) {
    if (times[i][1] <= nowMins) activeIdx = i;
  }
  return activeIdx;
}

export default function PrayerTimes() {
  const [district, setDistrict] = useState(
    () => localStorage.getItem('prayer-district') || 'Chennai'
  );
  const [timings, setTimings]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    async function fetchPrayerTimes() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(
          `https://api.aladhan.com/v1/timingsByCity?city=${district}&country=India&method=1`
        );
        if (!res.ok) throw new Error('Failed to fetch prayer times');
        const data = await res.json();
        setTimings(data.data.timings);
        localStorage.setItem('prayer-district', district);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPrayerTimes();
  }, [district]);

  useEffect(() => {
    const closeDropdown = (e) => {
      if (!e.target.closest('.prayer-custom-select-container')) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener('click', closeDropdown);
    return () => document.removeEventListener('click', closeDropdown);
  }, [dropdownOpen]);

  const activeIdx = getActivePrayerIndex(timings);

  return (
    <div className="prayer-times-widget">
      <img src={masjidBg} alt="" className="prayer-bg-img" aria-hidden="true" />
      {/* Header */}
      <div className="prayer-header">
        <div className="prayer-title-wrap">
          <Clock size={18} className="prayer-icon" />
          <h2 className="prayer-title">Prayer Times</h2>
        </div>

        {/* Location pill dropdown */}
        <div className="prayer-custom-select-container">
          <button
            className={`prayer-selector${dropdownOpen ? ' active' : ''}`}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-label="Select District"
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
          >
            <MapPin size={13} className="prayer-location-icon" />
            <span className="prayer-select-text">{district}, TN</span>
            <svg
              width="10" height="10" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ opacity: 0.6, transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {dropdownOpen && (
            <ul className="prayer-dropdown-list" role="listbox">
              {DISTRICTS.map(d => (
                <li
                  key={d}
                  role="option"
                  aria-selected={district === d}
                  className={`prayer-dropdown-item${district === d ? ' selected' : ''}`}
                  onClick={() => { setDistrict(d); setDropdownOpen(false); }}
                >
                  {d}, TN
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="prayer-loading">
          <Loader2 size={20} className="spinner" />
          <span>Loading timings…</span>
        </div>
      ) : error ? (
        <div className="prayer-error">
          <AlertCircle size={16} /><span>{error}</span>
        </div>
      ) : (
        <div className="prayer-grid">
          {PRAYERS.map((prayer, i) => (
            <div
              key={prayer.key}
              className={`prayer-card${i === activeIdx ? ' prayer-card-active' : ''}`}
            >
              {/* Pulse dot on active prayer */}
              {i === activeIdx && <span className="prayer-active-dot" aria-hidden="true" />}

              <div className="prayer-name-row">
                <span className="prayer-name">{prayer.name}</span>
                <span className="prayer-arabic arabic-text" dir="rtl" translate="no">
                  {prayer.arabic}
                </span>
              </div>
              <span className="prayer-time">{formatTime(timings[prayer.key])}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
