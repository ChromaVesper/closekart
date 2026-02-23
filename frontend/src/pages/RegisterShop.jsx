import React from 'react';
import { Link } from 'react-router-dom';
import { Store, MapPin, Camera, Package, ArrowRight, CheckCircle } from 'lucide-react';

const STEPS = [
    { icon: Store, title: 'Create Account', desc: 'Sign up as a SwapKeeper on CloseKart' },
    { icon: MapPin, title: 'Set Shop Location', desc: 'Pin your exact shop on the map so buyers find you' },
    { icon: Camera, title: 'Add Products', desc: 'List your inventory with prices and photos' },
    { icon: Package, title: 'Receive Orders', desc: 'Accept orders and deliver to nearby buyers' },
];

const RegisterShop = () => {
    return (
        <div className="max-w-2xl mx-auto space-y-10 py-4">
            {/* Hero */}
            <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 rounded-full text-sm font-semibold">
                    <Store size={15} /> Become a SwapKeeper
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900">Register Your Shop</h1>
                <p className="text-gray-500 text-base max-w-md mx-auto">
                    Sell to customers within walking distance. No delivery fleet needed — buyers come to you or you deliver locally.
                </p>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {STEPS.map(({ icon: Icon, title, desc }, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                            <Icon size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-sm">{i + 1}. {title}</p>
                            <p className="text-xs text-gray-500 mt-1">{desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Benefits */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white space-y-4">
                <h2 className="font-bold text-lg">Why CloseKart?</h2>
                {[
                    'Free to list — no monthly subscription',
                    'Reach buyers within 1–10 km radius',
                    'Real-time order management dashboard',
                    'GPS-verified shop location for trust',
                ].map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-blue-100">
                        <CheckCircle size={15} className="text-green-300 shrink-0" /> {b}
                    </div>
                ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/register"
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 rounded-2xl text-sm font-bold hover:bg-blue-700 transition shadow-sm">
                    Create SwapKeeper Account <ArrowRight size={16} />
                </Link>
                <Link to="/login"
                    className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 py-3.5 rounded-2xl text-sm font-semibold hover:bg-gray-50 transition">
                    Already have an account? Sign In
                </Link>
            </div>
        </div>
    );
};

export default RegisterShop;
