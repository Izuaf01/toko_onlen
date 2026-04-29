import fs from "fs";
import path from "path";
import type { DB, Product, Order, User } from "./types";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

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

function readDB(): DB {
  ensureDB();
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  const db = JSON.parse(raw) as DB;
  // migrate older db files that don't have users
  if (!db.users) db.users = [];
  return db;
}

function writeDB(db: DB): void {
  ensureDB();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

// Products
export function getProducts(): Product[] {
  return readDB().products;
}

export function getProductById(id: string): Product | undefined {
  return readDB().products.find((p) => p.id === id);
}

export function createProduct(product: Product): Product {
  const db = readDB();
  db.products.push(product);
  writeDB(db);
  return product;
}

export function updateProduct(
  id: string,
  data: Partial<Product>,
): Product | null {
  const db = readDB();
  const index = db.products.findIndex((p) => p.id === id);
  if (index === -1) return null;
  db.products[index] = { ...db.products[index], ...data };
  writeDB(db);
  return db.products[index];
}

export function deleteProduct(id: string): boolean {
  const db = readDB();
  const index = db.products.findIndex((p) => p.id === id);
  if (index === -1) return false;
  db.products.splice(index, 1);
  writeDB(db);
  return true;
}

// Orders
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
  const db = readDB();
  db.orders.push(order);
  writeDB(db);
  return order;
}

export function updateOrderStatus(
  id: string,
  status: Order["status"],
): Order | null {
  const db = readDB();
  const index = db.orders.findIndex((o) => o.id === id);
  if (index === -1) return null;
  db.orders[index].status = status;
  writeDB(db);
  return db.orders[index];
}

// Users
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
  const db = readDB();
  db.users.push(user);
  writeDB(db);
  return user;
}
