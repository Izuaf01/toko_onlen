"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import type { CartItem } from "@/lib/types";
import { TrashIcon, PlusIcon, MinusIcon } from "@/components/icons";

type Props = {
  item: CartItem;
};

export default function CartItemRow({ item }: Props) {
  const { updateQuantity, removeItem } = useCart();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors">
      <div className="relative w-18 h-18 w-[72px] h-[72px] rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
        <Image
          src={item.product.imageUrl || "/placeholder.jpg"}
          alt={item.product.name}
          fill
          className="object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.jpg";
          }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${item.product.id}`}
          className="text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1"
        >
          {item.product.name}
        </Link>
        <p className="text-xs text-gray-400 mt-0.5">{item.product.category}</p>
        <p className="text-sm font-bold text-gray-900 mt-1">
          {formatPrice(item.product.price * item.quantity)}
        </p>
      </div>

      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden flex-shrink-0">
        <button
          onClick={() =>
            updateQuantity(item.product.id, Math.max(1, item.quantity - 1))
          }
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
          aria-label="Decrease quantity"
        >
          <MinusIcon className="w-3 h-3" />
        </button>
        <span className="px-2.5 text-sm font-bold text-gray-900 min-w-[2rem] text-center">
          {item.quantity}
        </span>
        <button
          onClick={() =>
            updateQuantity(
              item.product.id,
              Math.min(item.product.stock, item.quantity + 1),
            )
          }
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
          aria-label="Increase quantity"
        >
          <PlusIcon className="w-3 h-3" />
        </button>
      </div>

      <button
        onClick={() => removeItem(item.product.id)}
        className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
        aria-label="Remove item"
      >
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
