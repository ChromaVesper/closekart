import React from 'react';

export default function AdminSettings() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Platform Configuration</h2>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 max-w-2xl">
                <form className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Base Commission Percentage (%)</label>
                        <input type="number" defaultValue={5} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Standard Delivery Fee (₹)</label>
                        <input type="number" defaultValue={49} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                    </div>
                    <div className="pt-4 flex gap-4">
                        <button type="button" className="px-6 py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center justify-center">
                            Save Global Settings
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
