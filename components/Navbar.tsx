"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";
import { ShoppingCartIcon } from "./icons";

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, loading, logout } = useUser();

  return (
    <nav className="bg-gray-950/95 backdrop-blur-xl text-white sticky top-0 z-50 border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/products" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
              T
            </div>
            <span className="font-bold text-base tracking-tight">
              Toko<span className="text-violet-400">Online</span>
            </span>
          </Link>

          {/* Center Nav Links */}
          <div className="hidden sm:flex items-center gap-1">
            <Link
              href="/products"
              className="text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all font-medium px-3 py-2 rounded-lg"
            >
              Products
            </Link>
            <Link
              href="/orders"
              className="text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all font-medium px-3 py-2 rounded-lg"
            >
              My Orders
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {!loading &&
              (user ? (
                <div className="flex items-center gap-2.5">
                  <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-200 font-medium leading-none">
                      {user.name.split(" ")[0]}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="text-xs text-gray-400 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all hover:bg-white/5"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="text-sm text-gray-400 hover:text-white transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-white/5"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold px-3.5 py-1.5 rounded-lg transition-all shadow-sm shadow-indigo-500/25 hover:shadow-indigo-500/40"
                  >
                    Register
                  </Link>
                </div>
              ))}

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
            >
              <ShoppingCartIcon className="w-[18px] h-[18px] text-gray-300" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] font-bold rounded-full min-w-[17px] h-[17px] flex items-center justify-center px-1 shadow-sm shadow-orange-500/30">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
