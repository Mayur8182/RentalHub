import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LocationPicker.css';

// ── Fix Leaflet's broken default marker icons in Vite ───────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Subcomponent: listen for map clicks ─────────────────────────────────────
function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// ── Subcomponent: fly to a new centre whenever it changes ───────────────────
function FlyTo({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 14, { duration: 1.2 });
  }, [lat, lng, map]);
  return null;
}

// ── Reverse geocode via Nominatim (free, no key needed) ─────────────────────
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

// ── Forward geocode (search) via Nominatim ──────────────────────────────────
async function forwardGeocode(query) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    return await res.json();
  } catch {
    return [];
  }
}

// ── Main component ───────────────────────────────────────────────────────────
/**
 * LocationPicker modal
 *
 * Props:
 *   label       — "Pickup Location" | "Return Location"
 *   value       — current address string
 *   onConfirm   — (address: string, lat: number, lng: number) => void
 *   onClose     — () => void
 */
function LocationPicker({ label, value, onConfirm, onClose }) {
  const DEFAULT_LAT = 20.5937;   // India centre
  const DEFAULT_LNG = 78.9629;
  const DEFAULT_ZOOM = 5;

  const [markerPos,    setMarkerPos]    = useState(null);
  const [address,      setAddress]      = useState(value || '');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [suggestions,  setSuggestions]  = useState([]);
  const [searching,    setSearching]    = useState(false);
  const [geocoding,    setGeocoding]    = useState(false);
  const [flyTarget,    setFlyTarget]    = useState(null);
  const debounceTimer = useRef(null);

  // When user clicks the map
  const handleMapClick = useCallback(async (lat, lng) => {
    setMarkerPos({ lat, lng });
    setGeocoding(true);
    const addr = await reverseGeocode(lat, lng);
    setAddress(addr);
    setSearchQuery(addr);
    setSuggestions([]);
    setGeocoding(false);
  }, []);

  // Debounced search-as-you-type
  const handleSearchInput = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    setAddress(q);   // allow manual typing too
    setSuggestions([]);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (q.trim().length < 3) return;

    debounceTimer.current = setTimeout(async () => {
      setSearching(true);
      const results = await forwardGeocode(q);
      setSuggestions(results);
      setSearching(false);
    }, 500);
  };

  const handleSuggestionClick = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    setMarkerPos({ lat, lng });
    setAddress(item.display_name);
    setSearchQuery(item.display_name);
    setSuggestions([]);
    setFlyTarget({ lat, lng });
  };

  const handleConfirm = () => {
    if (!markerPos && !address.trim()) return;
    onConfirm(
      address.trim() || `${markerPos.lat.toFixed(5)}, ${markerPos.lng.toFixed(5)}`,
      markerPos?.lat ?? null,
      markerPos?.lng ?? null,
    );
  };

  // Try to get user's current location
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      setMarkerPos({ lat, lng });
      setFlyTarget({ lat, lng });
      setGeocoding(true);
      const addr = await reverseGeocode(lat, lng);
      setAddress(addr);
      setSearchQuery(addr);
      setGeocoding(false);
    });
  };

  return (
    <div className="lp-overlay" onClick={onClose}>
      <div className="lp-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="lp-header">
          <div>
            <h3 className="lp-title">📍 {label}</h3>
            <p className="lp-subtitle">Search or click on the map to set location</p>
          </div>
          <button className="lp-close" onClick={onClose}>✕</button>
        </div>

        {/* Search bar */}
        <div className="lp-search-wrap">
          <div className="lp-search-row">
            <input
              type="text"
              className="lp-search-input"
              placeholder="Search address, landmark, city…"
              value={searchQuery}
              onChange={handleSearchInput}
              autoFocus
            />
            <button className="lp-myloc-btn" onClick={handleUseMyLocation} title="Use my current location">
              🎯
            </button>
          </div>

          {/* Autocomplete suggestions */}
          {suggestions.length > 0 && (
            <ul className="lp-suggestions">
              {suggestions.map((item, i) => (
                <li key={i} className="lp-suggestion-item" onClick={() => handleSuggestionClick(item)}>
                  <span className="lp-suggestion-icon">📍</span>
                  <span className="lp-suggestion-text">{item.display_name}</span>
                </li>
              ))}
            </ul>
          )}
          {searching && <div className="lp-searching">Searching…</div>}
        </div>

        {/* Map */}
        <div className="lp-map-wrap">
          <MapContainer
            center={[DEFAULT_LAT, DEFAULT_LNG]}
            zoom={DEFAULT_ZOOM}
            className="lp-map"
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickHandler onPick={handleMapClick} />
            {flyTarget && <FlyTo lat={flyTarget.lat} lng={flyTarget.lng} />}
            {markerPos && <Marker position={[markerPos.lat, markerPos.lng]} />}
          </MapContainer>

          {geocoding && (
            <div className="lp-geocoding-overlay">Getting address…</div>
          )}

          {!markerPos && (
            <div className="lp-hint">Click anywhere on the map to drop a pin</div>
          )}
        </div>

        {/* Selected address preview */}
        {address && (
          <div className="lp-selected-address">
            <span className="lp-selected-icon">📌</span>
            <span className="lp-selected-text">{address}</span>
          </div>
        )}

        {/* Actions */}
        <div className="lp-actions">
          <button className="lp-btn-cancel" onClick={onClose}>Cancel</button>
          <button
            className="lp-btn-confirm"
            onClick={handleConfirm}
            disabled={!address.trim()}
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}

export default LocationPicker;
