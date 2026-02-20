# CloseKart Production Deployment Checklist

## Pre-Deployment Verification

### Local Testing (✓ Completed)
- [x] Backend running on port 3001 locally
- [x] Frontend running on port 5173 locally
- [x] MongoDB Atlas connected
- [x] Shops API returns data
- [x] Frontend fetches shops successfully
- [x] Mappls map displays with markers
- [x] No CORS errors in console
- [x] No API connectivity errors
- [x] Production build created (`npm run build`)
- [x] Build artifacts in `frontend/dist/`

### Configuration Files Created
- [x] `backend/.env.production`
- [x] `frontend/.env.production`
- [x] `backend/render.yaml`
- [x] `frontend/netlify.toml`
- [x] `vercel.json`
- [x] `DEPLOYMENT_GUIDE.md`

### Code Changes
- [x] Backend CORS configured with environment variables
- [x] Backend `package.json` has `start` script
- [x] Frontend uses `import.meta.env.VITE_API_URL`
- [x] Vite config has correct base path: `/closekart/`

---

## Backend Deployment on Render

### Pre-Deployment
- [ ] Push backend code to GitHub
- [ ] Verify code is on `feature/closekart-v1` branch

### During Deployment
- [ ] Create new Web Service on Render
- [ ] Connect to GitHub repository
- [ ] Set root directory to `backend`
- [ ] Configure build command: `npm install`
- [ ] Configure start command: `npm start`
- [ ] Set environment variables:
  - [ ] `PORT=8000`
  - [ ] `NODE_ENV=production`
  - [ ] `MONGO_URI=mongodb+srv://...`
  - [ ] `JWT_SECRET=<secure_random_string>`
  - [ ] `FRONTEND_URL=<your-frontend-url>`
- [ ] Monitor deploy logs
- [ ] Verify "Server running on port 8000"
- [ ] Verify "MongoDB connected successfully"

### Post-Deployment
- [ ] Note backend URL: `https://closekart-backend.onrender.com`
- [ ] Test API: `curl https://closekart-backend.onrender.com/api`
- [ ] Test shops endpoint: `curl https://closekart-backend.onrender.com/api/shops`
- [ ] Verify response is valid JSON

---

## Frontend Deployment on Netlify

### Pre-Deployment
- [ ] Update `frontend/.env.production` with backend URL
- [ ] Build frontend: `npm run build`
- [ ] Verify `frontend/dist/` exists and has `index.html`
- [ ] Push frontend code to GitHub

### During Deployment (Netlify)
- [ ] Connect GitHub repository to Netlify
- [ ] Select `feature/closekart-v1` branch
- [ ] Set build command: `cd frontend && npm run build`
- [ ] Set publish directory: `frontend/dist`
- [ ] Set environment variable: `VITE_API_URL=https://closekart-backend.onrender.com/api`
- [ ] Wait for build to complete (should take 2-5 minutes)
- [ ] Monitor build logs for errors

### Post-Deployment (Netlify)
- [ ] Note frontend URL (provided by Netlify)
- [ ] Open frontend URL in browser
- [ ] Check for 404 or white screen (if appears, vite.config.js base path issue)
- [ ] Open DevTools console (F12)
- [ ] Navigate to a page that displays the map
- [ ] Verify no console errors

---

## Alternative: Frontend Deployment on Vercel

### Pre-Deployment
- [ ] Push code to GitHub
- [ ] Install Vercel CLI: `npm install -g vercel`

### During Deployment
- [ ] Run: `vercel`
- [ ] Link to project or create new
- [ ] Set build command: `npm run build`
- [ ] Set output directory: `frontend/dist`
- [ ] Set environment variable: `VITE_API_URL=https://closekart-backend.onrender.com/api`
- [ ] Wait for deployment

### Post-Deployment
- [ ] Note Vercel deployment URL
- [ ] Test in browser
- [ ] Verify API connectivity

---

## Cross-Service Configuration

### After Both Services Are Deployed

1. [ ] Get frontend URL from Netlify/Vercel
2. [ ] Update backend `FRONTEND_URL` in Render:
   - Go to Render → closekart-backend → Environment
   - Update `FRONTEND_URL=<your-netlify-or-vercel-url>`
   - Save (Render auto-redeploys)
3. [ ] Wait for backend to redeploy
4. [ ] Test CORS:
   ```bash
   curl -X OPTIONS https://closekart-backend.onrender.com/api/shops \
     -H "Origin: <frontend-url>" \
     -H "Access-Control-Request-Method: GET" \
     -v
   ```
   Verify response includes:
   ```
   Access-Control-Allow-Origin: <frontend-url>
   Access-Control-Allow-Credentials: true
   ```

---

## End-to-End Testing

### Frontend Functionality
- [ ] Open frontend URL in browser
- [ ] Navigate to Home page - loads without errors
- [ ] Open DevTools Console (F12)
- [ ] No errors visible
- [ ] No CORS errors
- [ ] No 404 errors for assets

### Map Functionality
- [ ] Navigate to map page (Search, ShopDetails, etc.)
- [ ] Map loads (Mappls map visible)
- [ ] Console shows: "Shops loaded: <number>" (5+)
- [ ] Console shows: "Adding markers: <number>" (5+)
- [ ] Markers visible on map at Patna location
- [ ] Can click/interact with map

### API Connectivity
- [ ] Test shops endpoint:
   ```bash
   curl https://closekart-backend.onrender.com/api/shops
   ```
   Response should be valid JSON array with 5+ shops

- [ ] Test health endpoint:
   ```bash
   curl https://closekart-backend.onrender.com/api
   ```
   Response should include status: "OK"

### Authentication (if applicable)
- [ ] Registration works (if public signup enabled)
- [ ] Login works
- [ ] JWT tokens are created
- [ ] Protected routes work

---

## Monitoring & Alerts Setup

### Render Monitoring
- [ ] Enable error notifications
- [ ] Monitor CPU usage (should be < 50% idle)
- [ ] Monitor memory usage (should be < 100MB)
- [ ] Check uptime metrics

### Netlify/Vercel Monitoring
- [ ] Enable analytics
- [ ] Monitor deploy success rate
- [ ] Watch build times

### MongoDB Atlas Monitoring
- [ ] Check connection count (should be reasonable)
- [ ] Monitor storage usage
- [ ] Set alerts for storage limits
- [ ] Monitor query performance

---

## Production URLs & Documentation

### Record These URLs
- **Frontend:** `https://[your-netlify-domain].netlify.app`
- **Backend:** `https://closekart-backend.onrender.com`
- **API Base:** `https://closekart-backend.onrender.com/api`

### Documentation to Share
- [ ] DEPLOYMENT_GUIDE.md reviewed and updated
- [ ] URLs documented
- [ ] Admin access documented
- [ ] Maintenance procedures documented

---

## Go-Live

When all checks pass:

- [ ] Do final E2E test in production environment
- [ ] Verify all team members can access
- [ ] Notify stakeholders
- [ ] Monitor first 24 hours closely
- [ ] Be ready to rollback if critical issues occur

### Rollback Plan (Emergency Only)
- Backend: Revert commit on GitHub and push (Render auto-redeploys)
- Frontend: Revert commit and push (Netlify/Vercel auto-redeploys)
- Or use service rollback feature in Render/Netlify/Vercel dashboard

---

## Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| Developer | | | |
| QA Lead | | | |
| DevOps | | | |
| Product Manager | | | |

---

**Last Updated:** 20 February 2026  
**Deployment Status:** Ready for Production ✅
