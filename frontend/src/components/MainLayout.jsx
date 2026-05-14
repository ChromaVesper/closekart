import React from 'react';
import Header from './Header';
import MobileNav from './MobileNav';
import DesktopSidebar from './DesktopSidebar';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

/**
 * MainLayout
 *
 * Structure (desktop):
 *   ┌─────────────────────────────────────────────┐
 *   │  Header (sticky, full width, z-50)          │
 *   ├────────┬────────────────────────────────────┤
 *   │        │  <main>  page content              │
 *   │Sidebar │                                    │
 *   │ fixed  │  <Footer>  always after content    │
 *   │ 256px  │                                    │
 *   └────────┴────────────────────────────────────┘
 *
 * On mobile the sidebar is hidden and MobileNav appears at the bottom.
 * The content area + footer are always full-width on mobile (no offset).
 */
const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-brand-bg font-sans flex flex-col">

            {/* ── Sticky top bar ── */}
            <Header />

            {/* ── Body: sidebar + scrollable content column ── */}
            <div className="flex flex-1 pt-16">

                {/* Desktop sidebar — fixed, hidden on mobile */}
                <DesktopSidebar />

                {/*
                 * Content column:
                 *   md:ml-64  → push right of the 256px fixed sidebar on desktop
                 *   w-full    → fill remaining width
                 *   flex flex-col → so footer stays at the bottom of this column
                 *
                 * NO padding/margin offset on mobile (sidebar is hidden).
                 */}
                <div className="flex flex-col flex-1 w-full md:ml-64 min-w-0">

                    {/* Page content */}
                    <main className="flex-1 w-full">
                        <div className="w-full max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-6 pb-24 md:pb-10">
                            {children || <Outlet />}
                        </div>
                    </main>

                    {/* Footer — lives inside the offset column so it never goes under the sidebar */}
                    <div className="mt-auto">
                        <Footer />
                    </div>

                </div>
            </div>

            {/* Mobile bottom nav — fixed, full width, above page content */}
            <MobileNav />
        </div>
    );
};

export default MainLayout;
