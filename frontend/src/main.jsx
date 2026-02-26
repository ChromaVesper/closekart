import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import 'leaflet/dist/leaflet.css'
import { LocationProvider } from "./context/LocationContext";
import { AuthProvider } from "./context/AuthContext";
import { AddressProvider } from "./context/AddressContext";
import { HashRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById('root')).render(
    <HashRouter>
        <AuthProvider>
            <LocationProvider>
                <AddressProvider>
                    <App />
                </AddressProvider>
            </LocationProvider>
        </AuthProvider>
    </HashRouter>
);
