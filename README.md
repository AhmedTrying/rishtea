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

All screenshots should be placed under `docs/screenshots/` in PNG format, 800px width, and optimized to be under 500KB each.

### Home
- Overview of the landing page with hero section, video background, and call-to-action.
<img src="docs/screenshots/home.png" alt="Home interface with hero, video background, and start order CTA" width="800">

### Login
- Customer login interface, minimal inputs and error state handling.
<img src="docs/screenshots/login.png" alt="Customer login interface" width="800">

### Menu
- Interactive menu view showing product cards, categories, and add-to-order actions.
<img src="docs/screenshots/menu.png" alt="Menu interface with product cards and categories" width="800">

### Track Order
- Real-time order tracking screen by code/ID, showing status and items.
<img src="docs/screenshots/track-order.png" alt="Order tracking interface by order code" width="800">

### Payment
- Payment step with table number capture and method selection.
<img src="docs/screenshots/payment.png" alt="Payment interface with method selection" width="800">

### Profile
- User profile page for preferences and saved information.
<img src="docs/screenshots/profile.png" alt="User profile interface" width="800">

### Admin Login
- Admin authentication screen with role-gated access.
<img src="docs/screenshots/admin-login.png" alt="Admin login interface" width="800">

### Admin Dashboard (Overview)
- Overview dashboard with recent orders, stats, navigation to modules.
<img src="docs/screenshots/admin-dashboard.png" alt="Admin dashboard overview" width="800">

### Admin: Add-ons
- Manage add-on items, create/update, and assign to products.
<img src="docs/screenshots/admin-add-ons.png" alt="Admin add-ons management interface" width="800">

### Admin: Categories
- Category management with create/edit and visibility controls.
<img src="docs/screenshots/admin-categories.png" alt="Admin categories management interface" width="800">

### Admin: Customers
- Customer management list with search and details.
<img src="docs/screenshots/admin-customers.png" alt="Admin customers interface" width="800">

### Admin: Customization
- Define customization groups and options applied to products.
<img src="docs/screenshots/admin-customization.png" alt="Admin customization groups and options interface" width="800">

### Admin: Discounts
- Discount management, codes and rules.
<img src="docs/screenshots/admin-discounts.png" alt="Admin discounts interface" width="800">

### Admin: Enhanced Products
- Enhanced product management features and bulk updates.
<img src="docs/screenshots/admin-enhanced.png" alt="Admin enhanced product management interface" width="800">

### Admin: Orders
- Orders list with details, status updates, and recent activity.
<img src="docs/screenshots/admin-orders.png" alt="Admin orders interface" width="800">

### Admin: Products
- Products table with create/edit and inventory controls.
<img src="docs/screenshots/admin-products.png" alt="Admin products table interface" width="800">

### Admin: Product Preview
- Single product preview page showing images and customizations.
<img src="docs/screenshots/admin-product-preview.png" alt="Admin product preview interface" width="800">

### Admin: New Product
- Form for creating a new product with images and variants.
<img src="docs/screenshots/admin-product-new.png" alt="Admin new product interface" width="800">

### Admin: Settings
- Store settings including payment methods and branding.
<img src="docs/screenshots/admin-settings.png" alt="Admin store settings interface" width="800">

### Admin: Taxes
- Tax rules configuration and calculation settings.
<img src="docs/screenshots/admin-taxes.png" alt="Admin tax rules interface" width="800">

### Admin: Users
- Staff/user management with roles.
<img src="docs/screenshots/admin-users.png" alt="Admin users management interface" width="800">

## Screenshot Guidelines
- Format: PNG
- Width: 800px
- Size: under 500KB each
- Naming: use lowercase, hyphen-separated names matching section titles
- Placement: put images in `docs/screenshots/` and ensure references in this README match file names exactly

## Adding Screenshots
Run the following commands to add images and commit them:
```bash
git add docs/screenshots/home.png
git commit -m "docs(screenshots): add Home interface"

git add docs/screenshots/login.png docs/screenshots/menu.png docs/screenshots/track-order.png
git commit -m "docs(screenshots): add customer interfaces (Login, Menu, Track Order)"

git add docs/screenshots/payment.png docs/screenshots/profile.png
git commit -m "docs(screenshots): add Payment and Profile interfaces"

git add docs/screenshots/admin-*.png
git commit -m "docs(screenshots): add Admin interface set"
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