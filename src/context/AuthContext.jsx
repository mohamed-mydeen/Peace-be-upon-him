/**
 * AuthContext — Anonymous Device Identity
 *
 * No login, signup, email, or password is required.
 * On every app launch the device is silently registered with the backend using
 * a stable per-device UUID (stored in localStorage).  The backend returns a
 * signed session token that is used for all history/bookmark API calls.
 *
 * Security model:
 *  - The device UUID is generated once via crypto.randomUUID() and persisted.
 *  - The backend (Express + Supabase service-role) maps the UUID to a user row
 *    and returns a server-signed token — the browser cannot forge a different
 *    user's token.
 *  - All per-user data access goes through the Express backend which enforces
 *    user_id scoping server-side.  The Supabase anon-key is never used directly.
 */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { clearHistory, loadHistory, recordHistory as saveHistory, syncOfflineHistory } from '../services/userHistory';

const AuthContext = createContext(null);

const API = import.meta.env.VITE_API_URL || '';   // empty = same-origin (Vite proxy / Vercel serverless)
const DEVICE_ID_KEY   = 'pbuh_device_id';
const DEVICE_TOKEN_KEY = 'pbuh_device_token';

/** Generate or retrieve a stable per-device UUID. */
function getOrCreateDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

/** Call the backend device-registration endpoint. Idempotent — same UUID → same token. */
async function registerDevice(deviceId) {
  const response = await fetch(`${API}/api/device/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ device_id: deviceId }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Device registration failed.');
  return body.token;   // server-signed session token
}

export function AuthProvider({ children }) {
  const [token, setToken]   = useState(() => localStorage.getItem(DEVICE_TOKEN_KEY));
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  // ------------------------------------------------------------------
  // Refresh cloud history for the current device token
  // ------------------------------------------------------------------
  const refreshHistory = useCallback(async (activeToken = token) => {
    if (!activeToken) return [];
    try {
      const nextHistory = await loadHistory(activeToken);
      setHistory(nextHistory);
      return nextHistory;
    } catch {
      return [];
    }
  }, [token]);

  // ------------------------------------------------------------------
  // On mount: register / re-register the device, fetch history
  // ------------------------------------------------------------------
  useEffect(() => {
    let active = true;

    // Clean up any old authenticated-session keys that may linger
    localStorage.removeItem('pbuh_auth_token');
    localStorage.removeItem('pbuh_user_id');
    localStorage.removeItem('pbuh_user_name');

    const init = async () => {
      const deviceId = getOrCreateDeviceId();
      try {
        const newToken = await registerDevice(deviceId);
        localStorage.setItem(DEVICE_TOKEN_KEY, newToken);
        if (!active) return;
        setToken(newToken);
        // Sync any offline-queued history items
        await syncOfflineHistory(newToken, deviceId).catch(() => {});
        await refreshHistory(newToken);
      } catch (err) {
        // If the backend is unreachable, keep using the cached token (works offline)
        console.warn('Device registration skipped (backend unreachable):', err.message);
        if (!active) return;
        // Try to load history with whatever token we already have
        if (token) await refreshHistory(token).catch(() => {});
      } finally {
        if (active) setLoading(false);
      }
    };

    init();
    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // ------------------------------------------------------------------
  // Record an activity in the cloud history
  // ------------------------------------------------------------------
  const recordHistory = useCallback(async (activityType, details) => {
    if (!token) return null;
    try {
      const activity = await saveHistory(token, getOrCreateDeviceId(), { activityType, details });
      if (activity) setHistory(current => [activity, ...current]);
      return activity;
    } catch {
      return null;
    }
  }, [token]);

  // ------------------------------------------------------------------
  // Clear the cloud history for this device
  // ------------------------------------------------------------------
  const removeHistory = useCallback(async () => {
    if (!token) return;
    try {
      await clearHistory(token);
      setHistory([]);
    } catch {
      // silently ignore
    }
  }, [token]);

  // ------------------------------------------------------------------
  // Expose a minimal surface — no user profile, no login/logout
  // ------------------------------------------------------------------
  return (
    <AuthContext.Provider value={{
      // Backward-compatible shape — pages that check `user` will see null
      user: null,
      token,
      loading,
      history,
      // Stubs for any remaining callers of the old API
      register: () => Promise.resolve(null),
      login:    () => Promise.resolve(null),
      logout:   () => {},
      updateProfile: () => Promise.resolve(null),
      refreshHistory,
      recordHistory,
      removeHistory,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
