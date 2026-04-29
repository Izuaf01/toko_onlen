import { NextResponse } from "next/server";
import { getOrderById, updateOrderStatus } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import type { Order } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const order = getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json(order);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const validStatuses: Order["status"][] = [
    "pending",
    "processing",
    "shipped",
    "delivered",
  ];

  if (!data.status || !validStatuses.includes(data.status as Order["status"])) {
    return NextResponse.json(
      {
        error:
          "Invalid status. Must be one of: pending, processing, shipped, delivered",
      },
      { status: 400 },
    );
  }

  const updated = updateOrderStatus(id, data.status as Order["status"]);
  return NextResponse.json(updated);
}
