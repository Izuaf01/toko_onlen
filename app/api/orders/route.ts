import { NextResponse } from "next/server";
import {
  getOrders,
  getOrdersByEmail,
  createOrderWithStockUpdate,
  getUserById,
} from "@/lib/db";
import { isAdminAuthenticated, getLoggedInUserId } from "@/lib/auth";
import type { Order, CartItem } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (email) {
    // Require user to be logged in and match the email, OR be admin
    const userId = await getLoggedInUserId();
    const isAdmin = await isAdminAuthenticated();

    if (!isAdmin) {
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const user = getUserById(userId);
      if (!user || user.email.toLowerCase() !== email.toLowerCase()) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const orders = getOrdersByEmail(email);
    return NextResponse.json(orders);
  }

  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = getOrders();
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body as Record<string, unknown>;

  if (
    !data.customerName ||
    typeof data.customerName !== "string" ||
    !data.customerEmail ||
    typeof data.customerEmail !== "string" ||
    !data.address ||
    typeof data.address !== "string" ||
    !Array.isArray(data.items) ||
    data.items.length === 0
  ) {
    return NextResponse.json(
      {
        error:
          "Missing required fields: customerName, customerEmail, address, items",
      },
      { status: 400 },
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.customerEmail as string)) {
    return NextResponse.json(
      { error: "Invalid email format" },
      { status: 400 },
    );
  }

  const order: Order = {
    id: crypto.randomUUID(),
    customerName: data.customerName as string,
    customerEmail: data.customerEmail as string,
    phone: typeof data.phone === "string" ? data.phone : "",
    address: data.address as string,
    items: data.items as CartItem[],
    total: 0, // Will be recalculated server-side
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const result = createOrderWithStockUpdate(order);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result.order, { status: 201 });
}
