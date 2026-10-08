import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Hash, RotateCcw, Plus, Activity, Loader2 } from 'lucide-react';
import { fetchDhikrData, getDhikrBySession } from '../services/dhikr';
import './Dhikr.css';

export default function Dhikr() {
  const [session, setSession] = useState('after-prayer');
  const [dhikrs, setDhikrs] = useState([]);
  const [counts, setCounts] = useState({});

  const [allDhikrs, setAllDhikrs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load local storage counts
    try {
      const stored = JSON.parse(localStorage.getItem('dhikr_counts') || '{}');
      setCounts(stored);
    } catch { /* ignore */ }

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchDhikrData();
        setAllDhikrs(data.dhikrList || []);
        setSessions(data.sessions || []);
      } catch (err) {
        setError('Failed to load dhikr.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (allDhikrs.length > 0) {
      setDhikrs(getDhikrBySession(allDhikrs, session));
    }
  }, [session, allDhikrs]);

  const updateCount = (id, increment) => {
    setCounts(prev => {
      const current = prev[id] || 0;
      const target = dhikrs.find(d => d.id === id)?.target || 0;
      
      let next = current;
      if (increment) {
        next = current < target ? current + 1 : current;
      } else {
        next = 0;
      }

      const updated = { ...prev, [id]: next };
      localStorage.setItem('dhikr_counts', JSON.stringify(updated));
      return updated;
    });
  };

  const resetAll = () => {
    const updated = { ...counts };
    dhikrs.forEach(d => { updated[d.id] = 0; });
    setCounts(updated);
    localStorage.setItem('dhikr_counts', JSON.stringify(updated));
  };

  const totalCompleted = dhikrs.filter(d => (counts[d.id] || 0) >= d.target).length;
  const isAllCompleted = dhikrs.length > 0 && totalCompleted === dhikrs.length;

  return (
    <main className="page-wrapper fade-in" id="main-content">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="page-header text-center" style={{ textAlign: 'center' }}>
          <div className="dhikr-header-icon"><Activity size={32} /></div>
          <h1 className="page-title">Dhikr Counter</h1>
          <p className="page-description tamil-text" style={{ fontFamily: 'var(--font-tamil)' }}>
            திக்ர் கவுண்டர் — அல்லாஹ்வை நினைவுகூருதல்
          </p>
          <div style={{ marginTop: '1rem' }}>
            <Link to="/after-salah" className="btn btn-primary" style={{ backgroundColor: '#c0392b', color: 'white' }}>
               After Salah Dhikr
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="loader-container">
            <Loader2 className="spinner" size={32} />
            <p>Loading dhikr...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Sessions toggle */}
            <div className="dhikr-sessions">
              {sessions.map(s => (
                <button
                  key={s.id}
                  className={`dhikr-session-btn${session === s.id ? ' active' : ''}`}
                  onClick={() => setSession(s.id)}
                >
                  <span className="ds-name">{s.name}</span>
                  <span className="ds-tamil tamil-text">{s.tamil}</span>
                </button>
              ))}
            </div>

            <div className="dhikr-progress-bar">
              <div className="dhikr-progress-text">
                <span>Session Progress</span>
                <span>{totalCompleted} / {dhikrs.length} completed</span>
              </div>
              <div className="dhikr-progress-track">
                <div 
                  className="dhikr-progress-fill" 
                  style={{ width: `${dhikrs.length ? (totalCompleted / dhikrs.length) * 100 : 0}%` }}
                />
              </div>
              {isAllCompleted && <p className="dhikr-completed-msg">Mashallah! Session completed.</p>}
              <button className="btn btn-ghost btn-sm" onClick={resetAll} style={{ marginTop: '1rem' }}>
                <RotateCcw size={14} /> Reset Session
              </button>
            </div>

            {/* Dhikr items */}
            <div className="dhikr-list">
              {dhikrs.map(dhikr => {
                const current = counts[dhikr.id] || 0;
                const isDone = current >= dhikr.target;
                
                return (
                  <div key={dhikr.id} className={`dhikr-item card${isDone ? ' done' : ''}`}>
                    <div className="dhikr-item-content">
                      <p className="dhikr-arabic arabic-text arabic-lg notranslate" dir="rtl" translate="no">{dhikr.arabic}</p>
                      <p className="dhikr-translit">{dhikr.transliteration}</p>
                      <p className="dhikr-tamil tamil-text">{dhikr.meaning_tamil}</p>
                      {dhikr.note && <p className="dhikr-note">{dhikr.note}</p>}
                    </div>

                    <div className="dhikr-counter-area">
                      <div className="dhikr-count-display">
                        <span className="current-count">{current}</span>
                        <span className="target-count">/ {dhikr.target}</span>
                      </div>
                      
                      <div className="dhikr-controls">
                        <button 
                          className={`dhikr-tap-btn${isDone ? ' done' : ''}`}
                          onClick={() => updateCount(dhikr.id, true)}
                          disabled={isDone}
                          aria-label="Count"
                        >
                          {isDone ? 'Completed' : <Plus size={32} />}
                        </button>
                        <button 
                          className="dhikr-reset-btn" 
                          onClick={() => updateCount(dhikr.id, false)}
                          aria-label="Reset"
                        >
                          <RotateCcw size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
