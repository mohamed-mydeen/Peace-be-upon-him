import { useState, useEffect } from 'react';
import { Clock, MapPin, Loader2, AlertCircle } from 'lucide-react';
import './PrayerTimes.css';

const DISTRICTS = [
  'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 
  'Salem', 'Tirunelveli', 'Vellore', 'Erode', 
  'Thoothukudi', 'Tiruppur', 'Kanyakumari', 'Thanjavur'
];

export default function PrayerTimes() {
  const [district, setDistrict] = useState(() => localStorage.getItem('prayer-district') || 'Chennai');
  const [timings, setTimings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    async function fetchPrayerTimes() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${district}&country=India&method=1`);
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
    if (dropdownOpen) {
      document.addEventListener('click', closeDropdown);
    }
    return () => document.removeEventListener('click', closeDropdown);
  }, [dropdownOpen]);

  const formatTime = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${minutes} ${ampm}`;
  };

  const prayers = [
    { name: 'Fajr', arabic: 'الفجر', key: 'Fajr' },
    { name: 'Sunrise', arabic: 'الشروق', key: 'Sunrise' },
    { name: 'Dhuhr', arabic: 'الظهر', key: 'Dhuhr' },
    { name: 'Asr', arabic: 'العصر', key: 'Asr' },
    { name: 'Maghrib', arabic: 'المغرب', key: 'Maghrib' },
    { name: 'Isha', arabic: 'العشاء', key: 'Isha' },
  ];

  return (
    <div className="prayer-times-widget">
      <div className="prayer-header">
        <div className="prayer-title-wrap">
          <Clock size={20} className="prayer-icon" />
          <h2 className="prayer-title">Prayer Times</h2>
        </div>
        
        <div className="prayer-custom-select-container">
          <button 
            className={`prayer-selector ${dropdownOpen ? 'active' : ''}`}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-label="Select District"
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
          >
            <MapPin size={16} className="prayer-location-icon" />
            <span className="prayer-select-text">{district}, TN</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px', opacity: 0.6, transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          
          {dropdownOpen && (
            <ul className="prayer-dropdown-list" role="listbox">
              {DISTRICTS.map(d => (
                <li 
                  key={d} 
                  role="option"
                  aria-selected={district === d}
                  className={`prayer-dropdown-item ${district === d ? 'selected' : ''}`}
                  onClick={() => {
                    setDistrict(d);
                    setDropdownOpen(false);
                  }}
                >
                  {d}, TN
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {loading ? (
        <div className="prayer-loading">
          <Loader2 size={24} className="spinner" />
          <span>Loading timings...</span>
        </div>
      ) : error ? (
        <div className="prayer-error">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      ) : (
        <div className="prayer-grid">
          {prayers.map((prayer) => (
            <div key={prayer.key} className="prayer-card">
              <span className="prayer-name">{prayer.name}</span>
              <span className="prayer-arabic arabic-text" dir="rtl" translate="no">{prayer.arabic}</span>
              <span className="prayer-time">{formatTime(timings[prayer.key])}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

