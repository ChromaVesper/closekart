import { useEffect, useState, useRef } from "react";
import { useUserLocation } from "../context/LocationContext";

const MapComponent = () => {
  const [shops, setShops] = useState([]);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const { coords } = useUserLocation();

  useEffect(() => {
    const existingScript = document.getElementById("mappls-script");
    const MAPPLS_SRC =
      "https://apis.mappls.com/advancedmaps/api/8f586cb9e9cc4041f08e7780e1bd8ce1/map_sdk?layer=vector&v=3.0";

    const initMap = () => {
      if (window.mappls && !mapRef.current && coords?.latitude && coords?.longitude) {
        mapRef.current = new window.mappls.Map("map", {
          center: [coords.latitude, coords.longitude],
          zoom: 15,
        });
      }
    };

    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "mappls-script";
      script.src = MAPPLS_SRC;
      script.async = true;
      script.onload = () => initMap();
      document.body.appendChild(script);
    } else {
      initMap();
    }

    // Dynamic re-centering when tracking live
    if (mapRef.current && window.mappls && coords?.latitude && coords?.longitude) {
      mapRef.current.setCenter({ lat: coords.latitude, lng: coords.longitude });
    }
  }, [coords?.latitude, coords?.longitude]);

  // Fetch shops when location is available
  useEffect(() => {
    if (!coords?.latitude || !coords?.longitude) return;

    const base = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
    fetch(`${base}/shops?lat=${coords.latitude}&lng=${coords.longitude}`)
      .then((res) => res.json())
      .then((data) => {
        setShops(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Error loading shops:", err));
  }, [coords?.latitude, coords?.longitude]);

  // Add markers whenever shops change and map is ready
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.mappls) return;

    // Clear existing markers
    if (markersRef.current.length) {
      markersRef.current.forEach((m) => {
        try {
          m.remove();
        } catch (e) {
          /* ignore */
        }
      });
      markersRef.current = [];
    }

    if (!shops || shops.length === 0) return;

    shops.forEach((shop) => {
      // Support multiple possible coordinate formats
      let lat = null;
      let lng = null;
      if (shop.latitude && shop.longitude) {
        lat = shop.latitude;
        lng = shop.longitude;
      } else if (shop.location && Array.isArray(shop.location.coordinates)) {
        // coordinates: [lng, lat]
        lng = shop.location.coordinates[0];
        lat = shop.location.coordinates[1];
      } else if (shop.lat && shop.lng) {
        lat = shop.lat;
        lng = shop.lng;
      }

      if (lat == null || lng == null) return;

      const marker = new window.mappls.Marker({
        map: map,
        position: { lat: parseFloat(lat), lng: parseFloat(lng) },
        title: shop.shopName || shop.name || "Shop",
      });

      markersRef.current.push(marker);
    });
  }, [shops]);

  return (
    <div
      id="map"
      style={{
        width: "100%",
        height: "500px",
        borderRadius: "12px",
      }}
    />
  );
};

export default MapComponent;
