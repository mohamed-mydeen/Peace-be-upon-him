import { WifiOff, MapPinOff, ServerCrash, AlertCircle, Lock } from 'lucide-react';

export function parseError(err, context = 'content') {
  const errStr = (err?.message || err?.toString() || '').toLowerCase();
  
  // Log real technical error in development safely
  if (import.meta.env.DEV) {
    console.error(`[Error in ${context}]:`, err);
  }
  
  if (!navigator.onLine || errStr.includes('failed to fetch') || errStr.includes('network error') || errStr.includes('internet') || errStr.includes('timeout')) {
    return {
      title: 'Connection Offline',
      message: `Your internet connection seems to be offline or unstable. We couldn't load the ${context}.`,
      icon: WifiOff,
      type: 'network'
    };
  }

  if (errStr.includes('location') || errStr.includes('geolocation') || errStr.includes('permission denied')) {
    return {
      title: 'Location Unavailable',
      message: `We couldn't access your location to load the ${context}. Please check your permissions or choose your city manually.`,
      icon: MapPinOff,
      type: 'location'
    };
  }

  if (errStr.includes('500') || errStr.includes('502') || errStr.includes('503') || errStr.includes('unavailable')) {
    return {
      title: 'Service Temporarily Unavailable',
      message: `The ${context} service is currently down. Please try again in a moment.`,
      icon: ServerCrash,
      type: 'server'
    };
  }
  
  if (errStr.includes('401') || errStr.includes('403') || errStr.includes('unauthorized')) {
    return {
      title: 'Access Denied',
      message: `You don't have permission to access this ${context}.`,
      icon: Lock,
      type: 'auth'
    };
  }

  return {
    title: 'Content Unavailable',
    message: `We couldn't load the ${context} right now. Please try again.`,
    icon: AlertCircle,
    type: 'unknown'
  };
}
