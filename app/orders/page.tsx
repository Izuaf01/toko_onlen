"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Order } from "@/lib/types";
import { ChevronDownIcon, ChevronUpIcon } from "@/components/icons";
import { useUser } from "@/context/UserContext";
import { formatPrice } from "@/lib/utils";

const STATUS_COLORS: Record<Order["status"], string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-100",
  processing: "bg-blue-50 text-blue-700 border border-blue-100",
  shipped: "bg-purple-50 text-purple-700 border border-purple-100",
  delivered: "bg-green-50 text-green-700 border border-green-100",
};

function OrderRow({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer hover:bg-gray-50/50 transition-colors gap-3"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 font-mono">
            #{order.id.slice(0, 8)}...
          </p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">
            {order.customerName}
          </p>
          <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-indigo-600">
            {formatPrice(order.total)}
          </span>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
              STATUS_COLORS[order.status]
            }`}
          >
            {order.status}
          </span>
          {expanded ? (
            <ChevronUpIcon className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 space-y-2">
          <p className="text-xs text-gray-500 mb-2">
            <span className="font-medium">Ship to:</span> {order.address}
          </p>
          {order.items.map((item) => (
            <div
              key={item.product.id}
              className="flex justify-between text-sm text-gray-700"
            >
              <span>
                {item.product.name}{" "}
                <span className="text-gray-400">×{item.quantity}</span>
              </span>
              <span className="font-medium">
                {formatPrice(item.product.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const { user, loading: userLoading } = useUser();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-load orders when user is logged in
  useEffect(() => {
    if (user?.email) {
      setLoading(true);
      fetch(`/api/orders?email=${encodeURIComponent(user.email)}`)
        .then((r) => {
          if (!r.ok) throw new Error("Failed to fetch");
          return r.json();
        })
        .then((data: Order[]) => setOrders(Array.isArray(data) ? data : []))
        .catch(() => setError("Failed to fetch orders."))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (userLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-200 rounded w-64" />
          <div className="h-20 bg-gray-200 rounded-2xl" />
          <div className="h-20 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Track and view your past orders
        </p>
      </div>

      {!user && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 flex items-center justify-center">
            <svg
              className="w-7 h-7 text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Sign in to view your orders
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Log in to your account to track your order history and status.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login?redirect=/orders"
              className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-500 hover:to-violet-500 transition-all shadow-md shadow-indigo-200 active:scale-[0.98]"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98]"
            >
              Create Account
            </Link>
          </div>
        </div>
      )}

      {user && loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-20 bg-gray-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      )}

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {user &&
        !loading &&
        orders !== null &&
        (orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-base font-semibold text-gray-700">
              No orders found
            </p>
            <p className="text-sm text-gray-400 mt-1">
              You haven&apos;t placed any orders yet.
            </p>
            <Link
              href="/products"
              className="inline-block mt-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-500 hover:to-violet-500 transition-all shadow-md shadow-indigo-200 active:scale-[0.98]"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        ))}
    </div>
  );
}
