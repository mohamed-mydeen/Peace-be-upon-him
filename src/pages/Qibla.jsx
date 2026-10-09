import { useState, useEffect, useRef, useCallback } from 'react';
import { Navigation2, MapPin, RefreshCw, Compass, AlertTriangle, WifiOff } from 'lucide-react';
import { calculateQiblaBearing, calculateTurnDirection, smoothHeading } from '../services/qiblaCalculator';
import './Qibla.css';

const ALIGN_THRESHOLD        = 5;    // degrees — "Facing Qibla"
const NEAR_THRESHOLD         = 15;   // degrees — "Almost aligned"
const SENSOR_TIMEOUT_MS      = 4000; // ms to wait before declaring no sensor
const CALIBRATION_EVENTS     = 40;   // show calibration tip after N events

const hasIOSPermissionGate =
  typeof DeviceOrientationEvent !== 'undefined' &&
  typeof DeviceOrientationEvent.requestPermission === 'function';

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
      <circle cx="160" cy="160" r="158" fill="var(--color-bg-card)" stroke="var(--color-border)" strokeWidth="1.5" />
      <circle cx="160" cy="160" r="146" fill="none" stroke="var(--color-border)" strokeWidth="0.5" opacity="0.35" />

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

export default function QiblaPage() {
  const [locState, setLocState]           = useState('idle'); // 'idle' | 'requesting' | 'granted' | 'denied' | 'error' | 'unsupported'
  const [coords, setCoords]               = useState(null);
  const [qiblaBearing, setQiblaBearing]   = useState(null);
  const [compassState, setCompassState]   = useState('idle'); // 'idle' | 'requesting' | 'ios-prompt' | 'active' | 'denied' | 'unavailable'
  const [heading, setHeading]             = useState(null);
  const [sensorEvents, setSensorEvents]   = useState(0);

  const smoothRef   = useRef(null);
  const cleanupRef  = useRef(null);

  const turnInfo = heading != null && qiblaBearing != null
    ? calculateTurnDirection(heading, qiblaBearing)
    : null;
  const isAligned     = turnInfo?.direction === 'aligned';

  const sensorAvailable = compassState === 'active';

  const attemptCompass = useCallback(async (withPermissionGate = false) => {
    setCompassState('requesting');

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
        h = e.webkitCompassHeading;
      } else if (e.absolute && e.alpha != null && !isNaN(e.alpha)) {
        h = (360 - e.alpha) % 360;
      } else if (e.alpha != null && !isNaN(e.alpha)) {
        h = (360 - e.alpha) % 360;
      }
      if (h === null || isNaN(h)) return;

      receivedCount++;
      setSensorEvents(n => n + 1);
      smoothRef.current = smoothHeading(smoothRef.current, h, 0.15);
      setHeading(smoothRef.current);
    };

    window.addEventListener('deviceorientationabsolute', handler, true);
    window.addEventListener('deviceorientation',         handler, true);

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
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) { setLocState('unsupported'); return; }
    setLocState('requesting');

    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lon } }) => {
        setCoords({ lat, lon });
        setQiblaBearing(calculateQiblaBearing(lat, lon));
        setLocState('granted');
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
  }, [attemptCompass]);

  useEffect(() => {
    if (compassState === 'requesting' && heading !== null) {
      setCompassState('active');
    }
  }, [heading, compassState]);

  useEffect(() => {
    return () => { if (cleanupRef.current) cleanupRef.current(); };
  }, []);

  useEffect(() => {
    if (isAligned && navigator.vibrate) navigator.vibrate([40, 60, 40]);
  }, [isAligned]);

  const isStaticMode    = !sensorAvailable;
  const discRotation    = sensorAvailable && heading != null ? -heading : 0;
  const needleRotation  = sensorAvailable && heading != null && qiblaBearing != null
    ? qiblaBearing - heading
    : qiblaBearing ?? 0;

  if (locState === 'idle' || locState === 'requesting') {
    return (
      <main className="qibla-page qibla-centered-layout" id="main-content">
        <div className="qibla-welcome">
          <div className="qibla-welcome-icon" aria-hidden="true">
            <Navigation2 size={40} />
          </div>
          <h2 className="qibla-welcome-title">Find Your Qibla</h2>
          <p className="qibla-welcome-body">
            We need your location to calculate the accurate Qibla direction toward the
            Kaaba in Makkah al-Mukarramah.
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
          </div>
        </div>
      </main>
    );
  }

  if (locState === 'denied') {
    return (
      <main className="qibla-page qibla-centered-layout" id="main-content">
        <div className="qibla-error-card">
          <div className="qibla-error-icon icon-error" aria-hidden="true">
            <WifiOff size={32} />
          </div>
          <h2>Location Permission Denied</h2>
          <p>Please enable location access in your browser settings to use the compass.</p>
          <div className="qibla-state-actions">
            <button className="btn btn-primary" onClick={requestLocation} style={{ width: '100%' }}>
              <RefreshCw size={16} /> Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (locState === 'error' || locState === 'unsupported') {
    return (
      <main className="qibla-page qibla-centered-layout" id="main-content">
        <div className="qibla-error-card">
          <div className="qibla-error-icon icon-error" aria-hidden="true">
            <MapPin size={32} />
          </div>
          <h2>Location Unavailable</h2>
          <p>
            {locState === 'unsupported'
              ? 'Your browser does not support location services.'
              : 'Unable to determine your location. Check your GPS and try again.'}
          </p>
          <div className="qibla-state-actions">
            <button className="btn btn-secondary" onClick={requestLocation} style={{ width: '100%' }}>
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="qibla-page qibla-centered-layout" id="main-content" aria-label="Qibla Direction">
      
      {compassState === 'ios-prompt' && (
        <div className="qibla-inline-banner qibla-banner-info" role="note" style={{ position: 'absolute', top: '80px', zIndex: 10 }}>
          <Compass size={16} aria-hidden="true" />
          <span>Enable compass sensor for live guidance.</span>
          <button className="btn btn-primary btn-sm" onClick={() => attemptCompass(true)}>Enable</button>
        </div>
      )}

      <div
        className={['qibla-compass-wrap', isAligned ? 'compass-aligned' : ''].join(' ')}
        role="img"
        aria-label="Qibla compass"
      >
        <CompassDisc
          rotation={discRotation}
          qiblaBearing={qiblaBearing}
          animate={sensorAvailable}
          staticMode={isStaticMode}
        />

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
              <polygon points="12,8 16.5,95 12,104 7.5,95" fill="rgba(0,0,0,0.15)" transform="translate(1,1)" />
              <polygon points="12,8 16.5,95 12,104 7.5,95" fill="var(--color-primary)" />
              <polygon points="12,8 13.5,52 12,58 10.5,52" fill="rgba(255,255,255,0.25)" />
              <circle cx="12" cy="6" r="7" fill="var(--color-gold)" />
              <circle cx="12" cy="6" r="4" fill="#fff" opacity="0.85" />
              <circle cx="12" cy="6" r="1.5" fill="var(--color-gold)" />
            </svg>
          </div>
        )}

        <div className={['qibla-center', isAligned ? 'is-aligned' : ''].join(' ')} aria-hidden="true">
          <img src="/channels4_profile.jpg" alt="" className="qibla-logo" draggable="false" />
        </div>
      </div>

      {compassState === 'unavailable' && qiblaBearing != null && (
        <p className="qibla-static-desc" aria-live="polite">
          Point the gold needle {Math.round(qiblaBearing)}° from True North using a physical compass.
        </p>
      )}

      {sensorAvailable && sensorEvents > CALIBRATION_EVENTS && (
        <div className="qibla-calibration" role="note" aria-live="polite">
          <AlertTriangle size={16} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>Move phone in a figure-8 motion to calibrate compass.</div>
        </div>
      )}
    </main>
  );
}
