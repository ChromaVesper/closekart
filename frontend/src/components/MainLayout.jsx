import React from 'react';
import Header from './Header';
import MobileNav from './MobileNav';
import DesktopSidebar from './DesktopSidebar';
import { Outlet } from 'react-router-dom';

const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-brand-bg font-sans flex flex-col">
            {/* Top Navigation Bar - Fixed across all viewports */}
            <Header />

            <div className="flex flex-1 pt-16">
                {/* Desktop Left Sidebar */}
                <DesktopSidebar />

                {/* Main Content Area */}
                <main className="flex-1 w-full md:pl-64 transition-all duration-300">
                    <div className="max-w-5xl mx-auto md:p-6 lg:p-8 pb-20 md:pb-8 h-full">
                        {/* 
                            On mobile, this spans full width. 
                            On desktop, it is constrained within max-w-5xl leaving the sides padded.
                        */}
                        {children || <Outlet />}
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <MobileNav />
        </div>
    );
};

export default MainLayout;
