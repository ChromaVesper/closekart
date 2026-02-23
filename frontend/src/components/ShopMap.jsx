import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";

// ── Fix default Leaflet marker icon broken by Vite/Webpack ──────────────────
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// ── Custom pin icon factory ──────────────────────────────────────────────────
const createColoredPin = (color) =>
    L.divIcon({
        className: "",
        html: `<div style="
            width:32px;height:32px;border-radius:50% 50% 50% 0;
            background:${color};border:3px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,.35);
            transform:rotate(-45deg);
        "></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -34],
    });

const shopPin = createColoredPin("#4f46e5");   // indigo
const userPin = createColoredPin("#ef4444");   // red

// ── Fly-to helper whenever center changes ─────────────────────────────────────
const FlyToCenter = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) map.flyTo(center, map.getZoom(), { animate: true, duration: 1 });
    }, [center, map]);
    return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// ShopMap — main export
// Props:
//   shops        → array of Shop documents with location.coordinates
//   userLocation → { latitude, longitude }
//   radius       → number (metres), optional, default 5000
// ─────────────────────────────────────────────────────────────────────────────
const ShopMap = ({ shops = [], userLocation, radius = 5000 }) => {
    const center = useMemo(
        () =>
            userLocation
                ? [userLocation.latitude, userLocation.longitude]
                : [20.5937, 78.9629], // India fallback
        [userLocation?.latitude, userLocation?.longitude]
    );

    // Filter shops that actually have valid coordinates
    const validShops = useMemo(
        () =>
            shops.filter(
                (s) =>
                    s.location?.coordinates?.length === 2 &&
                    !isNaN(s.location.coordinates[0]) &&
                    !isNaN(s.location.coordinates[1])
            ),
        [shops]
    );

    return (
        <div className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200"
            style={{ height: "500px" }}>
            {/* Legend */}
            <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 text-xs shadow-md space-y-1">
                <div className="flex items-center gap-2 font-semibold text-gray-700">
                    <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" /> Nearby Shop
                </div>
                {userLocation && (
                    <div className="flex items-center gap-2 font-semibold text-gray-700">
                        <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> You are here
                    </div>
                )}
            </div>

            {/* Shop count badge */}
            <div className="absolute top-3 left-3 z-[1000] bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                {validShops.length} shop{validShops.length !== 1 ? "s" : ""} nearby
            </div>

            <MapContainer
                center={center}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                zoomControl={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FlyToCenter center={center} />

                {/* User location marker + radius circle */}
                {userLocation && (
                    <>
                        <Marker position={center} icon={userPin}>
                            <Popup>
                                <div className="text-center">
                                    <p className="font-bold text-red-600">📍 You are here</p>
                                </div>
                            </Popup>
                        </Marker>
                        <Circle
                            center={center}
                            radius={radius}
                            pathOptions={{
                                color: "#4f46e5",
                                fillColor: "#4f46e5",
                                fillOpacity: 0.06,
                                weight: 1.5,
                                dashArray: "6 4",
                            }}
                        />
                    </>
                )}

                {/* Shop markers */}
                {validShops.map((shop) => {
                    const [lng, lat] = shop.location.coordinates;
                    return (
                        <Marker key={shop._id} position={[lat, lng]} icon={shopPin}>
                            <Popup maxWidth={220}>
                                <div className="text-sm">
                                    <p className="font-bold text-indigo-700 text-base leading-tight mb-1">
                                        🏪 {shop.shopName}
                                    </p>
                                    <p className="text-gray-500 text-xs mb-1">{shop.category}</p>
                                    {shop.address && (
                                        <p className="text-gray-600 text-xs mb-1">📍 {shop.address}</p>
                                    )}
                                    {shop.phone && (
                                        <p className="text-gray-600 text-xs">📞 {shop.phone}</p>
                                    )}
                                    {shop.rating && (
                                        <p className="text-yellow-500 text-xs mt-1 font-semibold">
                                            ⭐ {shop.rating} rating
                                        </p>
                                    )}
                                    {shop.deliveryAvailable && (
                                        <span className="inline-block mt-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                            🚚 Delivery available
                                        </span>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default ShopMap;
