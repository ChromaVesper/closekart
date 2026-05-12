import React from "react";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { Package, Heart, User, HelpCircle, LogOut, ChevronRight, Settings, Grid } from "lucide-react";

export default function Account() {
    const { user, profile } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/");
        } catch (error) {
            console.error("Logout error:", error.message);
        }
    };

    if (!user) return null;

    const displayAvatar = profile?.avatar || user.photoURL || null;
    const displayName = profile?.name || user.displayName || "CloseKart User";
    const displayEmail = user.email || profile?.phone || user.phoneNumber || "No contact info available";

    return (
        <div className="min-h-screen bg-[#F8FAFC] relative overflow-x-hidden pb-12">
            {/* Soft Background Orbs for Premium Feel */}
            <div className="absolute top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-blue-100/60 to-transparent -z-10 pointer-events-none"></div>
            <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-400/15 rounded-full blur-3xl -z-10 animate-float"></div>
            <div className="absolute top-[20%] left-[-10%] w-72 h-72 bg-indigo-400/15 rounded-full blur-3xl -z-10 animate-float" style={{ animationDelay: '2s' }}></div>

            <div className="pt-8 pb-10 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-3xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Account</h1>
                        <button onClick={() => navigate('/edit-profile')} className="p-2.5 bg-white/80 backdrop-blur-md rounded-full text-gray-500 hover:text-blue-600 hover:bg-white transition-all shadow-sm border border-gray-100">
                            <Settings size={22} />
                        </button>
                    </div>

                    {/* Profile Section (Glassmorphism) */}
                    <div className="glass-effect rounded-[2rem] p-8 flex flex-col md:flex-row items-center md:space-x-8 space-y-6 md:space-y-0 relative overflow-hidden group">

                        {/* Avatar */}
                        <div className="relative group-hover:scale-105 transition-transform duration-500">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
                            <div className="h-28 w-28 bg-white rounded-full flex items-center justify-center text-blue-600 border-4 border-white shadow-xl shrink-0 overflow-hidden relative z-10">
                                {displayAvatar ? (
                                    <img src={displayAvatar} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <User size={44} className="text-blue-400" />
                                )}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="text-center md:text-left min-w-0 flex-1">
                            <h2 className="text-2xl font-black text-gray-900 truncate tracking-tight">
                                {displayName}
                            </h2>
                            <p className="text-base text-gray-500 truncate mt-1.5 font-medium">
                                {displayEmail}
                            </p>
                            <div className="mt-4 inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50/80 backdrop-blur-sm text-blue-700 text-xs font-bold tracking-wide uppercase border border-blue-100/50 shadow-sm">
                                Verified Member
                            </div>
                        </div>
                    </div>

                    {/* Menu Section Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link
                            to="/orders"
                            className="glass-card rounded-[1.5rem] p-6 flex flex-col justify-between group h-[150px]"
                        >
                            <div className="flex items-start justify-between">
                                <div className="bg-blue-50/80 backdrop-blur-sm p-4 rounded-[1.25rem] text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                    <Package size={26} strokeWidth={2.5} />
                                </div>
                                <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:translate-x-1 transition-all">
                                    <ChevronRight className="text-gray-400 group-hover:text-blue-500" size={18} strokeWidth={3} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-extrabold text-gray-900 group-hover:text-blue-700 transition-colors tracking-tight">My Orders</h3>
                                <p className="text-sm text-gray-500 mt-1 font-medium">Track & manage orders</p>
                            </div>
                        </Link>

                        <Link
                            to="/wishlist"
                            className="glass-card rounded-[1.5rem] p-6 flex flex-col justify-between group h-[150px]"
                        >
                            <div className="flex items-start justify-between">
                                <div className="bg-rose-50/80 backdrop-blur-sm p-4 rounded-[1.25rem] text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300 shadow-sm">
                                    <Heart size={26} strokeWidth={2.5} />
                                </div>
                                <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-rose-50 group-hover:translate-x-1 transition-all">
                                    <ChevronRight className="text-gray-400 group-hover:text-rose-500" size={18} strokeWidth={3} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-extrabold text-gray-900 group-hover:text-rose-600 transition-colors tracking-tight">Wishlist</h3>
                                <p className="text-sm text-gray-500 mt-1 font-medium">Your saved items</p>
                            </div>
                        </Link>

                        <Link
                            to="/edit-profile"
                            className="glass-card rounded-[1.5rem] p-6 flex flex-col justify-between group h-[150px]"
                        >
                            <div className="flex items-start justify-between">
                                <div className="bg-indigo-50/80 backdrop-blur-sm p-4 rounded-[1.25rem] text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                    <User size={26} strokeWidth={2.5} />
                                </div>
                                <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-indigo-50 group-hover:translate-x-1 transition-all">
                                    <ChevronRight className="text-gray-400 group-hover:text-indigo-500" size={18} strokeWidth={3} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-extrabold text-gray-900 group-hover:text-indigo-700 transition-colors tracking-tight">Edit Profile</h3>
                                <p className="text-sm text-gray-500 mt-1 font-medium">Manage personal details</p>
                            </div>
                        </Link>

                        <Link
                            to="/help"
                            className="glass-card rounded-[1.5rem] p-6 flex flex-col justify-between group h-[150px]"
                        >
                            <div className="flex items-start justify-between">
                                <div className="bg-amber-50/80 backdrop-blur-sm p-4 rounded-[1.25rem] text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shadow-sm">
                                    <HelpCircle size={26} strokeWidth={2.5} />
                                </div>
                                <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-amber-50 group-hover:translate-x-1 transition-all">
                                    <ChevronRight className="text-gray-400 group-hover:text-amber-500" size={18} strokeWidth={3} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-extrabold text-gray-900 group-hover:text-amber-600 transition-colors tracking-tight">Help Center</h3>
                                <p className="text-sm text-gray-500 mt-1 font-medium">Get support & FAQs</p>
                            </div>
                        </Link>

                        {/* Link to Seller Dashboard if they are seller (Optional/Preview style) */}
                        <Link
                            to="/seller"
                            className="glass-card sm:col-span-2 rounded-[1.5rem] p-5 flex items-center justify-between group bg-white/60 hover:bg-slate-800 transition-all duration-300 border border-slate-200 hover:border-slate-800"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="bg-slate-100 p-3 rounded-[1rem] text-slate-700 group-hover:bg-slate-700 group-hover:text-white transition-colors">
                                    <Grid size={24} strokeWidth={2} />
                                </div>
                                <div>
                                    <h3 className="text-base font-extrabold text-gray-900 group-hover:text-white transition-colors tracking-tight">Go to Seller Dashboard</h3>
                                    <p className="text-xs text-gray-500 mt-0.5 font-medium group-hover:text-slate-300">Manage your shop and products</p>
                                </div>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-700 group-hover:translate-x-1 transition-all">
                                <ChevronRight className="text-gray-400 group-hover:text-white" size={20} strokeWidth={2.5} />
                            </div>
                        </Link>
                    </div>

                    {/* Logout Button */}
                    <div className="pt-4 pb-12">
                        <button
                            onClick={handleLogout}
                            className="w-full glass-card hover:bg-red-50 hover:border-red-100 rounded-[1.5rem] py-4 px-6 flex items-center justify-center space-x-3 transition-all duration-300 border border-gray-100 shadow-sm group"
                        >
                            <LogOut size={20} className="text-red-500 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                            <span className="text-sm font-extrabold tracking-wide text-red-600 uppercase">Sign Out Safely</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
