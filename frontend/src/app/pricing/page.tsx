"use client";
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const PRICE_STARTER = process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || '';
const PRICE_PRO = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || '';
const PRICE_ENTERPRISE = process.env.NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE || '';

const plans = [
  {
    name: 'Starter',
    price: '$9',
    period: 'mo',
    features: ['50 questions / mo', 'Up to 3 documents', 'Email support'],
    priceId: PRICE_STARTER,
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'mo',
    features: ['Unlimited questions', '20 documents', 'Priority support'],
    priceId: PRICE_PRO,
  },
  {
    name: 'Enterprise',
    price: '$59',
    period: 'mo',
    features: ['Unlimited everything', 'Dedicated account manager', 'Custom integrations'],
    priceId: PRICE_ENTERPRISE,
  },
];

export default function PricingPage() {
  const { token } = useContext(AuthContext) || {} as any;

  const handleCheckout = async (priceId: string) => {
    if (!token) {
      toast.error('Please log in first');
      return;
    }
    try {
      const res = await api.post('/stripe/create-checkout-session/', { price_id: priceId });
      window.location.href = res.data.url;
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Checkout failed');
    }
  };

  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8">
        <ArrowLeftIcon className="h-5 w-5 mr-1" /> Back to Home
      </Link>
      <h1 className="text-4xl font-bold mb-12 text-center">Choose your plan</h1>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div key={plan.name} className="rounded-3xl bg-neutral-900 border border-white/10 p-8 flex flex-col">
            <h2 className="text-2xl font-bold mb-4">{plan.name}</h2>
            <p className="text-4xl font-bold mb-2">
              {plan.price}
              <span className="text-base font-normal text-gray-400">/{plan.period}</span>
            </p>
            <ul className="flex-1 space-y-2 mb-6 text-gray-300 text-sm list-disc list-inside">
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            {plan.price === 'Contact' ? (
              <Link href="/contact" className="text-center bg-blue-600 hover:bg-blue-700 rounded-lg py-2 font-semibold">Contact Us</Link>
            ) : (
              <button
                onClick={() => handleCheckout(plan.priceId)}
                disabled={!plan.priceId}
                className="bg-blue-600 hover:bg-blue-700 rounded-lg py-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {plan.priceId ? 'Get Started' : 'Configure ID'}
              </button>
            )}
          </div>
        ))}
      </div>
    </main>
  );
} 