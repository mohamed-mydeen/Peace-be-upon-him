import { AlertCircle, LoaderCircle } from 'lucide-react';
import MasjidCard from './MasjidCard';
import { getGoogleMapsSearchUrl } from '../../services/masjidService';

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
    return (
      <div className="nearby-state">
        <AlertCircle size={28} className="nearby-error-icon" />
        <p role="alert">{error}</p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>Retry</button>
        {origin && (
          <a
            className="btn btn-secondary btn-sm"
            href={getGoogleMapsSearchUrl(origin)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Search in Google Maps
          </a>
        )}
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
