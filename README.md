# RishTea

RishTea is a Next.js application for a café ordering experience with Supabase-backed data and an admin dashboard.

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

## Screenshots
Add UI screenshots under `docs/screenshots/` and reference them here.
- Home
- Login
- Menu
- Track Order
- Admin Dashboard (Customers, Orders, Products, Categories, Settings)

## Contributing
Create a branch per change and open a PR with description and screenshots.

## License
See `LICENSE` if present. Otherwise, retain author’s original terms.