import { ExternalLink, MapPin, Navigation, Phone, Clock, Globe, Landmark } from 'lucide-react';
import { getDirectionsUrl } from '../../services/masjidService';

function getSafeWebsiteUrl(website) {
  try {
    const url = new URL(website);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

export default function MasjidCard({ masjid, origin }) {
  const websiteUrl = masjid.website ? getSafeWebsiteUrl(masjid.website) : null;

  return (
    <article className="nearby-masjid-card">
      <div className="nearby-masjid-symbol" aria-hidden="true">
        <Landmark size={22} strokeWidth={1.7} />
      </div>
      <div className="nearby-masjid-heading">
        <div>
          <h3>{masjid.name || 'Masjid'}</h3>
          {!masjid.name && <p className="nearby-masjid-name-missing">Name not listed</p>}
        </div>
      </div>

      <p className="nearby-masjid-distance">{masjid.formattedDistance} away</p>

      {masjid.address && (
        <p className="nearby-masjid-detail">
          <MapPin size={15} aria-hidden="true" />
          <span>{masjid.address}</span>
        </p>
      )}
      {masjid.phone && (
        <p className="nearby-masjid-detail">
          <Phone size={15} aria-hidden="true" />
          <a href={`tel:${masjid.phone}`}>{masjid.phone}</a>
        </p>
      )}
      {masjid.openingHours && (
        <p className="nearby-masjid-detail">
          <Clock size={15} aria-hidden="true" />
          <span>{masjid.openingHours}</span>
        </p>
      )}
      {masjid.website && (
        <p className="nearby-masjid-detail">
          <Globe size={15} aria-hidden="true" />
          {websiteUrl
            ? (
              <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
                Website <ExternalLink size={12} aria-hidden="true" />
              </a>
            )
            : <span>{masjid.website}</span>
          }
        </p>
      )}

      <a
        className="nearby-directions-link"
        href={getDirectionsUrl(masjid, origin)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Directions to ${masjid.name || 'Masjid'}`}
        title="Open directions"
      >
        <Navigation size={18} aria-hidden="true" />
        <span>Directions</span>
      </a>
    </article>
  );
}
