# Copilot Instructions for DearGift Galaxy Project

## Project Overview
- DearGift is a web-based system for creating, viewing, and sharing interactive 3D galaxy messages with custom text, icons, images, and audio.
- The main user flows are: create galaxy (`creator.html`/`creator.js`), view galaxy (`index.html`/`galaxy-viewer.js`), share galaxy (`share.html`), and manage galaxies (`dashboard.html`).
- Data is stored in Firestore (production) and localStorage (dev/demo). Each galaxy is identified by a unique ID and can be accessed via `index.html?id=...`.

## Key Files & Structure
- `index.html` / `galaxy-viewer.js`: Loads and renders a galaxy by ID, supports demo mode, handles all 3D/particle/heart effects, and fetches data from Firestore/localStorage.
- `creator.html` / `creator.js`: UI and logic for creating a new galaxy, including form handling, image/audio upload, and saving to Firestore/localStorage.
- `dashboard.html`: Lists all created galaxies, shows stats, and allows deletion.
- `galaxy-viewer.css`: All main styles for the viewer and effects.
- `detect-devtools.js`: Prevents devtools inspection in production.

## Data Flow & Integration
- Galaxy data is fetched by ID from Firestore (`galaxies` collection) or from localStorage (`deargift_galaxies`).
- Demo mode uses hardcoded data (`demoGalaxyDataDefault` in `galaxy-viewer.js`) or custom data from localStorage.
- Images and audio are referenced by URL or base64; in production, files should be uploaded to cloud storage.
- QR code generation uses the QR Server API.

## Developer Workflows
- Local development: Use VS Code Live Server, open `home.html` or `creator.html`.
- To test a galaxy: create via `creator.html`, then open `index.html?id=YOUR_ID`.
- For demo: open `index.html?demo=1`.
- Deploy: Push to GitHub, then Netlify auto-deploys.
- No build step; all JS is vanilla and loaded directly in HTML.

## Project Conventions
- All user data is stored as JSON objects, with field names in camelCase.
- Responsive breakpoints: >768px (desktop), ≤768px (mobile), ≤480px (small mobile).
- Particle and animation counts are tuned for device type (see `maxParticles`, `starCount`).
- All Firestore access is via the Firebase JS SDK v8, loaded dynamically if not present.
- Customization (colors, demo data, etc.) is done via constants in `galaxy-viewer.js` and CSS variables.

## Troubleshooting & Gotchas
- If a galaxy does not load, check Firestore rules, correct `storageBucket` config, and console errors.
- Audio playback requires user interaction due to browser policies.
- For performance on mobile, reduce `maxParticles` and avoid large images.
- Devtools are blocked in production by `detect-devtools.js`.

## Example Patterns
- Fetching a galaxy by ID:
  ```js
  const doc = await db.collection('galaxies').doc(galaxyId).get();
  if (!doc.exists) showError();
  else galaxyData = doc.data();
  ```
- Demo mode fallback:
  ```js
  if (!galaxyId) galaxyData = demoGalaxyDataDefault;
  ```
- Responsive particle count:
  ```js
  const maxParticles = isSmallMobile ? 80 : isMobile ? 120 : 300;
  ```

## See Also
- `README.md` for user-facing instructions and feature list.
- All main logic is in root directory; no build tools or frameworks are used.
