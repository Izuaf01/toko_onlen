import Link from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-200">
        <svg
          className="w-10 h-10 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        Order Placed Successfully!
      </h1>
      <p className="text-gray-500 text-sm leading-relaxed mb-10 max-w-md mx-auto">
        Thank you for your purchase. We&apos;ve received your order and will
        process it shortly. You&apos;ll receive a confirmation via email.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/orders"
          className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-7 py-3 rounded-xl font-semibold hover:from-indigo-500 hover:to-violet-500 transition-all shadow-md shadow-indigo-200 active:scale-[0.98]"
        >
          Track My Orders
        </Link>
        <Link
          href="/products"
          className="border border-gray-200 text-gray-700 px-7 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98]"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
