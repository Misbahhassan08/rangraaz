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
| Admin user | `3000000000` | `admin123` |
| Demo customer | `3000000004` | `demo123` |
| Admin | `3000000001` | `admin123` |
| Customer | `3000000002` | `customer123` |
| Google test customer | `3000000003` | `GOOGLE` |

Remote DB note: the seed command requires `DB_PASSWORD` to be set in `back-end/mystore/.env` or exported in the shell before running against the MySQL database.

## Product Admin Category Flow

The product dashboard at `/dashboard/products` supports creating a category directly inside the product form. If the database has no categories yet, enter a category name in **Create new category**, click **Add**, and the new category is immediately selected for the product.

The same product form now supports creating a subcategory after selecting a category. Product create/update/delete and category/subcategory actions show loading progress, then refresh the dashboard data from the database after the API finishes.

Categories and subcategories can be deleted from the product dashboard. If products are already assigned to the category/subcategory, the dashboard requires choosing another existing category/subcategory first so products are moved instead of losing their classification.

Backend category endpoints used by the dashboard:

```text
GET /products/categories/all/
POST /products/categories/create/
POST /products/subcategories/create/
POST /products/link-category-subcategory/
DELETE /products/categories/<id>/delete/
DELETE /products/subcategories/<id>/delete/
```

The category create API trims blank spaces, rejects empty category names, and returns an existing matching category instead of blocking the workflow.

## Page Studio CMS

The dashboard page builder at `/dashboard/pages` is now the main site CMS surface.

What it supports:

- Saved page list from the current backend database.
- Page title, slug, publish status, meta description, header navigation label, parent menu, sort order, and header menu image.
- Parent page options include existing pages, not only already-published pages, so older draft pages can still be selected while editing.
- Slider blocks with configurable height, image/GIF upload, media fit, link, overlay position, and CTA label.
- Campaign blocks with video, image, or GIF media, configurable height, overlay text position, overlay tone, text alignment, and CTA label.
- Product blocks with selected products and multiple layouts: editorial, clean grid, spotlight, and horizontal scroll.
- Block reordering, block deletion, live previews, and DB refresh after saving.

Backend page handling now uses `products/page_services.py` with `PageBuilderService`, keeping page serialization and page saving separate from the Django view functions.

## Header Builder CMS

The public header is now driven by backend header groups instead of hardcoded React category dropdowns.

Dashboard workflow:

1. Open `/dashboard/header-builder`.
2. Create or edit header groups such as `Ally's`, `Rangraaz`, or `Sale`.
3. Choose button style: `standard`, `featured`, or `sale`.
4. Add direct URL, hover title/subtitle, hover image or GIF, sort order, active status, and dropdown visibility.
5. Open `/dashboard/pages`, create a page, and select the **Header category** where that page should appear.
6. Publish the page and enable **Show in header navigation**.

Default header groups seeded in the database:

```text
Ally's   -> /allproducts?category=ALLY'S
Heera's  -> /allproducts?category=HEERA'S
Rangraaz -> /allproducts?category=Rangraaz
Sale     -> /allproducts?sale=true
```

The old `testpage` page-builder record was removed from the configured database.

Backend header endpoints:

```text
GET/POST /products/header-groups/
GET/POST/DELETE /products/header-groups/<id>/
GET /products/header-nav/
```

## Loading And Mobile Dashboard UX

API actions now use the shared `LoadingButton` and top progress animation for high-touch flows like login, product save/delete, category create/delete, and subcategory create/delete. The dashboard layout uses responsive CSS instead of a fixed mobile sidebar column, so `localhost:5173/dashboard/...` fills the mobile screen correctly.

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

## cPanel Deployment

Do not deploy with a `cpsess...` URL. Use your real domain or subdomain names, for example:

- Frontend: `https://your-domain.com`
- Backend API: `https://api.your-domain.com`

### 1. Prepare Domains In cPanel

1. Create a subdomain for Django, for example `api.your-domain.com`.
2. Use your main domain or another subdomain for React, for example `your-domain.com`.
3. Make sure SSL is enabled for both domains in cPanel SSL/TLS or AutoSSL.

