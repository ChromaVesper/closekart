# CloseKart - Google Maps Quick Reference

## 🚀 Quick Setup (5 minutes)

### 1️⃣ Get API Key
```
Visit: https://console.cloud.google.com/
Create project → Enable Maps JavaScript API + Places API → Create API Key
```

### 2️⃣ Add to .env
```bash
# File: frontend/.env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyD... (your actual key)
```

### 3️⃣ Start Dev Server
```bash
cd frontend
npm run dev
```

### 4️⃣ Verify
- Open http://localhost:5173
- See map with markers ✓

---

## 📁 Files Changed

| File | Change |
|------|--------|
| `frontend/.env` | Added VITE_GOOGLE_MAPS_API_KEY variable |
| `frontend/src/contexts/LocationContext.jsx` | Uses environment variable instead of hardcoded key |
| `frontend/src/components/MapComponent.jsx` | Added error handling for failed API loads |

---

## 🔧 Code Changes

### LocationContext.jsx (Line 7)
```javascript
// Before:
const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY",
    libraries,
});

// After:
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
// ...
const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
});
```

### MapComponent.jsx (Line 23)
```javascript
// Before:
if (!isMapsLoaded) return <div>Loading Map...</div>;

// After:
if (loadError) return <div>Google Maps failed to load. Please check your API key.</div>;
if (!isMapsLoaded) return <div>Loading Map...</div>;
```

---

## ✅ Production Checklist

- [ ] Get Google Maps API key
- [ ] Add key to `frontend/.env`
- [ ] Run `cd frontend && npm run dev`
- [ ] See map load correctly
- [ ] No red error messages
- [ ] Check browser console (no errors)

---

## 🌍 Deployment

### GitHub Pages
```bash
npm run deploy
```
(Add `VITE_GOOGLE_MAPS_API_KEY` to GitHub Actions secrets)

### Vercel/Netlify
```bash
npm run build
# Upload dist/ folder
# Add environment variable in platform dashboard:
# VITE_GOOGLE_MAPS_API_KEY=YOUR_KEY
```

### Other Platforms
```bash
npm run build
# Deploy dist/ folder
# Set environment variable on platform
```

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Red error: "Google Maps failed to load" | Check API key in .env is correct |
| Map loading forever | Verify Maps JavaScript API enabled in Google Cloud |
| No markers on map | Check backend is running and serving shop data |
| Console errors | Check browser console, look for specific error messages |

---

## 📚 Full Documentation

See `GOOGLE_MAPS_SETUP_GUIDE.md` for detailed instructions.

---

**Status: ✅ Production Ready**
