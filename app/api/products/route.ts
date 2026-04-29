import { NextResponse } from "next/server";
import { getProducts, createProduct } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import type { Product } from "@/lib/types";

export async function GET() {
  const products = getProducts();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body as Record<string, unknown>;

  if (
    !data.name ||
    typeof data.name !== "string" ||
    !data.price ||
    typeof data.price !== "number" ||
    !data.stock ||
    typeof data.stock !== "number" ||
    !data.category ||
    typeof data.category !== "string"
  ) {
    return NextResponse.json(
      { error: "Missing required fields: name, price, stock, category" },
      { status: 400 },
    );
  }

  const product: Product = {
    id: crypto.randomUUID(),
    name: data.name as string,
    description: typeof data.description === "string" ? data.description : "",
    price: data.price as number,
    stock: data.stock as number,
    imageUrl: typeof data.imageUrl === "string" ? data.imageUrl : "",
    category: data.category as string,
    createdAt: new Date().toISOString(),
  };

  const created = createProduct(product);
  return NextResponse.json(created, { status: 201 });
}
