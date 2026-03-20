# PayNow Storefront & Admin Dashboard

A complete Next.js application featuring both a beautiful e-commerce storefront and an admin dashboard for managing PayNow customers. Built with Next.js, TypeScript, and Tailwind CSS.

> **Note:** This project integrates with PayNow API for payment processing and uses Neon PostgreSQL for data storage. Make sure to configure all environment variables before running.

## Features

### 🛍️ Storefront (E-commerce)
- ✅ Beautiful product catalog with tags/categories filtering
- ✅ Product detail pages
- ✅ Shopping cart functionality
- ✅ Checkout flow with delivery options
- ✅ Customer authentication
- ✅ Customer account/profile page
- ✅ Store information display
- ✅ Navigation links
- ✅ Responsive design with dark mode

### 👨‍💼 Admin Dashboard
- ✅ Customer creation with name, email, and optional platform details
- ✅ View all customers in a table format
- ✅ View detailed customer information
- ✅ Generate customer tokens for storefront access
- ✅ Modern UI with Tailwind CSS
- ✅ TypeScript for type safety

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PayNow API credentials (API Key and Store ID)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Create `.env.local` file in the root directory
   - Fill in your PayNow credentials:
     ```env
     # Management API (Server-side)
     PAYNOW_API_KEY=your_api_key_here
     PAYNOW_STORE_ID=your_store_id_here
     PAYNOW_API_BASE_URL=https://api.paynow.gg
     
     # Storefront API (Client-side)
     NEXT_PUBLIC_PAYNOW_API_BASE_URL=https://api.paynow.gg
     ```

3. Run the development server:-
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Routes

### Management API (Admin)
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create a new customer
- `GET /api/customers/[id]` - Get a specific customer
- `POST /api/customers/[id]/token` - Generate a customer token

### Storefront API
- `GET /api/storefront/store` - Get store information
- `GET /api/storefront/products` - List products (with optional tag filter)
- `GET /api/storefront/products/[id]` - Get product details
- `GET /api/storefront/tags` - Get product tags
- `GET /api/storefront/navlinks` - Get navigation links
- `GET /api/storefront/cart` - Get shopping cart
- `POST /api/storefront/cart` - Add item to cart
- `PATCH /api/storefront/cart/[productId]` - Update cart item quantity
- `DELETE /api/storefront/cart/[productId]` - Remove item from cart
- `DELETE /api/storefront/cart` - Clear cart
- `POST /api/storefront/checkout` - Create checkout
- `GET /api/storefront/delivery` - Get delivery options
- `GET /api/storefront/customer` - Get customer information

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── customers/              # Management API routes
│   │   └── storefront/             # Storefront API routes
│   ├── store/                      # Storefront pages
│   │   ├── page.tsx                # Product catalog
│   │   ├── products/[id]/          # Product detail page
│   │   ├── cart/                   # Shopping cart
│   │   ├── checkout/               # Checkout page
│   │   ├── login/                  # Customer login
│   │   └── account/                # Customer account
│   ├── globals.css                 # Global styles
│   ├── layout.tsx                  # Root layout with StorefrontProvider
│   └── page.tsx                    # Admin dashboard
├── components/
│   ├── storefront/                 # Storefront components
│   │   ├── Header.tsx              # Store header with navigation
│   │   ├── ProductCard.tsx        # Product card component
│   │   └── CartSidebar.tsx        # Shopping cart sidebar
│   ├── CreateCustomerForm.tsx      # Customer creation form
│   └── CustomerList.tsx            # Customer list view
├── contexts/
│   └── StorefrontContext.tsx       # Storefront state management
├── lib/
│   ├── paynow.ts                   # Management API client
│   └── storefront.ts               # Storefront API client
└── package.json
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PAYNOW_API_KEY` | Your PayNow API key (Management API) | Yes |
| `PAYNOW_STORE_ID` | Your PayNow store ID | Yes |
| `PAYNOW_API_BASE_URL` | PayNow API base URL (default: https://api.paynow.gg) | No |
| `NEXT_PUBLIC_PAYNOW_API_BASE_URL` | Storefront API base URL (default: https://api.paynow.gg) | No |
| `DATABASE_URL` | Neon PostgreSQL database connection string | Yes |
| `ADMIN_PASSWORD` | Password for admin panel access | Yes |
| `SMTP_HOST` | SMTP server host (e.g., smtp.gmail.com, smtp.sendgrid.net) | Yes |
| `SMTP_PORT` | SMTP server port (default: 587) | No |
| `SMTP_USER` | SMTP username/email | Yes |
| `SMTP_PASSWORD` | SMTP password or app password | Yes |
| `SMTP_FROM_EMAIL` | From email address (defaults to SMTP_USER if not set) | No |
| `SMTP_SECURE` | Use TLS/SSL (true/false, default: false) | No |

## Usage

1. **Admin Dashboard** (`/`):
   - Create customers
   - View customer list
   - Generate customer tokens

2. **Storefront** (`/store`):
   - Browse products
   - Filter by tags
   - Add to cart
   - Checkout
   - Manage account

3. **Customer Login** (`/store/login`):
   - Enter customer ID to get a token
   - Access storefront features

## Storefront Features

- **Products**: Browse and filter products by tags
- **Cart**: Add, update, and remove items
- **Checkout**: Select delivery options and complete orders
- **Account**: View customer profile information
- **Authentication**: Customer token-based authentication

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [PayNow API Documentation](https://docs.paynow.gg)

