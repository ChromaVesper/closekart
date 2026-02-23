import React from "react";
import { Linkedin, Instagram } from "lucide-react";

export default function FounderBadge() {
    return (
        <div className="flex flex-col items-center justify-center mt-6">

            {/* Founder Badge Card */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-xl shadow-lg">
                <p className="text-sm font-medium opacity-90">
                    Founder • CloseKart • Est. 2026
                </p>
            </div>

            {/* Startup Credibility Strip */}
            <p className="text-xs text-gray-500 mt-3 text-center max-w-md">
                Built with ❤️ in India to empower hyperlocal commerce and enable local shopkeepers to compete with large platforms.
            </p>

            {/* Social Links */}
            <div className="flex gap-4 mt-3">
                <a
                    href="https://www.linkedin.com/in/akshaymehta7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-blue-600 transition"
                >
                    <Linkedin size={20} />
                </a>
                <a
                    href="https://instagram.com/akshay.lekh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-pink-500 transition"
                >
                    <Instagram size={20} />
                </a>
            </div>

        </div>
    );
}
