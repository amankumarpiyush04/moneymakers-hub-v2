import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ArrowLeft, Loader2, ShieldCheck, Mail, User } from 'lucide-react';
import useCartStore from '../context/useCartStore';
import useAuthStore from '../context/useAuthStore';
import { paymentsAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total, count, clearCart } = useCartStore();
  const { user, session } = useAuthStore();
  const [processing, setProcessing] = useState(false);

  // Form billing details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Prefill details from auth store
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    } else if (session?.user) {
      setName(session.user.user_metadata?.name || '');
      setEmail(session.user.email || '');
    }
  }, [user, session]);

  // Load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (count === 0) {
      toast.error('Your cart is empty');
      return;
    }
    if (!name.trim() || !email.trim()) {
      toast.error('Please enter your name and email');
      return;
    }

    setProcessing(true);

    try {
      // 1. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway. Check your internet connection.');
        setProcessing(false);
        return;
      }

      // 2. Create order in MongoDB & Razorpay backend
      const productIds = items.map(i => i._id);
      const { data } = await paymentsAPI.createOrder(productIds);
      
      const { order, razorpay } = data;
      const orderId = order.id;

      // 3. Configure Razorpay modal options
      const options = {
        key: razorpay.key,
        amount: razorpay.amount,
        currency: razorpay.currency,
        name: 'MoneyMakers Hub',
        description: `Purchase of ${count()} ebook(s)`,
        image: 'https://binzudcahumiludvvdku.supabase.co/storage/v1/object/public/covers/logo.png', // Fallback or logo
        order_id: razorpay.orderId,
        prefill: {
          name: name,
          email: email,
        },
        theme: {
          color: '#d97706', // Amber 600 theme color
        },
        handler: async function (response) {
          try {
            setProcessing(true);
            
            // 4. Verify payment signature on backend
            const verificationPayload = {
              orderId: orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            };
            
            const verificationResult = await paymentsAPI.verifyPayment(verificationPayload);
            
            if (verificationResult.data.success) {
              toast.success('Payment successful! Your order has been placed.');
              clearCart();
              navigate(`/order-success/${orderId}`, { replace: true });
            } else {
              toast.error(verificationResult.data.message || 'Payment verification failed');
            }
          } catch (err) {
            console.error('Verification error:', err);
            toast.error(err.response?.data?.message || 'Error verifying payment');
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            toast.error('Payment cancelled');
            setProcessing(false);
          },
        },
      };

      // 5. Open Razorpay payment portal overlay
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error('Checkout error:', err);
      toast.error(err.response?.data?.message || 'Error initiating checkout');
      setProcessing(false);
    }
  };

  if (count() === 0) {
    return (
      <div className="bg-gray-950 text-white min-h-screen py-20 flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold font-sora mb-3">Checkout is empty</h2>
        <button onClick={() => navigate('/browse')} className="text-amber-450 hover:text-amber-350 transition-colors">
          Go back to Browse
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-950 text-white min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft size={16} className="transform group-hover:-translate-x-0.5 transition-transform" /> Back to Cart
        </button>

        <h1 className="text-3xl font-bold font-sora mb-10">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Billing Form Column */}
          <div className="md:col-span-7 bg-gray-900 border border-gray-850 p-6 sm:p-8 rounded-2xl">
            <h2 className="text-lg font-bold font-sora mb-6 flex items-center gap-2">
              <CreditCard className="text-amber-500" /> Billing Information
            </h2>

            <form onSubmit={handlePayment} className="space-y-5">
              <div>
                <label className="block text-sm text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <User size={14} className="text-gray-500" /> Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Mail size={14} className="text-gray-500" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <p className="text-xxs text-gray-500 mt-1.5">
                  Your ebook files and order receipts will be synced directly to this account.
                </p>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full bg-amber-600 hover:bg-amber-550 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> Processing Checkout...
                  </>
                ) : (
                  <>
                    Pay Now <ShieldCheck size={18} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Checkout Items Summary Column */}
          <div className="md:col-span-5 bg-gray-900/50 border border-gray-850 p-6 rounded-2xl">
            <h2 className="text-base font-bold font-sora mb-6">Review Items ({count()})</h2>

            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2 border-b border-gray-800 pb-5 mb-5">
              {items.map((item) => (
                <div key={item._id} className="flex justify-between items-center gap-3">
                  <div className="min-w-0">
                    <span className="font-semibold text-sm text-gray-250 truncate block leading-snug">{item.title}</span>
                    <span className="text-[10px] text-gray-500 block">By {item.author}</span>
                  </div>
                  <span className="font-bold text-sm text-white shrink-0">₹{item.price}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 pb-5 border-b border-gray-800 mb-5 text-sm text-gray-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white font-medium">₹{total()}</span>
              </div>
              <div className="flex justify-between">
                <span>GST & Fees</span>
                <span className="text-amber-450 uppercase text-xs">Included</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-white">
              <span className="font-bold text-sm">Total Due</span>
              <span className="font-bold text-xl font-sora">₹{total()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
