import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, CheckCircle, ArrowRight } from 'lucide-react';

const PLANS = [
    {
        name: 'Free',
        price: '₹0',
        period: 'forever',
        tag: 'Get started',
        color: 'border-gray-200',
        btn: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
        features: [
            'Up to 20 products listed',
            '5 km delivery radius',
            'Basic order management',
            'GPS shop location',
            'Email support',
        ],
    },
    {
        name: 'Pro',
        price: '₹299',
        period: '/ month',
        tag: 'Most popular',
        highlight: true,
        color: 'border-blue-500 shadow-blue-100 shadow-lg',
        btn: 'bg-blue-600 text-white hover:bg-blue-700',
        features: [
            'Unlimited products',
            '20 km delivery radius',
            'Priority listing in search',
            'Real-time analytics',
            'WhatsApp order alerts',
            '24/7 chat support',
        ],
    },
    {
        name: 'Business',
        price: '₹799',
        period: '/ month',
        tag: 'For chains',
        color: 'border-indigo-200',
        btn: 'bg-indigo-600 text-white hover:bg-indigo-700',
        features: [
            'Multi-branch support',
            '50 km delivery radius',
            'Custom shop branding',
            'API access',
            'Dedicated account manager',
            'SLA guarantee',
        ],
    },
];

const Pricing = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-10 py-4">
            {/* Header */}
            <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-2 rounded-full text-sm font-semibold">
                    <Zap size={15} /> Simple Pricing
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900">Plans for every seller</h1>
                <p className="text-gray-500">Start free. Upgrade when you grow.</p>
            </div>

            {/* Plans */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {PLANS.map(plan => (
                    <div key={plan.name}
                        className={`relative bg-white rounded-2xl border-2 p-6 flex flex-col gap-5 ${plan.color}`}>
                        {plan.tag && (
                            <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full shadow
                                ${plan.highlight ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                {plan.tag}
                            </span>
                        )}
                        <div>
                            <p className="font-bold text-gray-900 text-lg">{plan.name}</p>
                            <p className="text-3xl font-extrabold text-gray-900 mt-2">
                                {plan.price}
                                <span className="text-sm font-normal text-gray-400 ml-1">{plan.period}</span>
                            </p>
                        </div>
                        <ul className="space-y-2 flex-1">
                            {plan.features.map((f, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                    <CheckCircle size={14} className="text-green-500 shrink-0" /> {f}
                                </li>
                            ))}
                        </ul>
                        <Link to="/register"
                            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition ${plan.btn}`}>
                            Get started <ArrowRight size={14} />
                        </Link>
                    </div>
                ))}
            </div>

            <p className="text-center text-sm text-gray-400">
                All plans include a 14-day free trial. No credit card required.
            </p>
        </div>
    );
};

export default Pricing;
