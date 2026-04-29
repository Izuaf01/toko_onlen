# E-Commerce Mini — Agent Instructions

## Project Overview

Build a **Mini E-Commerce (Toko Online)** using **Next.js 16 App Router**, **TypeScript**, and **Tailwind CSS v4**. This is a full-stack web app with customer-facing storefront and an admin dashboard.

---

## Tech Stack

| Layer            | Technology                                                          |
| ---------------- | ------------------------------------------------------------------- |
| Framework        | Next.js 16 (App Router)                                             |
| Language         | TypeScript                                                          |
| Styling          | Tailwind CSS v4                                                     |
| State Management | React Context API (Cart & Auth)                                     |
| Database         | SQLite via `better-sqlite3` or JSON file for simplicity             |
| Image Upload     | Next.js built-in API route + `fs` module (local `/public/uploads/`) |
| Auth (Admin)     | Simple session-based auth via `next-auth` or custom JWT cookie      |

---

## Project Structure

app/
├── layout.tsx # Root layout (navbar, cart context provider)
├── page.tsx # Home → redirect to /products
├── globals.css
│
├── products/
│ ├── page.tsx # Product listing page
│ └── [id]/
│ └── page.tsx # Product detail page
│
├── cart/
│ └── page.tsx # Cart page
│
├── checkout/
│ ├── page.tsx # Checkout form
│ └── success/
│ └── page.tsx # Order success page
│
├── orders/
│ └── page.tsx # Customer order history
│
└── admin/
├── layout.tsx # Admin layout (sidebar, auth guard)
├── page.tsx # Admin dashboard overview
├── products/
│ ├── page.tsx # Product management table
│ ├── new/
│ │ └── page.tsx # Add new product form
│ └── [id]/
│ └── edit/
│ └── page.tsx # Edit product form
└── orders/
└── page.tsx # All orders list

components/
├── Navbar.tsx
├── ProductCard.tsx
├── CartItem.tsx
├── CheckoutForm.tsx
├── AdminSidebar.tsx
└── ImageUpload.tsx

context/
└── CartContext.tsx

lib/
├── db.ts # Database helper (SQLite or JSON)
├── auth.ts # Auth utilities
└── types.ts # Shared TypeScript types

app/api/
├── products/
│ ├── route.ts # GET all, POST new
│ └── [id]/
│ └── route.ts # GET one, PUT update, DELETE
├── orders/
│ ├── route.ts # GET all orders, POST new order
│ └── [id]/
│ └── route.ts # GET single order
├── upload/
│ └── route.ts # POST image upload
└── auth/
└── route.ts # Login/logout

## TypeScript Types (`lib/types.ts`)

Define these types:

```ts
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: string;
  createdAt: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  address: string;
  items: CartItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered";
  createdAt: string;
};
```

```
Feature Specifications
1. Product Listing (/products)
Grid layout (3 columns desktop, 2 tablet, 1 mobile)
Each card shows: image, name, price, "Add to Cart" button
Filter by category (dropdown)
Search bar (client-side filter)
Loading skeleton state
2. Product Detail (/products/[id])
Large product image
Name, price, description, stock indicator
Quantity selector (respect stock limit)
"Add to Cart" button
"Back to Products" link
3. Cart (/cart)
List all cart items with image, name, price, quantity controls
Remove item button
Subtotal per item
Total price summary
"Proceed to Checkout" button
Empty cart state with illustration
4. Checkout (/checkout)
Form fields: Name, Email, Phone, Address (textarea), City, Postal Code
Order summary sidebar (items + total)
Submit creates an order via POST /api/orders
On success redirect to /checkout/success
Basic client-side validation (required fields, email format)
5. Order History (/orders)
List orders by email lookup (simple — no login required for customers)
Show order ID, date, total, status badge (color-coded)
Expandable order detail row showing items
6. Admin Dashboard (/admin)
Protected route — redirect to login if not authenticated
Overview cards: Total Products, Total Orders, Revenue, Pending Orders
Recent orders table
7. Admin Product Management (/admin/products)
Table with: image thumbnail, name, price, stock, category, actions (Edit / Delete)
"Add New Product" button → /admin/products/new
Confirmation dialog before delete
Optimistic UI updates
8. Admin Product Form (/admin/products/new & /admin/products/[id]/edit)
Fields: Name, Description, Price, Stock, Category, Image Upload
Image upload component: drag-and-drop or file picker
Preview uploaded image before save
Submit calls POST /api/products or PUT /api/products/[id]
9. Image Upload API (/api/upload)
Accept multipart/form-data
Validate: only image/jpeg, image/png, image/webp; max 2MB
Save to /public/uploads/ with a unique filename (crypto.randomUUID())
Return { url: "/uploads/filename.ext" }
10. Admin Order Management (/admin/orders)
Table: order ID, customer name, date, total, status
Dropdown to update order status inline
Filter by status

API Routes Behavior
GET /api/products — list all products
POST /api/products — create product (admin only)
GET /api/products/[id] — single product
PUT /api/products/[id] — update product (admin only)
DELETE /api/products/[id] — delete product (admin only)
GET /api/orders — list orders (admin: all; customer: by email query param)
POST /api/orders — create order (public)
PUT /api/orders/[id] — update status (admin only)
POST /api/upload — upload image (admin only)
POST /api/auth — login with username/password, set HTTP-only cookie
DELETE /api/auth — logout, clear cookie
Admin credentials default: admin / admin123 (store hashed in env or lib/auth.ts).

Cart Context (context/CartContext.tsx)
Implement using useContext + useReducer:

Actions: ADD_ITEM, REMOVE_ITEM, UPDATE_QUANTITY, CLEAR_CART
Persist to localStorage
Expose: items, totalItems, totalPrice, addItem(), removeItem(), updateQuantity(), clearCart()

Styling Guidelines
Use Tailwind CSS v4 utility classes only — no custom CSS except globals.css
Color scheme: primary indigo-600, accent amber-500, neutral grays
Consistent border radius: rounded-xl for cards, rounded-lg for buttons
Hover/focus states on all interactive elements
Mobile-first responsive design
Use clsx or template literals for conditional classes

Data Persistence
Use a JSON file (data/db.json) for simplicity with this structure:

{
  "products": [],
  "orders": []
}

All read/write operations go through lib/db.ts helper functions. Use fs (Node.js) in API routes only — never in client components.

Seed the database with 6 sample products on first run.

Code Quality Rules
All components must be typed with TypeScript (no any)
Server Components by default; add "use client" only when needed (interactivity, hooks)
API routes must return proper HTTP status codes
Validate all form inputs server-side in API routes
Never expose admin-only API routes without checking the auth cookie
Image alt attributes are required on all <img> / <Image> tags

Implementation Order
Build in this sequence:

lib/types.ts + lib/db.ts + seed data
API routes (products → orders → upload → auth)
CartContext + root layout
Storefront pages (products list → detail → cart → checkout → success → orders)
Admin layout + auth guard
Admin pages (dashboard → products → orders)
ImageUpload component + wire up to product forms
```
