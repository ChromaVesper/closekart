import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import 'leaflet/dist/leaflet.css'
import { LocationProvider } from "./context/LocationContext";
import { AddressProvider } from "./context/AddressContext";
import { AuthProvider } from "./context/AuthContext";
import { HashRouter } from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary";

ReactDOM.createRoot(document.getElementById('root')).render(
    <HashRouter>
        <ErrorBoundary>
            <AuthProvider>
                <LocationProvider>
                    <AddressProvider>
                        <App />
                    </AddressProvider>
                </LocationProvider>
            </AuthProvider>
        </ErrorBoundary>
    </HashRouter>
);
