import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { api, SubscriptionPricingResponse } from '@/services/api';

// Feature item component
function FeatureItem({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        className={`shrink-0 mt-0.5 ${light ? 'text-white' : 'text-[#0d1a67]'}`}
      >
        <path
          d="M5 13l4 4L19 7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className={`text-sm ${light ? 'text-white/90' : 'text-gray-600'}`}>{children}</span>
    </div>
  );
}

// FAQ Item component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-2">{question}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{answer}</p>
    </div>
  );
}

// Format currency with symbol
function formatPrice(price: number, currency: string): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  });
  return formatter.format(price);
}

export function PricingPage() {
  const [pricing, setPricing] = useState<SubscriptionPricingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getSubscriptionPricing();
        setPricing(response.data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unable to load pricing for your region';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, []);

  // Get plan prices from API response
  const plans = pricing?.plans || [];
  const weeklyPlan = plans.find(p => p.interval === 'week');
  const monthlyPlan = plans.find(p => p.interval === 'month');

  const weeklyPrice = weeklyPlan ? formatPrice(weeklyPlan.price, weeklyPlan.currency) : '$3.99';
  const monthlyPrice = monthlyPlan ? formatPrice(monthlyPlan.price, monthlyPlan.currency) : '$9.99';

  const faqs = [
    {
      question: "Can I cancel anytime?",
      answer: "Yes, you can cancel your subscription anytime through your account settings. There are no extra fees or penalties for cancellation."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes, you can cancel your subscription anytime through your account settings. There are no extra fees or penalties for cancellation."
    },
    {
      question: "Is there a refund policy?",
      answer: "Yes, refunds are available within 3 days of purchase for eligible plans. Please contact support with your order details to process a refund."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept major credit/debit cards, PayPal, and Apple/Google Pay (where available). All transactions are secured and encrypted."
    },
    {
      question: "How often is data updated?",
      answer: "Match and player data are updated in real-time or shortly after games finish, ensuring you always see the latest stats."
    },
    {
      question: "Can I share my account?",
      answer: "Accounts are intended for individual use only. For teams or organizations, please see our Team or Enterprise Plans."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="pricing" />

      <main className="pb-16">
        {/* Hero Section */}
        <div className="text-center pt-12 pb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Choose Your Plan
          </h1>
          <p className="text-gray-500">
            Unlock expert predictions and stats tailored for you.
          </p>
        </div>

        {/* Error State for Unsupported Country */}
        {error && (
          <div className="max-w-[600px] mx-auto px-4 md:px-6 mb-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Service Not Available</h3>
              <p className="text-red-600 text-sm">
                {error}
              </p>
              <p className="text-gray-500 text-sm mt-3">
                We're working to expand our service to more regions. Please check back later.
              </p>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="max-w-[1000px] mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-6 mb-12 items-stretch">
            {/* Weekly Pass Card */}
            <div className={`bg-white rounded-2xl border border-gray-200 p-8 flex flex-col ${loading ? 'animate-pulse' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-[#0d1a67]">Weekly Pass</h2>
                <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#0d1a67]">
                    <path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              <p className="text-gray-500 text-sm mb-6">
                Perfect for trying out our predictions or focusing on a big game week.
              </p>

              <div className="mb-6 pb-6 border-b border-gray-100">
                {loading ? (
                  <div className="h-10 bg-gray-200 rounded w-32" />
                ) : (
                  <>
                    <span className="text-4xl font-bold text-gray-900">{weeklyPrice}</span>
                    <span className="text-gray-500">/ week</span>
                  </>
                )}
              </div>

              <div className="space-y-4 flex-1">
                <FeatureItem>7 days full access to all predictions</FeatureItem>
                <FeatureItem>Coverage across all leagues</FeatureItem>
                <FeatureItem>All game predictions and analysis</FeatureItem>
                <FeatureItem>Expert insights and stats</FeatureItem>
              </div>

              <button
                className="w-full py-3 px-6 rounded-lg border-2 border-[#0d1a67] text-[#0d1a67] font-semibold hover:bg-[#0d1a67] hover:text-white transition-colors mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !!error}
              >
                Get Weekly Pass
              </button>
            </div>

            {/* Monthly Pro Card */}
            <div className={`bg-[#0d1a67] rounded-2xl p-8 text-white flex flex-col ${loading ? 'animate-pulse' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">Monthly Pro</h2>
                  <span className="px-2 py-1 bg-white/20 rounded text-xs font-medium">
                    MOST POPULAR
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
              </div>

              <p className="text-white/70 text-sm mb-6">
                The complete package for serious sports bettors who want an edge all month long.
              </p>

              <div className="mb-6 pb-6 border-b border-white/20">
                {loading ? (
                  <div className="h-10 bg-white/20 rounded w-32" />
                ) : (
                  <>
                    <span className="text-4xl font-bold">{monthlyPrice}</span>
                    <span className="text-white/70">/ month</span>
                  </>
                )}
              </div>

              <div className="space-y-4 flex-1">
                <FeatureItem light>30 days full access to all predictions</FeatureItem>
                <FeatureItem light>Coverage across all leagues</FeatureItem>
                <FeatureItem light>All game predictions and analysis</FeatureItem>
                <FeatureItem light>Push notifications for new predictions</FeatureItem>
                <FeatureItem light>Early access to game analysis</FeatureItem>
              </div>

              <button
                className="w-full py-3 px-6 rounded-lg bg-white text-[#0d1a67] font-semibold hover:bg-gray-100 transition-colors mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !!error}
              >
                Get Monthly Pro
              </button>
            </div>
          </div>

          {/* Secure Payment Options */}
          <div className="bg-gray-100 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Secure Payment Options</h3>
              <p className="text-gray-500 text-sm">All payments are encrypted and secure.</p>
            </div>
            <div className="flex items-center gap-8">
              {/* Stripe */}
              <img src="/Group 1686559742.svg" alt="Stripe" className="h-8" />
              {/* PayPal */}
              <img src="/PayPal 1.svg" alt="PayPal" className="h-8" />
              {/* Razorpay */}
              <img src="/Razorpay_logo 1.svg" alt="Razorpay" className="h-6" />
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-[1000px] mx-auto px-4 md:px-6 mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500">
              Unlock expert predictions and stats tailored for you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>

        {/* Still Have Questions */}
        <div className="max-w-[1000px] mx-auto px-4 md:px-6">
          <div className="bg-[#0d1a67] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Still Have Questions?</h3>
              <p className="text-white/60 text-sm">
                We understand. Let's connect directly with our team to continue the conversation.
              </p>
            </div>
            <button className="px-6 py-2.5 bg-white text-[#0d1a67] font-semibold rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap">
              Contact Us
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
