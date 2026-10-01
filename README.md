# Waypoint

Waypoint is a small React location finder. I built it to explore the browser's Geolocation API and show one location point on an interactive map.

The visitor has to press **Find my location** before the browser asks for permission. If they allow it, Waypoint moves the map to their device's position and displays the coordinates and the accuracy reported by the browser. They can clear the point, or refresh the page to clear it.

This version is designed for GitHub Pages and does not need a database, server, Supabase account, API key, or paid service.

## Try it

1. Open the deployed site over HTTPS.
2. Choose **Try the sample map** to see a fixed example point in Melbourne without requesting device location.
3. Choose **Find my location** to try the browser permission flow on your own device.
4. If you grant permission, the map moves to your location. Choose **Clear point** or refresh the page to remove it from the screen.

The sample is made-up test data. It does not access GPS.

## Run it on your computer

Install Node.js 20.19+ or 22.12+, then run:

```bash
npm install
npm run dev
```

Open the local address Vite prints, usually `http://127.0.0.1:5173`. Browsers allow geolocation on localhost for development. A deployed site needs HTTPS for the browser location API.

## How the location flow works

1. The **Find my location** button calls `findMyLocation()` in `src/App.jsx`.
2. The function checks that the page is in a secure context and that the browser supports geolocation.
3. It calls `navigator.geolocation.getCurrentPosition()` only after the button press. The browser shows its own permission prompt. Waypoint never uses continuous tracking with `watchPosition()`.
4. If the visitor grants permission, the success callback stores latitude, longitude, accuracy, and timestamp in React state. The point is not sent to a Waypoint server or written to browser storage.
5. `FlyToLocation` uses React Leaflet's `useMap()` hook to animate the map to the new coordinates. A circle shows the accuracy radius reported by the browser.
6. If access is declined, unavailable, or times out, the error callback shows a message without adding a point to the map.

The sample coordinates and browser location both follow the same map display flow; the sample button never calls the browser location API.

## Privacy and limitations

- Opening the page does not request location. The visitor must press the button and grant the browser's permission.
- Waypoint uses the coordinates in page memory to centre the map. It does not send them to an app owner, save them to a database, or keep a location history. Refreshing or closing the page clears the point.
- This is a **find your own location** demo. A person who opens the link sees their location on their device; it does not send their position to the person who shared the link. Remote sharing would require a separately configured backend and an explicit sharing flow.
- The map loads tiles from OpenStreetMap. The app includes the required map attribution; the map service receives requests for the visible map tiles and normal network information such as the visitor's IP address.
- Browser accuracy is an estimate and depends on the device and its settings. This is a learning and portfolio project, not an emergency or safety-monitoring tool.

## Main files

- `src/App.jsx` — button interaction, permission handling, result display, and interactive map.
- `src/styles.css` — responsive layout, visual styles, and reduced-motion support.
- `src/main.jsx` — React entry point and Leaflet stylesheet.
- `vite.config.js` — Vite settings, including the GitHub Pages base path.
- `.github/workflows/deploy.yml` — build and GitHub Pages deployment workflow.

## Sources and attribution

- Browser location behavior: [MDN Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API).
- Map tiles: [© OpenStreetMap contributors](https://www.openstreetmap.org/copyright); [tile usage policy](https://operations.osmfoundation.org/policies/tiles/).
