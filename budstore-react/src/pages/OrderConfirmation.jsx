import { Link, useLocation } from "react-router-dom";

export default function OrderConfirmation() {
  const location = useLocation();
  const order = location.state?.order;

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-16">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-brand-green/20 flex items-center justify-center">
          <svg className="w-10 h-10 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-display text-3xl font-bold text-white mb-3">
          Order Confirmed
        </h1>
        {order?.orderId && (
          <p className="text-brand-gold text-lg font-medium mb-2">
            Order #{order.orderId}
          </p>
        )}
        <p className="text-zinc-400 mb-8 leading-relaxed">
          Thank you for your order! We'll prepare your items for pickup.
          {order?.paymentMethod && (
            <>
              <br />
              Payment: {order.paymentMethod}
            </>
          )}
        </p>
        <Link
          to="/"
          className="inline-block bg-brand-green text-black px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-green-400 transition-colors"
        >
          Back to Dispensaries
        </Link>
      </div>
    </div>
  );
}
