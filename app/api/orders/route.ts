import { NextResponse } from "next/server";
import { getOrders, getOrdersByEmail, createOrder } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import type { Order, CartItem } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (email) {
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
    address: data.address as string,
    items: data.items as CartItem[],
    total: typeof data.total === "number" ? data.total : 0,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const created = createOrder(order);
  return NextResponse.json(created, { status: 201 });
}
