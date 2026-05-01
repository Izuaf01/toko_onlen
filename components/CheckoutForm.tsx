"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";
import { formatPrice } from "@/lib/utils";

type FormData = {
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
};

const INITIAL_FORM: FormData = {
  customerName: "",
  customerEmail: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
};

export default function CheckoutForm() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useUser();
  const router = useRouter();
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitting, setSubmitting] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.replace("/cart");
    }
  }, [items.length, router]);

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!form.customerName.trim()) newErrors.customerName = "Name is required";
    if (!form.customerEmail.trim()) {
      newErrors.customerEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) {
      newErrors.customerEmail = "Invalid email format";
    }
    if (!form.phone.trim()) newErrors.phone = "Phone is required";
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.postalCode.trim())
      newErrors.postalCode = "Postal code is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      const fullAddress = `${form.address}, ${form.city}, ${form.postalCode}`;
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: user?.name ?? form.customerName,
          customerEmail: user?.email ?? form.customerEmail,
          phone: form.phone,
          address: fullAddress,
          items,
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        alert(err.error ?? "Failed to place order");
        setSubmitting(false);
        return;
      }
      clearCart();
      router.push("/checkout/success");
    } catch {
      alert("An error occurred. Please try again.");
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const inputClass = (field: keyof FormData) =>
    `w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all ${
      errors[field]
        ? "border-red-400 bg-red-50"
        : "border-gray-200 bg-gray-50/50 hover:bg-white"
    }`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
        {/* Account info */}
        {user ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-900">Account</h2>
              <span className="text-[10px] font-bold bg-green-50 text-green-600 border border-green-100 px-2.5 py-1 rounded-full">
                Signed in
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-4 flex items-center justify-between gap-4">
            <p className="text-sm text-amber-800">
              <Link href="/login" className="font-semibold hover:underline">
                Sign in
              </Link>{" "}
              for a faster checkout experience.
            </p>
            <Link
              href="/login?redirect=/checkout"
              className="text-xs bg-amber-500 text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-400 transition-colors whitespace-nowrap shadow-sm"
            >
              Sign In
            </Link>
          </div>
        )}

        {/* Shipping Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">
            Shipping Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Full Name <span className="text-red-400">*</span>
              </label>
              {user ? (
                <div className="w-full border border-gray-100 bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm text-gray-600">
                  {user.name}
                </div>
              ) : (
                <>
                  <input
                    name="customerName"
                    value={form.customerName}
                    onChange={handleChange}
                    className={inputClass("customerName")}
                    placeholder="John Doe"
                    autoComplete="name"
                  />
                  {errors.customerName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.customerName}
                    </p>
                  )}
                </>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Email <span className="text-red-400">*</span>
              </label>
              {user ? (
                <div className="w-full border border-gray-100 bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm text-gray-600">
                  {user.email}
                </div>
              ) : (
                <>
                  <input
                    name="customerEmail"
                    type="email"
                    value={form.customerEmail}
                    onChange={handleChange}
                    className={inputClass("customerEmail")}
                    placeholder="john@example.com"
                    autoComplete="email"
                  />
                  {errors.customerEmail && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.customerEmail}
                    </p>
                  )}
                </>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Phone <span className="text-red-400">*</span>
              </label>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                className={inputClass("phone")}
                placeholder="+62 812 3456 7890"
                autoComplete="tel"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                City <span className="text-red-400">*</span>
              </label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                className={inputClass("city")}
                placeholder="Jakarta"
                autoComplete="address-level2"
              />
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">{errors.city}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Street Address <span className="text-red-400">*</span>
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={3}
                className={inputClass("address")}
                placeholder="Jl. Sudirman No. 123"
                autoComplete="street-address"
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                Postal Code <span className="text-red-400">*</span>
              </label>
              <input
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
                className={inputClass("postalCode")}
                placeholder="12190"
                autoComplete="postal-code"
              />
              {errors.postalCode && (
                <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || items.length === 0}
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3.5 rounded-xl font-semibold hover:from-indigo-500 hover:to-violet-500 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-200 active:scale-[0.98]"
        >
          {submitting ? "Placing Order..." : "Place Order"}
        </button>
      </form>

      {/* Order Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit sticky top-24">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
          Order Summary
        </h2>
        <div className="space-y-2.5 mb-4 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="flex justify-between text-sm text-gray-500"
            >
              <span className="flex-1 line-clamp-1 pr-2">
                {item.product.name}{" "}
                <span className="text-gray-400 text-xs">×{item.quantity}</span>
              </span>
              <span className="font-semibold text-gray-700 whitespace-nowrap">
                {formatPrice(item.product.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-4">
          <div className="flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent text-lg">
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
