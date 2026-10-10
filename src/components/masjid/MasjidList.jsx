import { AlertCircle, LoaderCircle } from 'lucide-react';
import MasjidCard from './MasjidCard';
import { getGoogleMapsSearchUrl } from '../../services/masjidService';
import FriendlyError from '../ui/FriendlyError';
import { parseError } from '../../utils/errorHandling';

export default function MasjidList({ masjids, origin, radiusKm, loading, error, searched, onRetry }) {
  if (loading) {
    return (
      <div className="nearby-state" role="status">
        <LoaderCircle className="nearby-loading-icon" size={28} />
        <p>Searching within {radiusKm} km…</p>
      </div>
    );
  }

  if (error) {
    const parsed = parseError(error, 'nearby masjids');
    return (
      <div style={{ marginTop: '1rem' }}>
        <FriendlyError 
          title={parsed.title} 
          message={parsed.message} 
          icon={parsed.icon} 
          onRetry={onRetry} 
          secondaryAction={origin ? () => window.open(getGoogleMapsSearchUrl(origin), '_blank') : null}
          secondaryActionLabel="Search Google Maps"
        />
      </div>
    );
  }

  if (!searched) {
    return (
      <div className="nearby-state">
        <p>Allow location access to see Masjids near you.</p>
      </div>
    );
  }

  if (!masjids.length) {
    return (
      <div className="nearby-state">
        <p>No Masjids found within {radiusKm} km.</p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="nearby-masjid-list" aria-label="Nearby Masjids">
      {masjids.map(masjid => (
        <MasjidCard
          key={masjid.id}
          masjid={masjid}
          origin={origin}
        />
      ))}
    </div>
  );
}