### 2. Deploy Django Backend

Recommended backend location:

```text
/home/CPANEL_USER/rangraaz-backend
```

Upload the contents of:

```text
back-end/mystore/
```

to that folder.

In cPanel:

1. Open **Setup Python App**.
2. Create application.
3. Python version: choose Python 3.9+ if available.
4. Application root: `rangraaz-backend`
5. Application URL: `api.your-domain.com`
6. Application startup file: `passenger_wsgi.py`
7. Application Entry point: `application`
8. Save.

For `rangraaz.net`, use values like:

```text
Application root: rangraaz-backend
Application URL: api.rangraaz.net
Application startup file: passenger_wsgi.py
Application Entry point: application
```

Meaning:

- **Application startup file**: the Python file cPanel imports to start Django. This repo includes `back-end/mystore/passenger_wsgi.py`.
- **Application Entry point**: the WSGI callable variable inside that file. This repo uses `application`.

Then open the cPanel terminal or Python App command panel and run:

```bash
cd ~/rangraaz-backend
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py check
```

Set these environment variables in cPanel Python App:

```text
DJANGO_SECRET_KEY=your-secure-secret-key
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=api.rangraaz.net,rangraaz.net,www.rangraaz.net
DJANGO_CORS_ALLOWED_ORIGINS=https://rangraaz.net,https://www.rangraaz.net
DJANGO_CSRF_TRUSTED_ORIGINS=https://rangraaz.net,https://www.rangraaz.net,https://api.rangraaz.net
DB_NAME=rangraa1_pres562
DB_USER=rangraa1_your_mysql_user
DB_PASSWORD=your-mysql-user-password
DB_HOST=localhost
DB_PORT=3306
GOOGLE_CLIENT_ID=your-google-web-client-id
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
SQUARE_ACCESS_TOKEN=...
SQUARE_LOCATION_ID=...
EMAIL_HOST_USER=...
EMAIL_HOST_PASSWORD=...
SHIPPO_API_KEY=...
```

Restart the Python app from cPanel after changing environment variables.

### Google Cloud Run API Settings

If the Django API is deployed on Google Cloud Run and the React web app runs on `https://rangraaz.net`, set the backend environment variables like this:

```text
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=rangraaz.net,www.rangraaz.net,your-cloud-run-service-url.run.app
DJANGO_CORS_ALLOWED_ORIGINS=https://rangraaz.net,https://www.rangraaz.net
DJANGO_CSRF_TRUSTED_ORIGINS=https://rangraaz.net,https://www.rangraaz.net,https://your-cloud-run-service-url.run.app
DB_NAME=rangraa1_pres562
DB_USER=rangraa1
DB_PASSWORD=your-mysql-user-password
DB_HOST=74.50.90.186
DB_PORT=3306
```

The Django settings already include HTTPS proxy support for Cloud Run with `SECURE_PROXY_SSL_HEADER`, secure cookies when `DJANGO_DEBUG=False`, and MySQL Strict Mode for the database connection.

Deployed login check on 2026-05-17:

- `https://rangraaz.net` returned HTTP 200.
- Cloud Run CORS preflight for `/signin/` returned HTTP 200.
- `/signin/` returned HTTP 500.
- `/products/products/` returned a database error: `Can't connect to local server through socket '/run/mysqld/mysqld.sock'`.
- This means Cloud Run is using `DB_HOST=localhost` or an empty host. For a cPanel MySQL database, Cloud Run must use the external database host/IP, and cPanel must allow Cloud Run's outbound IP in **Remote MySQL**.
- The live frontend bundle points to the Cloud Run API, and the frontend URL helper now trims trailing slashes from `VITE_API_BASE_URL` before building endpoint URLs.

Important: Cloud Run's default outbound IP can change. For reliable cPanel MySQL access, either use a static outbound IP with Cloud NAT, move the database to Cloud SQL, or deploy the Django backend on the same cPanel hosting where `DB_HOST=localhost` is valid.

After Google Cloud Run gives the final API URL, update the frontend production env:

