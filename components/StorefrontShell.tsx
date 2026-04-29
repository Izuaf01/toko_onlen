"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function StorefrontShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="bg-gray-950 text-gray-500 border-t border-white/5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                T
              </div>
              <span className="text-sm font-semibold text-white">
                TokoOnline
              </span>
            </div>
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} TokoOnline. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
