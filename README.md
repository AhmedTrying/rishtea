# RishTea

RishTea is a Next.js application delivering a modern café ordering experience with a full-featured admin dashboard backed by Supabase.

## Requirements
- Node.js 18+ and npm
- Supabase project (URL and anon key)

## Quick Start
```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Configuration
Create a `.env.local` file in the project root and set:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# Optional for admin operations
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```
Do not commit secrets. See `SUPABASE_SETUP_GUIDE.md` for schema and seed.

## Scripts
- `npm run dev` — start development server
- `npm run build` — build for production
- `npm run start` — run production build
- `npm run lint` — run linting

## Interface Gallery

Screenshots are stored under `public/` in PNG format, 800px width, and optimized to be under 500KB each.

### 🎥 Demo Video
[Click here to watch the demo](./public/Demo%20Video.MP4)

[Download demo video](public/Demo%20Videw.MP4)

### Home (Mobile)
- Landing experience with hero, warm background, logo, and primary call-to-action.
<img src="public/rishtea-home-mobile.png" alt="Home interface (mobile) with hero and CTA" width="800">

### Menu (Mobile)
- Mobile menu view showing product cards, categories, and add-to-order actions.
<img src="public/rishtea-menu-mobile.png" alt="Menu interface (mobile) with product cards and categories" width="800">

### Admin Login
- Admin authentication screen with email/password and session handling.
<img src="public/rishtea-admin-login.png" alt="Admin login interface" width="800">

### Admin Dashboard (Main)
- Overview dashboard with recent orders, KPIs, and navigation.
<img src="public/rishtea-admin-main-dashboard.png" alt="Admin main dashboard overview" width="800">

### Admin Dashboard (Advanced)
- Extended dashboard views and enhanced metrics.
<img src="public/rishtea-admin-advanced-dashboard.png" alt="Admin advanced dashboard" width="800">

### Admin: Order Details
- Detailed order view with items, statuses, and customer info.
<img src="public/rishtea-admin-order-details.png" alt="Admin order details interface" width="800">

### Admin: Products List
- Products table with actions to create, edit, and manage inventory.
<img src="public/rishtea-admin-products-list.png" alt="Admin products list interface" width="800">

### Admin: Tax Settings
- Tax rules configuration, thresholds, and calculation settings.
<img src="public/rishtea-admin-tax-settings.png" alt="Admin tax settings interface" width="800">

## Screenshot Guidelines
- Format: PNG
- Width: 800px
- Size: under 500KB each
- Naming: use lowercase, hyphen-separated names matching section titles
- Placement: put images in `public/` and ensure references in this README match file names exactly

## Adding Screenshots
Run the following commands to add images and commit them:
```bash
git add public/rishtea-home-mobile.png public/rishtea-menu-mobile.png
git commit -m "docs(screenshots): add customer interfaces (Home, Menu)"

git add public/rishtea-admin-*.png
git commit -m "docs(screenshots): add Admin interface set"

git add "public/Demo Videw.MP4"
git commit -m "docs(media): add demo video"
```

After all images are added:
```bash
git add README.md
git commit -m "docs: add interface screenshots to README"
git push
```

## Contributing
Create a branch per change and open a PR with description and screenshots.

## License
See `LICENSE` if present. Otherwise, retain author’s original terms.
