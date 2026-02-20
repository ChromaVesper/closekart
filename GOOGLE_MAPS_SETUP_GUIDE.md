# Google Maps API Configuration Guide

## ✅ Production-Ready Setup

Your CloseKart frontend has been configured for production-ready Google Maps integration.

---

## Step 1: Get Your Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable these APIs:
   - **Maps JavaScript API**
   - **Places API**
4. Create an API key:
   - Go to Credentials → Create Credentials → API Key
   - Copy your API key

---

## Step 2: Add API Key to .env

Open `frontend/.env` and replace:

```env
VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
```

With your actual API key:

```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyD1234567890abcdefghijklmnop
```

**⚠️ IMPORTANT:** Never commit your actual API key to version control!

---

## Step 3: Start Development Server

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173` (or next available port).

---

## Step 4: Verify Google Maps is Working

1. Open the app in your browser
2. Navigate to a page with a map component
3. You should see:
   - ✅ Map loading correctly
   - ✅ User location marker (blue circle)
   - ✅ Shop markers on the map
   - ✅ No console errors
   - ✅ No red error messages

---

## Technical Implementation

### LocationContext.jsx
- Uses environment variable: `import.meta.env.VITE_GOOGLE_MAPS_API_KEY`
- Provides `loadError` context for error handling
- Gracefully falls back to default location if API key is missing

### MapComponent.jsx
- Checks for `loadError` and displays user-friendly error message
- Shows loading state while API loads
- Renders maps only when fully loaded

### Environment Variables
- Configured in `frontend/.env`
- Loaded via Vite's `import.meta.env`
- Not hardcoded anywhere in the source code

---

## Production Deployment

### Environment Variables
For production deployments (GitHub Pages, Vercel, Netlify, etc.), add:

```
VITE_GOOGLE_MAPS_API_KEY=YOUR_PRODUCTION_API_KEY
```

to your deployment platform's environment variables section.

### Security Best Practices

1. **Use API Key Restrictions:**
   - In Google Cloud Console, set HTTP referrers for your domain
   - Example: `https://yourdomain.com/*`

2. **Never Commit API Keys:**
   - `.env` is in `.gitignore`
   - Only commit `.env.example` with placeholder

3. **Use Different Keys:**
   - Development key: `YOUR_GOOGLE_MAPS_API_KEY`
   - Production key: Set via deployment platform environment variables

---

## Troubleshooting

### Issue: "Google Maps failed to load"
- Check your API key is valid and active
- Verify Maps JavaScript API is enabled in Google Cloud Console
- Check browser console for specific error messages

### Issue: Map shows blank/loading forever
- Ensure API key has no typos
- Check that Maps JavaScript API is enabled
- Verify `import.meta.env.VITE_GOOGLE_MAPS_API_KEY` is set

### Issue: Console errors about quota
- Check API quota limits in Google Cloud Console
- Upgrade your plan if needed

---

## Files Modified

✅ `frontend/src/contexts/LocationContext.jsx`
- Uses `import.meta.env.VITE_GOOGLE_MAPS_API_KEY`
- Exports `loadError` for error handling

✅ `frontend/src/components/MapComponent.jsx`
- Added error handling for failed API loads
- Shows user-friendly error messages

✅ `frontend/.env`
- Placeholder configured: `VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY`

---

## Build & Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Deploy to GitHub Pages
```bash
npm run deploy
```

---

## Status: ✅ PRODUCTION READY

Your frontend is configured for production with:
- ✅ Environment variable-based configuration
- ✅ No hardcoded API keys
- ✅ Comprehensive error handling
- ✅ Graceful fallbacks
- ✅ Ready for deployment

**Next Step:** Add your actual Google Maps API key to `.env` and restart the dev server.
