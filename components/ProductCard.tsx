"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/lib/types";

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const { addItem } = useCart();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 border border-gray-100 hover:border-indigo-100 flex flex-col overflow-hidden hover:-translate-y-0.5">
      <Link
        href={`/products/${product.id}`}
        className="block relative h-52 bg-gray-50 overflow-hidden"
      >
        <Image
          src={product.imageUrl || "/placeholder.jpg"}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.jpg";
          }}
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
            <span className="bg-gray-900/90 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="inline-block bg-white/90 backdrop-blur-sm text-indigo-600 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
            {product.category}
          </span>
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <Link
          href={`/products/${product.id}`}
          className="hover:text-indigo-600 transition-colors"
        >
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1.5 leading-snug">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-400 text-xs line-clamp-2 mb-3 flex-1 leading-relaxed">
          {product.description}
        </p>
        <div className="flex items-end justify-between gap-2 mt-auto">
          <div>
            <span className="text-base font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.stock > 0 && product.stock <= 5 && (
              <p className="text-[10px] text-amber-600 font-medium mt-0.5">
                Only {product.stock} left
              </p>
            )}
          </div>
          <button
            onClick={() => addItem(product)}
            disabled={product.stock === 0}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:from-indigo-500 hover:to-violet-500 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md hover:shadow-indigo-200 active:scale-95 whitespace-nowrap"
          >
            {product.stock === 0 ? "Sold Out" : "+ Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
