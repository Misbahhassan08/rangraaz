# Rang Raaz Frontend

React + Vite storefront for the Rang Raaz ecommerce experience.

## Brand Direction

Primary pitch line:

**Embrace colors Made for you!**

The current UI direction follows the logo in `public/img/logo.png` / `dist/img/logo.png`: purple-to-magenta accents, airy white surfaces, light typography, soft motion, and fashion-focused imagery.

## Run Commands

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Local Test Users

Seed or refresh local Django test users:

```bash
cd ../back-end/mystore
/home/misbah/miniconda3/envs/IP2/bin/python manage.py seed_test_users
```

Created users:

| Role | Phone | Password |
| --- | --- | --- |
| Admin | `3000000001` | `admin123` |
| Customer | `3000000002` | `customer123` |
| Google test customer | `3000000003` | `GOOGLE` |

## Google OAuth Local Setup

If Google login shows `Error 400: origin_mismatch`, the Google OAuth client does not trust the current frontend origin.

In Google Cloud Console, open the OAuth 2.0 Web Client for this app and add these **Authorized JavaScript origins**:

```text
http://localhost:5173
http://127.0.0.1:5173
```

If testing on a different port or domain, add that exact origin too. The origin must match the browser URL exactly, including protocol, host, and port.

The frontend reads the client ID from:

```bash
VITE_GOOGLE_CLIENT_ID=your-google-web-client-id
```

The backend reads the matching client ID from:

```bash
GOOGLE_CLIENT_ID=your-google-web-client-id
```

## Latest Updates

### UI Brand Polish

- Added global light typography using `Inter` with `Playfair Display` for editorial brand moments.
- Added reusable brand animation and styling helpers in `src/index.css`.
- Updated the home page hero overlay and fallback state around the pitch line.
- Rebuilt the login/sign-up page into a professional branded auth screen with animated glass styling, logo placement, icons, and a gradient CTA.
- Polished the header announcement bar, navigation, logo sizing, and menu styling to better match the Rang Raaz logo.

### Auth And Test Users

- Added repeatable Django test-user seeding with `manage.py seed_test_users`.
- Added frontend and backend `.env.example` files for Google OAuth client ID setup.
- Updated Google OAuth code to read the client ID from environment variables with the existing client ID as fallback.
- Documented the `origin_mismatch` fix for local Vite origins.

### Light/Dark Rebrand

- Added a theme-token system for light and dark storefront modes.
- Rebuilt the header into a cleaner ecommerce navigation with theme toggle, richer collection menus, compact search, and professional mobile drawer.
- Updated the home slider with editorial overlays, slide counter, improved fallback hero, and theme-aware visual treatment.
- Refreshed the product listing toolbar and pagination styling to match the new theme.
- Updated the footer to inherit the new brand surfaces and typography.

### Page Builder CMS

- Added a WordPress-style admin page builder at `/dashboard/pages`.
- Pages can be saved as `draft` or `published`.
- Pages can be shown in the public header as a main tab or attached under another page as a submenu.
- Each page supports layout blocks:
  - `Slider`: image, title, subtitle, height, and link.
  - `Campaign`: video, fallback image, title, subtitle, and height.
  - `Products`: attach selected store products into the page layout.
- Added public dynamic page route `/page/:slug`.
- Added backend page-builder APIs and database models for custom pages and page blocks.
- Header now loads published page-builder navigation dynamically.

Page builder workflow:

1. Login as admin.
2. Open `/dashboard/pages`.
3. Create a page title and slug.
4. Add slider, campaign, and product blocks.
5. Choose whether it appears as a header tab or under another page.
6. Publish it and open `/page/your-slug`.

### Previous Stability Fixes

- Fixed case-sensitive imports so Vite production builds work on Linux.
- Fixed Square payment success callback wiring.
- Updated checkout to use the logged-in customer id instead of a hardcoded user id.
- Fixed sale-products API response fields to match the current Django product model.
- Cleaned frontend lint issues.

## Verification

Run before handoff:

```bash
npm run lint
npm run build
```
