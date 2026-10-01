import { useEffect, useRef, useState } from 'react';
import {
  ArrowDownRight,
  CheckCircle2,
  Clock3,
  Compass,
  Crosshair,
  ExternalLink,
  MapPin,
  Navigation,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { Circle, CircleMarker, MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet';

const sampleLocation = {
  latitude: -37.8136,
  longitude: 144.9631,
  accuracy: 180,
  timestamp: Date.now(),
};

function FlyToLocation({ location }) {
  const map = useMap();
  const previousLocation = useRef(null);

  useEffect(() => {
    if (location) {
      map.flyTo([location.latitude, location.longitude], 14, { duration: 1.35 });
    } else if (previousLocation.current) {
      map.flyTo([-27.5, 133.5], 3, { duration: 0.9 });
    }
    previousLocation.current = location;
  }, [location, map]);

  return null;
}

function Brand() {
  return (
    <a className="brand" href="#top" aria-label="Waypoint home">
      <span className="brand-mark"><Crosshair size={18} strokeWidth={2.2} /></span>
      <span>waypoint<span className="brand-dot">.</span></span>
    </a>
  );
}

function MapView({ location, isSample }) {
  const hasPoint = Boolean(location);
  const center = hasPoint ? [location.latitude, location.longitude] : [-27.5, 133.5];

  return (
    <div className="map-frame" aria-label={hasPoint ? 'Map centred on the selected location' : 'Map ready for a location'}>
      <MapContainer center={[-27.5, 133.5]} zoom={3} scrollWheelZoom={false} zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="topright" />
        <FlyToLocation location={location} />
        {hasPoint && (
          <>
            <Circle
              center={center}
              radius={Math.max(20, location.accuracy || 0)}
              pathOptions={{ color: '#91a733', fillColor: '#cfdf79', fillOpacity: 0.2, weight: 1.5 }}
            />
            <CircleMarker
              center={center}
              radius={8}
              pathOptions={{ color: '#fffefa', fillColor: '#314b24', fillOpacity: 1, weight: 4 }}
            />
          </>
        )}
      </MapContainer>
      <div className="map-top-label"><span className={`map-live-dot ${hasPoint ? 'is-active' : ''}`} />{hasPoint ? (isSample ? 'SAMPLE LOCATION' : 'YOUR DEVICE LOCATION') : 'MAP READY'}</div>
      {!hasPoint && (
        <div className="map-quiet-note">
          <Compass size={28} />
          <span>Your map will centre here<br />after you choose to continue.</span>
        </div>
      )}
      {hasPoint && (
        <div className="map-coordinate-chip"><MapPin size={14} />{location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°</div>
      )}
    </div>
  );
}

function describeLocationError(error) {
  if (error.code === 1) return 'Location access was declined. You can allow it in your browser settings and try again.';
  if (error.code === 2) return 'Your device could not determine a location. Check that location services are enabled, then try again.';
  if (error.code === 3) return 'Your browser did not return a location in time. On Windows, check that Location services and desktop app access are on, or try this page in Chrome or Edge. The sample map works without location access.';
  return 'This browser could not get a location. Check browser support and device settings, then try again.';
}

function formatTime(timestamp) {
  return new Intl.DateTimeFormat('en-AU', { hour: 'numeric', minute: '2-digit' }).format(new Date(timestamp));
}

export default function App() {
  const [location, setLocation] = useState(null);
  const [source, setSource] = useState('device');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function findMyLocation() {
    setError('');

    if (!window.isSecureContext) {
      setError('Location access requires a secure connection. Open this site over HTTPS or use localhost while developing.');
      return;
    }
    if (!('geolocation' in navigator)) {
      setError('This browser does not provide location access. Try a recent browser on a location-enabled device.');
      return;
    }

    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords, timestamp }) => {
        setLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          timestamp,
        });
        setSource('device');
        setBusy(false);
      },
      (issue) => {
        setError(describeLocationError(issue));
        setBusy(false);
      },
      { enableHighAccuracy: false, maximumAge: 30_000, timeout: 30_000 },
    );
  }

  function showSample() {
    setError('');
    setLocation({ ...sampleLocation, timestamp: Date.now() });
    setSource('sample');
  }

  function clearLocation() {
    setLocation(null);
    setError('');
  }

  return (
    <div id="top">
      <header className="site-header">
        <Brand />
        <div className="header-right">
          <span className="mode-pill"><span className="status-dot" />ON-DEVICE DEMO</span>
          <a className="header-link" href="#how-it-works">How it works <ArrowDownRight size={14} /></a>
        </div>
      </header>

      <main>
        <section className="hero section-wrap">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-line" />A SIMPLE LOCATION FINDER</p>
            <h1>Find your place,<br /><em>on your terms.</em></h1>
            <p className="hero-intro">Use your device’s location to place one point on the map. Waypoint asks first and keeps the result in this page.</p>
            <div className="hero-actions">
              <button className="button button-primary" type="button" onClick={findMyLocation} disabled={busy}>
                <Crosshair size={16} />{busy ? 'Finding your location…' : 'Find my location'}
              </button>
              <button className="button button-quiet" type="button" onClick={showSample} disabled={busy}>
                Try the sample map <ArrowDownRight size={15} />
              </button>
              {location && (
                <button className="button button-quiet clear-button" type="button" onClick={clearLocation}>
                  <RotateCcw size={14} /> Clear point
                </button>
              )}
            </div>
            {error && <p className="inline-error" role="alert">{error}</p>}
            <div className="hero-assurance"><ShieldCheck size={16} /><span>Your location is not sent to an owner or saved by this app.</span></div>
            <p className="permission-hint">Your browser will show a location permission prompt after you press the button.</p>
          </div>

          <div className="hero-aside">
            <div className="map-card">
              <MapView location={location} isSample={source === 'sample'} />
              <div className="map-card-footer">
                <span><span className={`tiny-signal ${location ? 'signal-active' : ''}`} /><strong>{location ? (source === 'sample' ? 'Example point on map' : 'Location found on this device') : 'Nothing located yet'}</strong></span>
                <span>{location ? (source === 'sample' ? 'SAMPLE DATA' : `FOUND ${formatTime(location.timestamp).toUpperCase()}`) : 'WAITING FOR YOU'}</span>
              </div>
            </div>
            <div className="floating-note"><span className="floating-icon"><Navigation size={16} /></span><span><strong>One tap. One point.</strong><small>No tracking in the background.</small></span></div>
          </div>
        </section>

        {location && (
          <section className="location-result section-wrap" aria-live="polite">
            <div className="result-heading"><span className="result-icon"><CheckCircle2 size={19} /></span><div><p className="eyebrow">{source === 'sample' ? 'SAMPLE RESULT' : 'LOCATION FOUND'}</p><h2>{source === 'sample' ? 'A sample point in Melbourne' : 'Your device is here.'}</h2></div></div>
            <div className="result-coordinates">
              <div><span>LATITUDE</span><strong>{location.latitude.toFixed(6)}</strong></div>
              <div><span>LONGITUDE</span><strong>{location.longitude.toFixed(6)}</strong></div>
              <div><span>APPROX. ACCURACY</span><strong>±{Math.round(location.accuracy)} metres</strong></div>
            </div>
            <p className="result-note"><Clock3 size={14} /> Found at {formatTime(location.timestamp)} · This point clears when you refresh or close the page.</p>
          </section>
        )}

        <section className="trust-strip" aria-label="How location privacy works">
          <div><ShieldCheck size={17} /><span>You choose when to ask</span></div>
          <div><MapPin size={17} /><span>One location point</span></div>
          <div><RotateCcw size={17} /><span>Refresh to clear it</span></div>
        </section>

        <section className="how section-wrap" id="how-it-works">
          <div className="section-title"><div><p className="eyebrow">A clear, simple flow</p><h2>Three steps. <em>No surprises.</em></h2></div><p>Waypoint uses the browser’s built-in location API. The browser controls permission; the app uses the result to centre the map.</p></div>
          <div className="steps-grid">
            <article className="step-card"><span className="step-number">01</span><span className="step-icon"><Crosshair size={19} /></span><h3>You press the button</h3><p>Waypoint does not ask for your location when the page first opens.</p></article>
            <article className="step-card"><span className="step-number">02</span><span className="step-icon"><ShieldCheck size={19} /></span><h3>Your browser asks</h3><p>Allow location access to continue. If you decline, no point appears.</p></article>
            <article className="step-card"><span className="step-number">03</span><span className="step-icon"><MapPin size={19} /></span><h3>The map moves to you</h3><p>The point is shown in this browser only and is not sent to a host.</p></article>
          </div>
        </section>
      </main>

      <footer className="site-footer"><Brand /><span>Thoughtful by design. Private by default.</span><a href="https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API" target="_blank" rel="noreferrer">How browser location works <ExternalLink size={13} /></a></footer>
    </div>
  );
}
