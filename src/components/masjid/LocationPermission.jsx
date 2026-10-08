import { useState } from 'react';
import { LoaderCircle, MapPin, Search } from 'lucide-react';

export default function LocationPermission({
  onRequestLocation,
  requesting,
  denied,
  error,
  hasLocation,
  searching,
  locationLabel,
  onPlaceSearch,
}) {
  const [placeQuery, setPlaceQuery] = useState('');

  const submitPlaceSearch = event => {
    event.preventDefault();
    onPlaceSearch(placeQuery);
  };

  return (
    <section className="nearby-location-prompt" aria-labelledby="nearby-location-title">
      <div className="nearby-location-copy">
        <h2 id="nearby-location-title">Find Masjids Near You</h2>
        <p>Search OpenStreetMap for Masjids within 6 km of your location.</p>
        {denied && (
          <p className="nearby-location-denied" role="alert">
            Location permission was denied. Allow access or search by town or area below.
          </p>
        )}
        {error && <p className="nearby-error-message" role="alert">{error}</p>}
      </div>
      <div className="nearby-search-controls">
        <button
          type="button"
          className="btn btn-primary nearby-search-button"
          onClick={onRequestLocation}
          disabled={requesting || searching}
        >
          {requesting
            ? <><LoaderCircle size={16} className="nearby-loading-icon" /> Finding…</>
            : searching
              ? <><LoaderCircle size={16} className="nearby-loading-icon" /> Searching…</>
              : locationLabel
                ? <><MapPin size={16} /> Use My Location</>
                : hasLocation ? 'Search Again' : <><MapPin size={16} /> Allow Location & Search</>}
        </button>
      </div>
      <form className="nearby-place-search" onSubmit={submitPlaceSearch}>
        <label htmlFor="nearby-place-query">Wrong area? Search by town or area instead</label>
        <div className="nearby-place-search-controls">
          <input
            id="nearby-place-query"
            type="search"
            value={placeQuery}
            onChange={event => setPlaceQuery(event.target.value)}
            placeholder="e.g. Tirunelveli"
            maxLength={100}
            autoComplete="off"
            disabled={requesting || searching}
          />
          <button type="submit" className="btn btn-secondary" disabled={requesting || searching || !placeQuery.trim()}>
            <Search size={16} aria-hidden="true" />
            <span>Search area</span>
          </button>
        </div>
      </form>
    </section>
  );
}
