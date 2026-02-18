import React from 'react';
import { Users, Store, Shield, LogOut } from 'lucide-react';

const AdminDashboard = () => {
    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                        <Shield className="mr-2 text-blue-600" />
                        Admin Dashboard
                    </h1>
                    <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center hover:bg-gray-50">
                        <LogOut size={16} className="mr-2" /> Logout
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Total Users</p>
                                <h3 className="text-2xl font-bold text-gray-800">1,240</h3>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                                <Users size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Active Shops</p>
                                <h3 className="text-2xl font-bold text-gray-800">45</h3>
                            </div>
                            <div className="bg-green-100 p-3 rounded-lg text-green-600">
                                <Store size={24} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