```text
VITE_API_BASE_URL=https://your-cloud-run-service-url.run.app
```

Then rebuild and upload the new frontend `dist` files to the `rangraaz.net` web root.

### Fresh MySQL Database Migration

For a fresh cPanel MySQL database:

1. In cPanel, open **MySQL Databases**.
2. Create database, for example `rangraa1_pres562`.
3. Create a MySQL user, for example `rangraa1_app`.
4. Add that user to the database with **ALL PRIVILEGES**.
5. Put the MySQL user credentials into the Python App environment variables:

```text
DB_NAME=rangraa1_pres562
DB_USER=rangraa1_app
DB_PASSWORD=the_mysql_user_password
DB_HOST=localhost
DB_PORT=3306
```

6. Run:

```bash
cd ~/rangraaz-backend
python manage.py makemigrations --check --dry-run
python manage.py migrate
python manage.py seed_test_users
python manage.py check
```

If migrating from your local machine to the cPanel MySQL host, cPanel must also allow your public IP in **Remote MySQL**. If you see `Access denied for user ...`, either the DB password is wrong, the MySQL user was not granted access to the database, or remote access is not allowed for your IP.

Migration status note:

- Remote MySQL access was fixed and Django can now read/apply migrations.
- All migrations were applied successfully to the fresh MySQL database, including `products.0006_custompage_pageblock`.
- Test users were seeded with `python manage.py seed_test_users`.
- Django reported `mysql.W002` because MySQL Strict Mode is not enabled. Enable Strict Mode in production when the hosting package allows it.

Backend test URLs:

```text
https://api.rangraaz.net/products/products/
https://api.rangraaz.net/products/header-pages/
https://api.rangraaz.net/admin/
```

Expected result:

- Products and header pages return JSON.
- `/admin/` loads Django admin.

### 3. Deploy React Frontend

On your local machine, create a production env file:

```bash
cd front-end
cp .env.example .env.production
```

Set:

```text
VITE_API_BASE_URL=https://your-cloud-run-service-url.run.app
VITE_GOOGLE_CLIENT_ID=your-google-web-client-id
```

Build:

```bash
npm install
npm run lint
npm run build
```

Upload everything inside:

```text
front-end/dist/
```

to your frontend document root, usually:

```text
/home/CPANEL_USER/public_html/
```

The build includes `public/.htaccess`, which is needed so React routes like `/dashboard/pages` and `/page/your-slug` open correctly after refresh.

Frontend test URLs:

```text
https://your-domain.com/
https://your-domain.com/login
https://your-domain.com/allproducts
https://your-domain.com/page/your-page-slug
```

### 4. Google OAuth Production Setup

In Google Cloud Console, open your OAuth 2.0 Web Client.

Add Authorized JavaScript origins:

```text
https://rangraaz.net
https://www.rangraaz.net
```

Add local origins only for development:

```text
http://localhost:5173
http://127.0.0.1:5173
```

If backend verification uses Google tokens, keep the same client ID in backend `GOOGLE_CLIENT_ID`.

### 5. Post Deployment Smoke Test

1. Open frontend home page.
2. Open browser DevTools Network tab.
3. Confirm API calls go to `https://api.your-domain.com`, not `127.0.0.1`.
4. Test normal login with seeded/admin user or real user.
5. Test Google login.
6. Open `/dashboard/pages` as admin.
7. Create a draft page, publish it, and confirm it appears at `/page/slug`.
8. Confirm header menu loads published page-builder tabs.
9. Add a product to cart.
10. Place a test order with COD before testing card payments.

### 6. Common cPanel Issues

- `ModuleNotFoundError`: install missing package in the Python app virtualenv.
- `DisallowedHost`: add domain to `DJANGO_ALLOWED_HOSTS`.
- CORS error: add frontend domain to `DJANGO_CORS_ALLOWED_ORIGINS`.
- React route 404 on refresh: confirm `.htaccess` exists in `public_html`.
- Google `origin_mismatch`: add exact frontend origin in Google Cloud Console.
- Static/admin CSS missing: run `python manage.py collectstatic --noinput`.
