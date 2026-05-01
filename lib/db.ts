import fs from "fs";
import path from "path";
import type { DB, Product, Order, User } from "./types";

const DB_PATH = path.join(process.cwd(), "data", "db.json");
const LOCK_PATH = DB_PATH + ".lock";
const LOCK_TIMEOUT = 5000;

const SEED_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Wireless Headphones",
    description:
      "Premium noise-cancelling wireless headphones with 30-hour battery life and superior sound quality.",
    price: 299000,
    stock: 15,
    imageUrl: "/uploads/placeholder-headphones.jpg",
    category: "Electronics",
    createdAt: new Date("2024-01-01").toISOString(),
  },
  {
    id: "2",
    name: "Running Shoes",
    description:
      "Lightweight and breathable running shoes with cushioned sole for maximum comfort during workouts.",
    price: 450000,
    stock: 30,
    imageUrl: "/uploads/placeholder-shoes.jpg",
    category: "Fashion",
    createdAt: new Date("2024-01-02").toISOString(),
  },
  {
    id: "3",
    name: "Stainless Steel Water Bottle",
    description:
      "Insulated 500ml stainless steel water bottle keeps drinks cold for 24 hours or hot for 12 hours.",
    price: 85000,
    stock: 50,
    imageUrl: "/uploads/placeholder-bottle.jpg",
    category: "Home & Kitchen",
    createdAt: new Date("2024-01-03").toISOString(),
  },
  {
    id: "4",
    name: "Mechanical Keyboard",
    description:
      "Compact TKL mechanical keyboard with Cherry MX switches, RGB backlight, and USB-C connectivity.",
    price: 750000,
    stock: 10,
    imageUrl: "/uploads/placeholder-keyboard.jpg",
    category: "Electronics",
    createdAt: new Date("2024-01-04").toISOString(),
  },
  {
    id: "5",
    name: "Yoga Mat",
    description:
      "Non-slip eco-friendly yoga mat 6mm thick with carrying strap. Perfect for yoga, pilates, and stretching.",
    price: 120000,
    stock: 25,
    imageUrl: "/uploads/placeholder-yoga.jpg",
    category: "Sports",
    createdAt: new Date("2024-01-05").toISOString(),
  },
  {
    id: "6",
    name: "Coffee Maker",
    description:
      "12-cup programmable drip coffee maker with built-in grinder and thermal carafe to keep coffee fresh.",
    price: 550000,
    stock: 8,
    imageUrl: "/uploads/placeholder-coffee.jpg",
    category: "Home & Kitchen",
    createdAt: new Date("2024-01-06").toISOString(),
  },
];

function ensureDB(): void {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const initial: DB = { products: SEED_PRODUCTS, orders: [], users: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), "utf-8");
  }
}

// ── Simple file lock to prevent race conditions ──────────────────────────────

function acquireLock(): void {
  const start = Date.now();
  while (fs.existsSync(LOCK_PATH)) {
    try {
      const stat = fs.statSync(LOCK_PATH);
      if (Date.now() - stat.mtimeMs > LOCK_TIMEOUT) {
        fs.unlinkSync(LOCK_PATH);
        break;
      }
    } catch {
      break;
    }
    if (Date.now() - start > LOCK_TIMEOUT) {
      try {
        fs.unlinkSync(LOCK_PATH);
      } catch {
        /* ignore */
      }
      break;
    }
    const waitUntil = Date.now() + 10;
    while (Date.now() < waitUntil) {
      /* spin */
    }
  }
  fs.writeFileSync(LOCK_PATH, String(process.pid), "utf-8");
}

function releaseLock(): void {
  try {
    fs.unlinkSync(LOCK_PATH);
  } catch {
    /* ignore */
  }
}

function withLock<T>(fn: () => T): T {
  acquireLock();
  try {
    return fn();
  } finally {
    releaseLock();
  }
}

function readDB(): DB {
  ensureDB();
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  const db = JSON.parse(raw) as DB;
  if (!db.users) db.users = [];
  return db;
}

function writeDB(db: DB): void {
  ensureDB();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

// ── Products ─────────────────────────────────────────────────────────────────

export function getProducts(): Product[] {
  return readDB().products;
}

export function getProductById(id: string): Product | undefined {
  return readDB().products.find((p) => p.id === id);
}

export function createProduct(product: Product): Product {
  return withLock(() => {
    const db = readDB();
    db.products.push(product);
    writeDB(db);
    return product;
  });
}

export function updateProduct(
  id: string,
  data: Partial<Product>,
): Product | null {
  return withLock(() => {
    const db = readDB();
    const index = db.products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    db.products[index] = { ...db.products[index], ...data };
    writeDB(db);
    return db.products[index];
  });
}

export function deleteProduct(id: string): boolean {
  return withLock(() => {
    const db = readDB();
    const index = db.products.findIndex((p) => p.id === id);
    if (index === -1) return false;
    db.products.splice(index, 1);
    writeDB(db);
    return true;
  });
}

// ── Orders ───────────────────────────────────────────────────────────────────

export function getOrders(): Order[] {
  return readDB().orders;
}

export function getOrdersByEmail(email: string): Order[] {
  return readDB().orders.filter(
    (o) => o.customerEmail.toLowerCase() === email.toLowerCase(),
  );
}

export function getOrderById(id: string): Order | undefined {
  return readDB().orders.find((o) => o.id === id);
}

export function createOrder(order: Order): Order {
  return withLock(() => {
    const db = readDB();
    db.orders.push(order);
    writeDB(db);
    return order;
  });
}

/**
 * Creates an order AND reduces stock for each item atomically.
 * Recalculates total server-side to prevent client manipulation.
 */
export function createOrderWithStockUpdate(
  order: Order,
): { success: true; order: Order } | { success: false; error: string } {
  return withLock(() => {
    const db = readDB();

    // Validate stock
    for (const item of order.items) {
      const product = db.products.find((p) => p.id === item.product.id);
      if (!product) {
        return {
          success: false,
          error: `Product "${item.product.name}" not found`,
        };
      }
      if (product.stock < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`,
        };
      }
    }

    // Recalculate total from actual DB prices
    let calculatedTotal = 0;
    for (const item of order.items) {
      const product = db.products.find((p) => p.id === item.product.id)!;
      calculatedTotal += product.price * item.quantity;
    }
    order.total = calculatedTotal;

    // Reduce stock
    for (const item of order.items) {
      const product = db.products.find((p) => p.id === item.product.id)!;
      product.stock -= item.quantity;
    }

    db.orders.push(order);
    writeDB(db);
    return { success: true, order };
  });
}

export function updateOrderStatus(
  id: string,
  status: Order["status"],
): Order | null {
  return withLock(() => {
    const db = readDB();
    const index = db.orders.findIndex((o) => o.id === id);
    if (index === -1) return null;
    db.orders[index].status = status;
    writeDB(db);
    return db.orders[index];
  });
}

// ── Users ────────────────────────────────────────────────────────────────────

export function getUsers(): User[] {
  return readDB().users;
}

export function getUserById(id: string): User | undefined {
  return readDB().users.find((u) => u.id === id);
}

export function getUserByEmail(email: string): User | undefined {
  return readDB().users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  );
}

export function createUser(user: User): User {
  return withLock(() => {
    const db = readDB();
    db.users.push(user);
    writeDB(db);
    return user;
  });
}
