import React from 'react';
import { Linkedin, Instagram, Mail, MapPin, Code2, Rocket, Users, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import FounderBadge from '../components/FounderBadge';

const SOCIAL = [
    {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/in/akshaymehta7',
        icon: Linkedin,
        color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
        label: 'Instagram',
        href: 'https://instagram.com/akshay.lekh',
        icon: Instagram,
        color: 'bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500',
    },
    {
        label: 'Email',
        href: 'mailto:closekarts@gmail.com',
        icon: Mail,
        color: 'bg-gray-700 hover:bg-gray-800',
    },
];

const FEATURES = [
    { icon: MapPin, title: 'Location-First', desc: 'Connects buyers with shops within walking distance' },
    { icon: Store, title: 'SwapKeeper Portal', desc: 'Full dashboard for local shopkeepers to manage inventory & orders' },
    { icon: Users, title: 'Buyer-Focused', desc: 'Real-time product availability, price comparison, and delivery tracking' },
    { icon: Rocket, title: 'Built for India', desc: 'Designed around local markets, kirana stores, and hyperlocal commerce' },
];

const About = () => {
    return (
        <div className="max-w-3xl mx-auto space-y-10 py-4">

            {/* ── Hero ──────────────────────────────────────────────────────────── */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white text-center shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
                        <Code2 size={14} /> About CloseKart
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Hyperlocal Commerce,<br /> Reimagined</h1>
                    <p className="text-blue-100 text-base max-w-xl mx-auto">
                        CloseKart is a location-based marketplace platform built to connect local shopkeepers
                        and customers within the same neighbourhood — real-time stock, real distances, real deals.
                    </p>
                </div>
            </div>

            {/* ── What is CloseKart ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {FEATURES.map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                            <Icon size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-sm">{title}</p>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Developer Card ────────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Card header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                    <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">Meet the Developer</p>
                </div>

                <div className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-extrabold shadow-md shrink-0 select-none">
                        A
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center sm:text-left">
                        <h2 className="text-xl font-extrabold text-gray-900">Akshay Mehta</h2>
                        <p className="text-blue-600 font-semibold text-sm mt-0.5">Founder &amp; Full Stack Developer</p>
                        <p className="text-gray-500 text-sm mt-3 leading-relaxed">
                            Designed and built CloseKart from the ground up — from the MongoDB geospatial backend to the
                            React buyer and SwapKeeper frontends. Passionate about solving hyperlocal commerce problems for
                            Indian markets.
                        </p>

                        {/* Social buttons */}
                        <div className="flex flex-wrap gap-3 mt-5 justify-center sm:justify-start">
                            {SOCIAL.map(({ label, href, icon: Icon, color }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition shadow-sm ${color}`}
                                >
                                    <Icon size={15} /> {label}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Back to Home ─────────────────────────────────────────────────── */}
            <div className="text-center">
                <Link to="/" className="text-sm text-blue-600 hover:underline font-medium">← Back to Home</Link>
            </div>

            {/* ── Founder Badge ────────────────────────────────────────────────── */}
            <FounderBadge />

        </div>
    );
};

export default About;
