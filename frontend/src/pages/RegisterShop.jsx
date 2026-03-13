import React from 'react';
import { Link } from 'react-router-dom';
import { Store, MapPin, Camera, Package, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';

const STEPS = [
    { icon: Store, title: 'Create Account', desc: 'Sign up as a SwapKeeper on CloseKart quickly and easily.' },
    { icon: MapPin, title: 'Set Shop Location', desc: 'Pin your exact shop on the map so nearby buyers find you.' },
    { icon: Camera, title: 'Add Products', desc: 'List your inventory with competitive prices and quality photos.' },
    { icon: Package, title: 'Receive Orders', desc: 'Accept incoming orders and deliver to buyers in your radius.' },
];

const RegisterShop = () => {
    return (
        <div className="min-h-screen bg-[#F8FAFC] relative overflow-hidden flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
            {/* Ambient Animated Background */}
            <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-blue-100/60 to-transparent -z-10 pointer-events-none"></div>
            <div className="absolute top-[-5%] right-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[80px] -z-10 animate-float opacity-70"></div>
            <div className="absolute bottom-[20%] left-[-10%] w-[400px] h-[400px] bg-indigo-400/10 rounded-full blur-[80px] -z-10 animate-float opacity-70" style={{ animationDelay: '2s' }}></div>

            <div className="w-full max-w-4xl space-y-12 relative z-10 animate-[fadeIn_0.4s_ease-out]">

                {/* Hero Section */}
                <div className="text-center space-y-5">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200/60 px-5 py-2 rounded-full text-sm font-bold shadow-sm backdrop-blur-sm">
                        <Store size={16} className="text-blue-500" /> Become a Premium SwapKeeper
                        <Sparkles size={14} className="text-indigo-400 ml-1" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
                        Grow your business <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">with CloseKart</span>
                    </h1>
                    <p className="text-gray-500 text-lg sm:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                        Sell directly to customers within walking distance. No delivery fleet needed — buyers come to you, or you optionally deliver locally.
                    </p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

                    {/* Left: Steps Cards */}
                    <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {STEPS.map(({ icon: Icon, title, desc }, i) => (
                            <div key={i} className="glass-card rounded-3xl p-6 flex flex-col h-full bg-white/70 hover:bg-white/90 border border-white hover:border-blue-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1 group">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:bg-blue-600 group-hover:text-white shadow-inner">
                                    <Icon size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-extrabold text-gray-900 text-base mb-2 group-hover:text-blue-700 transition-colors">
                                        <span className="text-blue-500 mr-1">{i + 1}.</span> {title}
                                    </h3>
                                    <p className="text-sm text-gray-500 font-medium leading-relaxed">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right: Benefits & CTA */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Benefits Card */}
                        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black opacity-10 rounded-full blur-xl translate-y-1/2 -translate-x-1/4"></div>

                            <h2 className="font-extrabold text-2xl mb-6 relative z-10 flex items-center gap-2">
                                Why CloseKart?
                            </h2>
                            <div className="space-y-4 relative z-10">
                                {[
                                    'Free to list — no monthly subscription',
                                    'Reach buyers within 1–10 km radius',
                                    'Real-time order dashboard',
                                    'GPS-verified shop trust badge',
                                ].map((b, i) => (
                                    <div key={i} className="flex items-start gap-3 text-sm sm:text-base text-blue-50 font-medium">
                                        <CheckCircle size={20} className="text-green-300 shrink-0 mt-0.5" />
                                        <span>{b}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTAs */}
                        <div className="space-y-4 glass-card p-6 rounded-[2rem] shadow-sm border border-gray-100 bg-white/60">
                            <h3 className="text-center font-bold text-gray-800 mb-2">Ready to start earning?</h3>
                            <Link to="/register"
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl text-base font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all focus:ring-4 focus:ring-blue-500/30">
                                Create SwapKeeper Account <ArrowRight size={18} />
                            </Link>
                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                                <div className="relative flex justify-center"><span className="bg-[#F8FAFC] px-3 text-xs font-bold text-gray-400 uppercase tracking-widest">or</span></div>
                            </div>
                            <Link to="/login"
                                className="w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 py-3.5 rounded-xl text-sm font-bold hover:bg-gray-50 hover:border-gray-300 transition-all focus:ring-4 focus:ring-gray-100">
                                Already have an account? Sign In
                            </Link>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default RegisterShop;
