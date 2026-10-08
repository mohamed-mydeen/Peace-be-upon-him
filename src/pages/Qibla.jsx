import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Navigation2, MapPin, RefreshCw, Compass, AlertTriangle,
  Edit3, CheckCircle, WifiOff
} from 'lucide-react';
import {
  calculateQiblaBearing,
  calculateTurnDirection,
  calculateDistanceToKaaba,
  smoothHeading,
} from '../services/qiblaCalculator';
import './Qibla.css';

// ──────────────────────────────────────────────────────────────
// CONSTANTS
// ──────────────────────────────────────────────────────────────
const ALIGN_THRESHOLD        = 5;    // degrees — "Facing Qibla"
const NEAR_THRESHOLD         = 15;   // degrees — "Almost aligned"
const SENSOR_TIMEOUT_MS      = 4000; // ms to wait before declaring no sensor
const CALIBRATION_EVENTS     = 40;   // show calibration tip after N events

// iOS 13+ needs explicit permission for DeviceOrientationEvent
const hasIOSPermissionGate =
  typeof DeviceOrientationEvent !== 'undefined' &&
  typeof DeviceOrientationEvent.requestPermission === 'function';

// ──────────────────────────────────────────────────────────────
// HEADING LABEL HELPER
// ──────────────────────────────────────────────────────────────
function cardinalLabel(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

// ──────────────────────────────────────────────────────────────
// SVG COMPASS DISC
// Props:
//   rotation     — degrees to rotate the whole disc (0 = North up)
//   qiblaBearing — degrees from North where Qibla is
//   animate      — true = smooth CSS transition on rotation
//   staticMode   — true = disc is fixed, needle points at Qibla
// ──────────────────────────────────────────────────────────────
function CompassDisc({ rotation, qiblaBearing, animate, staticMode }) {
  return (
    <svg
      className="qibla-compass-svg"
      viewBox="0 0 320 320"
      aria-hidden="true"
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: animate ? 'transform 0.1s linear' : 'none',
        willChange: 'transform',
      }}
    >
      {/* Background */}
      <circle cx="160" cy="160" r="158" fill="var(--color-bg-card)" stroke="var(--color-border)" strokeWidth="1.5" />
      <circle cx="160" cy="160" r="146" fill="none" stroke="var(--color-border)" strokeWidth="0.5" opacity="0.35" />

      {/* Tick marks — every 5° */}
      {Array.from({ length: 72 }).map((_, i) => {
        const deg = i * 5;
        const rad = (deg * Math.PI) / 180;
        const isMajor = i % 18 === 0;
        const isMed   = i % 6  === 0;
        const isSub   = i % 3  === 0;
        const r1 = 146;
        const r2 = isMajor ? 120 : isMed ? 130 : isSub ? 137 : 142;
        return (
          <line
            key={i}
            x1={160 + r1 * Math.sin(rad)} y1={160 - r1 * Math.cos(rad)}
            x2={160 + r2 * Math.sin(rad)} y2={160 - r2 * Math.cos(rad)}
            stroke="var(--color-text-tertiary)"
            strokeWidth={isMajor ? 2.5 : isMed ? 1.5 : 0.7}
            opacity={isMajor ? 1 : isMed ? 0.6 : 0.28}
          />
        );
      })}

      {/* Degree numbers every 30° — skip cardinal positions */}
      {[30, 60, 120, 150, 210, 240, 300, 330].map(deg => {
        const rad = (deg * Math.PI) / 180;
        return (
          <text key={deg}
            x={160 + 108 * Math.sin(rad)} y={160 - 108 * Math.cos(rad) + 4}
            textAnchor="middle" fontSize="10"
            fill="var(--color-text-muted)" fontFamily="Inter,sans-serif"
          >{deg}</text>
        );
      })}

      {/* Cardinal labels */}
      {[
        { l: 'N', d: 0,   c: '#e74c3c', fw: '800', sz: 22 },
        { l: 'E', d: 90,  c: 'var(--color-text-secondary)', fw: '600', sz: 17 },
        { l: 'S', d: 180, c: 'var(--color-text-secondary)', fw: '600', sz: 17 },
        { l: 'W', d: 270, c: 'var(--color-text-secondary)', fw: '600', sz: 17 },
      ].map(({ l, d, c, fw, sz }) => {
        const rad = (d * Math.PI) / 180;
        return (
          <text key={l}
            x={160 + 120 * Math.sin(rad)} y={160 - 120 * Math.cos(rad) + 6}
            textAnchor="middle" fontSize={sz} fontWeight={fw}
            fill={c} fontFamily="Inter,sans-serif"
          >{l}</text>
        );
      })}

      {/* Static-mode: fixed gold Qibla line on disc (no sensor) */}
      {staticMode && qiblaBearing != null && (() => {
        const rad = (qiblaBearing * Math.PI) / 180;
        return (
          <line x1="160" y1="160"
            x2={160 + 138 * Math.sin(rad)} y2={160 - 138 * Math.cos(rad)}
            stroke="var(--color-gold)" strokeWidth="2.5"
            strokeDasharray="7 5" opacity="0.7"
          />
        );
      })()}

      {/* Live-mode: subtle dashed reference line (rotates with disc) */}
      {!staticMode && qiblaBearing != null && (() => {
        const rad = (qiblaBearing * Math.PI) / 180;
        return (
          <line x1="160" y1="160"
            x2={160 + 138 * Math.sin(rad)} y2={160 - 138 * Math.cos(rad)}
            stroke="var(--color-gold)" strokeWidth="1.5"
            strokeDasharray="5 4" opacity="0.4"
          />
        );
      })()}
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────
// MANUAL LOCATION FORM
// ──────────────────────────────────────────────────────────────
function ManualLocationForm({ onSubmit, onCancel }) {
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [err, setErr] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const la = parseFloat(lat);
    const lo = parseFloat(lon);
    if (isNaN(la) || la < -90 || la > 90) {
      setErr('Latitude must be between −90 and +90.');
      return;
    }
    if (isNaN(lo) || lo < -180 || lo > 180) {
      setErr('Longitude must be between −180 and +180.');
      return;
    }
    setErr('');
    onSubmit(la, lo);
  };

  return (
    <form className="qibla-manual-form" onSubmit={handleSubmit} aria-label="Enter location manually">
      <h3 className="qibla-manual-title">Enter Your Location</h3>
      <div className="qibla-manual-row">
        <label htmlFor="qibla-lat" className="qibla-manual-label">Latitude</label>
        <input
          id="qibla-lat"
          type="number" step="any" min="-90" max="90"
          className="qibla-manual-input"
          placeholder="e.g. 13.08"
          value={lat}
          onChange={e => setLat(e.target.value)}
          required
          aria-required="true"
        />
      </div>
      <div className="qibla-manual-row">
        <label htmlFor="qibla-lon" className="qibla-manual-label">Longitude</label>
        <input
          id="qibla-lon"
          type="number" step="any" min="-180" max="180"
          className="qibla-manual-input"
          placeholder="e.g. 80.27"
          value={lon}
          onChange={e => setLon(e.target.value)}
          required
          aria-required="true"
        />
      </div>
      {err && <p className="qibla-manual-error" role="alert">{err}</p>}
      <div className="qibla-manual-actions">
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Calculate Qibla</button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

// ──────────────────────────────────────────────────────────────
// MAIN QIBLA PAGE
// ──────────────────────────────────────────────────────────────
export default function QiblaPage() {
  // ── Location ─────────────────────────────────────────────────
  // 'idle' | 'requesting' | 'granted' | 'denied' | 'error' | 'unsupported' | 'manual'
  const [locState, setLocState]           = useState('idle');
  const [coords, setCoords]               = useState(null); // { lat, lon }
  const [qiblaBearing, setQiblaBearing]   = useState(null);
  const [showManual, setShowManual]       = useState(false);

  // ── Compass sensor ───────────────────────────────────────────
  // 'idle' | 'requesting' | 'ios-prompt' | 'active' | 'denied' | 'unavailable'
  const [compassState, setCompassState]   = useState('idle');
  const [heading, setHeading]             = useState(null);  // smoothed heading °
  const [sensorEvents, setSensorEvents]   = useState(0);

  const smoothRef   = useRef(null);
  const cleanupRef  = useRef(null);

  // ── DERIVED ──────────────────────────────────────────────────
  const distanceKm = coords
    ? Math.round(calculateDistanceToKaaba(coords.lat, coords.lon))
    : null;

  const turnInfo = heading != null && qiblaBearing != null
    ? calculateTurnDirection(heading, qiblaBearing)
    : null;
  const isAligned     = turnInfo?.direction === 'aligned';
  const isNearAligned = turnInfo && turnInfo.degrees <= NEAR_THRESHOLD && !isAligned;

  const sensorAvailable = compassState === 'active';
  const sensorPending   = compassState === 'idle' || compassState === 'requesting';

  // ── GEOLOCATION ──────────────────────────────────────────────
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) { setLocState('unsupported'); return; }
    setLocState('requesting');
    setShowManual(false);

    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lon } }) => {
        setCoords({ lat, lon });
        setQiblaBearing(calculateQiblaBearing(lat, lon));
        setLocState('granted');
        // Automatically attempt compass (non-blocking)
        if (hasIOSPermissionGate) {
          setCompassState('ios-prompt');
        } else {
          attemptCompass();
        }
      },
      (err) => {
        setLocState(err.code === 1 ? 'denied' : 'error');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 }
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── COMPASS ───────────────────────────────────────────────────
  const attemptCompass = useCallback(async (withPermissionGate = false) => {
    setCompassState('requesting');

    // iOS 13+ gate
    if (withPermissionGate || hasIOSPermissionGate) {
      try {
        const res = await DeviceOrientationEvent.requestPermission();
        if (res !== 'granted') { setCompassState('denied'); return; }
      } catch {
        setCompassState('denied');
        return;
      }
    }

    if (typeof window.DeviceOrientationEvent === 'undefined') {
      setCompassState('unavailable');
      return;
    }

    let receivedCount = 0;

    const handler = (e) => {
      let h = null;
      if (e.webkitCompassHeading != null && !isNaN(e.webkitCompassHeading)) {
        h = e.webkitCompassHeading;                    // iOS — True North
      } else if (e.absolute && e.alpha != null && !isNaN(e.alpha)) {
        h = (360 - e.alpha) % 360;                    // Android absolute
      } else if (e.alpha != null && !isNaN(e.alpha)) {
        h = (360 - e.alpha) % 360;                    // relative fallback
      }
      if (h === null || isNaN(h)) return;

      receivedCount++;
      setSensorEvents(n => n + 1);
      smoothRef.current = smoothHeading(smoothRef.current, h, 0.15);
      setHeading(smoothRef.current);
    };

    window.addEventListener('deviceorientationabsolute', handler, true);
    window.addEventListener('deviceorientation',         handler, true);

    // KEY FIX: timeout → declare unavailable if no data in SENSOR_TIMEOUT_MS
    const timer = setTimeout(() => {
      if (receivedCount === 0) {
        window.removeEventListener('deviceorientationabsolute', handler, true);
        window.removeEventListener('deviceorientation',         handler, true);
        setCompassState('unavailable');
      }
    }, SENSOR_TIMEOUT_MS);

    cleanupRef.current = () => {
      window.removeEventListener('deviceorientationabsolute', handler, true);
      window.removeEventListener('deviceorientation',         handler, true);
      clearTimeout(timer);
    };

    // Only mark active after we're actually listening
    // State will flip to 'active' when first event arrives (below useEffect)
    // For now mark it 'requesting' — it'll resolve in SENSOR_TIMEOUT_MS worst case
    // We track receivedCount separately so setState stays clean
  }, []);

  // Flip compassState to 'active' once we receive the first sensor value
  useEffect(() => {
    if (compassState === 'requesting' && heading !== null) {
      setCompassState('active');
    }
  }, [heading, compassState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { if (cleanupRef.current) cleanupRef.current(); };
  }, []);

  // Haptic on alignment
  useEffect(() => {
    if (isAligned && navigator.vibrate) navigator.vibrate([40, 60, 40]);
  }, [isAligned]);

  // ── MANUAL LOCATION SUBMIT ────────────────────────────────────
  const handleManualSubmit = useCallback((lat, lon) => {
    setCoords({ lat, lon });
    setQiblaBearing(calculateQiblaBearing(lat, lon));
    setLocState('manual');
    setShowManual(false);
    if (compassState === 'idle') attemptCompass();
  }, [compassState, attemptCompass]);

  // ── COMPASS VISUAL CALCULATION ────────────────────────────────
  // Static mode (no sensor): disc stays fixed, gold line shows Qibla bearing
  // Live mode (sensor active): disc rotates -heading so North stays up; needle points at Qibla
  const isStaticMode    = !sensorAvailable;
  const discRotation    = sensorAvailable && heading != null ? -heading : 0;
  const needleRotation  = sensorAvailable && heading != null && qiblaBearing != null
    ? qiblaBearing - heading
    : qiblaBearing ?? 0;   // static: needle simply points at bearing

  // ── GUIDANCE TEXT ─────────────────────────────────────────────
  function getGuidanceText() {
    if (locState === 'idle' || locState === 'requesting') return null;
    if (qiblaBearing === null) return null;

    if (!sensorAvailable) {
      return {
        title: 'Qibla Bearing Calculated',
        sub: `Your Qibla is ${Math.round(qiblaBearing)}° from True North (${cardinalLabel(qiblaBearing)})`,
        status: 'static',
      };
    }
    if (heading === null) return { title: 'Waiting for compass…', sub: '', status: 'waiting' };
    if (isAligned)       return { title: '✓ Facing Qibla',         sub: 'You are facing the direction of the Kaaba', status: 'aligned' };
    if (isNearAligned)   return { title: 'Almost Aligned',         sub: `Turn ${turnInfo.direction === 'left' ? 'left' : 'right'} a little`, status: 'near' };
    return {
      title: `Turn ${turnInfo.direction === 'left' ? 'Left' : 'Right'} ${Math.round(turnInfo.degrees)}°`,
      sub: `Heading ${Math.round(heading)}° → Qibla ${Math.round(qiblaBearing)}°`,
      status: 'normal',
    };
  }

  const guidance = getGuidanceText();

  // ── RENDER ────────────────────────────────────────────────────

  // ── STATE: Location idle / requesting ──
  if (locState === 'idle' || locState === 'requesting') {
    return (
      <main className="qibla-page" id="main-content">
        <div className="qibla-container">
          <div className="qibla-header">
            <Navigation2 size={22} color="var(--color-primary)" aria-hidden="true" />
            <h1>Qibla Direction</h1>
          </div>

          {showManual ? (
            <ManualLocationForm
              onSubmit={handleManualSubmit}
              onCancel={() => setShowManual(false)}
            />
          ) : (
            <div className="qibla-welcome">
              <div className="qibla-welcome-icon" aria-hidden="true">
                <Navigation2 size={40} />
              </div>
              <h2 className="qibla-welcome-title">Find Your Qibla</h2>
              <p className="qibla-welcome-body">
                We need your location to calculate the accurate Qibla direction toward the
                Kaaba in Makkah al-Mukarramah. Your location never leaves your device.
              </p>
              <div className="qibla-welcome-actions">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={requestLocation}
                  disabled={locState === 'requesting'}
                  aria-busy={locState === 'requesting'}
                >
                  <MapPin size={18} aria-hidden="true" />
                  {locState === 'requesting' ? 'Locating…' : 'Use My Location'}
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => setShowManual(true)}
                >
                  <Edit3 size={16} aria-hidden="true" /> Enter Location Manually
                </button>
              </div>
              <p className="qibla-welcome-note">
                Works on laptops and desktops — no compass sensor required.
              </p>
            </div>
          )}
        </div>
      </main>
    );
  }

  // ── STATE: Location denied ──
  if (locState === 'denied') {
    return (
      <main className="qibla-page" id="main-content">
        <div className="qibla-container">
          <div className="qibla-header">
            <Navigation2 size={22} color="var(--color-primary)" aria-hidden="true" />
            <h1>Qibla Direction</h1>
          </div>
          <div className="qibla-error-card">
            <div className="qibla-error-icon icon-error" aria-hidden="true">
              <WifiOff size={32} />
            </div>
            <h2>Location Permission Denied</h2>
            <p>
              To enable location: open your browser's site settings and allow location access,
              then tap <strong>Try Again</strong>. Alternatively, enter your coordinates manually.
            </p>
            <div className="qibla-state-actions">
              <button className="btn btn-primary" onClick={requestLocation} style={{ width: '100%' }}>
                <RefreshCw size={16} /> Try Again
              </button>
              <button className="btn btn-ghost" onClick={() => setShowManual(true)} style={{ width: '100%' }}>
                <Edit3 size={16} /> Enter Location Manually
              </button>
            </div>
          </div>
          {showManual && (
            <ManualLocationForm
              onSubmit={handleManualSubmit}
              onCancel={() => setShowManual(false)}
            />
          )}
        </div>
      </main>
    );
  }

  // ── STATE: Location error / unsupported ──
  if (locState === 'error' || locState === 'unsupported') {
    return (
      <main className="qibla-page" id="main-content">
        <div className="qibla-container">
          <div className="qibla-header">
            <Navigation2 size={22} color="var(--color-primary)" aria-hidden="true" />
            <h1>Qibla Direction</h1>
          </div>
          <div className="qibla-error-card">
            <div className="qibla-error-icon icon-error" aria-hidden="true">
              <MapPin size={32} />
            </div>
            <h2>Location Unavailable</h2>
            <p>
              {locState === 'unsupported'
                ? 'Your browser does not support location services. Please use a modern browser or enter your location manually.'
                : 'Unable to determine your location. Check your GPS or connection and try again.'}
            </p>
            <div className="qibla-state-actions">
              <button className="btn btn-secondary" onClick={requestLocation} style={{ width: '100%' }}>
                <RefreshCw size={16} /> Retry
              </button>
              <button className="btn btn-ghost" onClick={() => setShowManual(true)} style={{ width: '100%' }}>
                <Edit3 size={16} /> Enter Location Manually
              </button>
            </div>
          </div>
          {showManual && (
            <ManualLocationForm
              onSubmit={handleManualSubmit}
              onCancel={() => setShowManual(false)}
            />
          )}
        </div>
      </main>
    );
  }

  // ── MAIN UI (location granted or manual) ──────────────────────
  const guidanceStatus = guidance?.status ?? 'static';

  return (
    <main className="qibla-page" id="main-content" aria-label="Qibla Direction">
      <div className="qibla-container">

        {/* ── Header ── */}
        <div className="qibla-header">
          <Navigation2 size={22} color="var(--color-primary)" aria-hidden="true" />
          <h1>Qibla Direction</h1>
          <div
            className={[
              'qibla-status-dot',
              guidanceStatus === 'aligned' ? 'aligned' :
              guidanceStatus === 'near'    ? 'near'    :
              sensorAvailable              ? 'active'  : '',
            ].join(' ')}
            role="status"
            aria-label={
              guidanceStatus === 'aligned' ? 'Facing Qibla' :
              sensorAvailable              ? 'Compass active' :
                                             'Qibla calculated'
            }
          />
        </div>

        {/* ── Guidance card ── */}
        {guidance && (
          <div
            className={[
              'qibla-guidance-card',
              guidanceStatus === 'aligned' ? 'qibla-card-aligned' :
              guidanceStatus === 'near'    ? 'qibla-card-near'    : '',
            ].join(' ')}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="qibla-guidance-left">
              <div className="qibla-guidance-label">Qibla Guidance</div>
              <div className={[
                'qibla-guidance-main',
                guidanceStatus === 'aligned' ? 'is-aligned' :
                guidanceStatus === 'near'    ? 'is-near'    : '',
              ].join(' ')}>
                {guidance.title}
              </div>
              {guidance.sub && (
                <div className="qibla-guidance-sub">{guidance.sub}</div>
              )}
            </div>
            <div className={[
              'qibla-guidance-badge',
              guidanceStatus === 'aligned' ? 'is-aligned' :
              guidanceStatus === 'near'    ? 'is-near'    : '',
            ].join(' ')} aria-hidden="true">
              {guidanceStatus === 'aligned'
                ? '✓'
                : qiblaBearing != null
                ? `${Math.round(qiblaBearing)}°`
                : '—'}
            </div>
          </div>
        )}

        {/* ── iOS compass prompt (inline, non-blocking) ── */}
        {compassState === 'ios-prompt' && (
          <div className="qibla-inline-banner qibla-banner-info" role="note">
            <Compass size={16} aria-hidden="true" />
            <span>Enable the compass sensor for live heading guidance.</span>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => attemptCompass(true)}
            >
              Enable
            </button>
          </div>
        )}

        {/* ── No sensor banner removed ── */}

        {/* ── Compass ── */}
        <div
          className={['qibla-compass-wrap', isAligned ? 'compass-aligned' : ''].join(' ')}
          role="img"
          aria-label={
            sensorAvailable && heading != null
              ? `Compass showing heading ${Math.round(heading)}°, Qibla at ${Math.round(qiblaBearing ?? 0)}°`
              : `Qibla compass — bearing ${Math.round(qiblaBearing ?? 0)}° from North`
          }
        >
          {/* Qibla label removed from here */}
          <CompassDisc
            rotation={discRotation}
            qiblaBearing={qiblaBearing}
            animate={sensorAvailable}
            staticMode={isStaticMode}
          />

          {/* Qibla needle (placed before logo in DOM to ensure it renders underneath) */}
          {qiblaBearing != null && (
            <div
              className="qibla-needle-wrap"
              aria-hidden="true"
              style={{
                transform: `translateX(-50%) rotate(${needleRotation}deg)`,
                transition: sensorAvailable ? 'transform 0.1s linear' : 'none',
              }}
            >
              <svg viewBox="0 0 24 110" className="qibla-needle-svg" overflow="visible">
                <polygon points="12,8 16.5,95 12,104 7.5,95"
                  fill="rgba(0,0,0,0.15)" transform="translate(1,1)" />
                <polygon points="12,8 16.5,95 12,104 7.5,95"
                  fill="var(--color-primary)" />
                <polygon points="12,8 13.5,52 12,58 10.5,52"
                  fill="rgba(255,255,255,0.25)" />
                <circle cx="12" cy="6" r="7" fill="var(--color-gold)" />
                <circle cx="12" cy="6" r="4" fill="#fff" opacity="0.85" />
                <circle cx="12" cy="6" r="1.5" fill="var(--color-gold)" />
              </svg>
            </div>
          )}

          {/* Fixed center logo (rendered after needle to ensure it stays on top) */}
          <div
            className={['qibla-center', isAligned ? 'is-aligned' : ''].join(' ')}
            aria-hidden="true"
          >
            <img
              src="/channels4_profile.jpg"
              alt=""
              className="qibla-logo"
              draggable="false"
            />
          </div>
        </div>

        {/* ── Sensor mode description (laptop only) ── */}
        {compassState === 'unavailable' && qiblaBearing != null && (
          <p className="qibla-static-desc" aria-live="polite">
            The needle points to your Qibla direction ({Math.round(qiblaBearing)}°) from True North.
            Face that direction using a physical compass or compass-enabled device.
          </p>
        )}

        {/* ── Info grid ── */}
        <div className="qibla-info-grid" role="group" aria-label="Direction information">
          <div className="qibla-info-item">
            <span className="qibla-info-label">Qibla</span>
            <span
              className="qibla-info-value qibla-value-primary"
              aria-label={`Qibla bearing: ${qiblaBearing != null ? `${Math.round(qiblaBearing)} degrees` : 'unknown'}`}
            >
              {qiblaBearing != null ? `${Math.round(qiblaBearing)}°` : '—'}
            </span>
            {qiblaBearing != null && (
              <span className="qibla-info-hint">{cardinalLabel(qiblaBearing)}</span>
            )}
          </div>
          <div className="qibla-info-item">
            <span className="qibla-info-label">Distance</span>
            <span className="qibla-info-value">
              {distanceKm != null ? `${distanceKm.toLocaleString()} km` : '—'}
            </span>
            {distanceKm != null && (
              <span className="qibla-info-hint">to Kaaba</span>
            )}
          </div>
        </div>

        {/* ── Action buttons ── */}
        <div className="qibla-actions-row">
          <button className="btn btn-ghost btn-sm" onClick={requestLocation}>
            <RefreshCw size={14} /> Update Location
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowManual(v => !v)}>
            <Edit3 size={14} /> Manual Entry
          </button>
        </div>

        {/* Manual form (inline toggle) */}
        {showManual && (
          <ManualLocationForm
            onSubmit={handleManualSubmit}
            onCancel={() => setShowManual(false)}
          />
        )}

        {/* ── Calibration tip ── */}
        {sensorAvailable && sensorEvents > CALIBRATION_EVENTS && (
          <div className="qibla-calibration" role="note" aria-live="polite">
            <AlertTriangle size={16} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Calibration Tip</strong>
              Move your phone in a figure-8 motion to improve compass accuracy.
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
