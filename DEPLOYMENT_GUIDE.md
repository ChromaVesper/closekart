# CloseKart Production Deployment Guide

**Last Updated:** 20 February 2026  
**Status:** Production-Ready ✅

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Deployment (Render)](#backend-deployment-render)
3. [Frontend Deployment (Netlify/Vercel)](#frontend-deployment-netlifyvercel)
4. [Post-Deployment Configuration](#post-deployment-configuration)
5. [Monitoring & Troubleshooting](#monitoring--troubleshooting)
6. [Rollback Procedures](#rollback-procedures)

---

## Prerequisites

### Required Services & Accounts

Before deploying, ensure you have:

- **GitHub Account** - Source code repository
- **Render Account** - Backend hosting (https://render.com)
- **Netlify or Vercel Account** - Frontend hosting
- **MongoDB Atlas Account** - Database (already configured)
- **Git CLI** - For pushing code

### System Requirements

- Node.js 16+ locally for testing
- npm/yarn package manager
- Git version control

### Current Configuration Status

| Component | Status | Details |
|-----------|--------|---------|
| Backend | ✅ Ready | Express + MongoDB Atlas |
| Frontend | ✅ Ready | React + Vite + Mappls |
| Database | ✅ Connected | MongoDB Atlas cluster0 |
| Environment | ✅ Configured | .env.production files created |
| Build | ✅ Tested | Production build verified locally |

---

## Backend Deployment (Render)

### Step 1: Prepare Backend Repository

1. **Ensure Git is configured:**
   ```bash
   cd backend
   git init  # Only if not already in a git repo
   git add .
   git commit -m "Backend production ready"
   ```

2. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/ChromaVesper/closekart.git
   git push -u origin feature/closekart-v1
   ```

### Step 2: Create Render Service

1. **Log in to Render:** https://render.com
2. **Click "New +" → Select "Web Service"**
3. **Connect GitHub Repository:**
   - Select `ChromaVesper/closekart` repository
   - Branch: `feature/closekart-v1`
   - Root Directory: `backend`

4. **Configure Service:**

   | Setting | Value |
   |---------|-------|
   | Name | `closekart-backend` |
   | Runtime | `Node` |
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Environment | Production |
   | Region | Mumbai (or closest) |
   | Plan | Free (or Starter) |

### Step 3: Set Environment Variables on Render

1. **Go to Service Settings → Environment**
2. **Add the following variables:**

   ```
   PORT=8000
   NODE_ENV=production
   MONGO_URI=mongodb+srv://closekart:%23closekart74@cluster0.wy3rb6d.mongodb.net/closekart?retryWrites=true&w=majority
   JWT_SECRET=your_secure_jwt_secret_key_generate_random_string_here
   FRONTEND_URL=https://your-frontend-url.netlify.app
   ```

   **Important:** Replace `FRONTEND_URL` with your actual frontend URL after deployment.

3. **Click "Save"**

### Step 4: Deploy Backend

1. **Render will automatically deploy on git push**
2. **Monitor deployment logs:**
   - Go to Service → Logs
   - Wait for "Server running on port 8000" message
   - Expected output: "MongoDB connected successfully"

3. **Verify backend is running:**
   ```bash
   curl https://closekart-backend.onrender.com/api
   ```

   Expected response:
   ```json
   {
     "status": "OK",
     "message": "CloseKart API is running",
     "timestamp": "2026-02-20T06:11:09.643Z"
   }
   ```

### Step 5: Note the Backend URL

Backend URL format: `https://closekart-backend.onrender.com`

**Keep this URL handy - you'll need it for frontend deployment.**

---

## Frontend Deployment (Netlify/Vercel)

### Option A: Deploy with Netlify

#### Step 1: Build Frontend Locally

```bash
cd frontend
npm install
npm run build
```

**Expected output:**
```
✓ 1538 modules transformed.
dist/index.html                   0.49 kB │ gzip:  0.32 kB
dist/assets/index-c1MxscZO.css   21.04 kB │ gzip:  4.50 kB
dist/assets/index-DqIV-nFY.js   240.08 kB │ gzip: 77.60 kB
✓ built in 1.00s
```

#### Step 2: Connect to Netlify

1. **Log in to Netlify:** https://netlify.com
2. **Click "Add new site" → "Import an existing project"**
3. **Connect GitHub:**
   - Select `ChromaVesper/closekart` repository
   - Branch: `feature/closekart-v1`

#### Step 3: Configure Netlify Build Settings

| Setting | Value |
|---------|-------|
| Build Command | `cd frontend && npm run build` |
| Publish Directory | `frontend/dist` |
| Node Version | 18 (or latest) |

#### Step 4: Set Environment Variables

1. **Go to Site Settings → Build & Deploy → Environment**
2. **Add environment variable:**
   ```
   VITE_API_URL=https://closekart-backend.onrender.com/api
   ```

3. **Trigger deploy:**
   - Push to GitHub, or
   - Manual deploy from Netlify dashboard

#### Step 5: Verify Frontend

1. **Wait for deployment to complete (usually 2-3 minutes)**
2. **Netlify will provide a URL like:** `https://closekart-yourname.netlify.app`
3. **Test the site:**
   - Open the URL in browser
   - Check browser console (F12) for errors
   - Navigate to map page
   - Verify shops are loaded from backend API

---

### Option B: Deploy with Vercel

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Deploy Frontend

```bash
cd /path/to/closekart/frontend
vercel
```

Follow the prompts:
- Link to existing project or create new
- Set production domain
- Configure environment variables

#### Step 3: Set Environment Variables in Vercel

1. **Go to Project Settings → Environment Variables**
2. **Add:**
   ```
   VITE_API_URL=https://closekart-backend.onrender.com/api
   ```

3. **Redeploy:** `vercel --prod`

---

## Post-Deployment Configuration

### Step 1: Update Backend CORS Settings

1. **Go to Render → closekart-backend → Environment**
2. **Update FRONTEND_URL to your deployed frontend URL:**
   ```
   FRONTEND_URL=https://your-frontend-url.netlify.app
   ```

3. **Click Save** (Render will auto-redeploy)

### Step 2: Verify CORS is Working

```bash
curl -X OPTIONS https://closekart-backend.onrender.com/api/shops \
  -H "Origin: https://your-frontend-url.netlify.app" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

Expected response headers should include:
```
Access-Control-Allow-Origin: https://your-frontend-url.netlify.app
Access-Control-Allow-Credentials: true
```

### Step 3: Test End-to-End

1. **Open deployed frontend in browser**
2. **Navigate to Home page**
3. **Open DevTools Console (F12)**
4. **Verify no errors appear**
5. **Navigate to map/shop pages**
6. **Check console for:**
   - "Shops loaded: (5 shops)" or more
   - "Adding markers: 5" or more
7. **Verify Mappls map displays with markers**

### Step 4: Update MongoDB Whitelist (if needed)

If MongoDB Atlas has IP whitelist enabled:

1. **Go to MongoDB Atlas Cluster → Network Access**
2. **Add Render IP address** (Render provides it in logs)
3. **Or allow all IPs: `0.0.0.0/0` (development only)**

---

## Monitoring & Troubleshooting

### Common Issues & Solutions

#### Issue 1: "Cannot GET /closekart/"

**Cause:** Netlify base path configuration issue

**Solution:**
1. Check `frontend/vite.config.js` has `base: '/closekart/'`
2. Verify `netlify.toml` exists and is correct
3. Trigger rebuild from Netlify dashboard

#### Issue 2: API Requests Return 403 or CORS Error

**Cause:** CORS not properly configured

**Solution:**
1. Verify `FRONTEND_URL` is set in Render environment
2. Restart backend service in Render
3. Check browser console for exact CORS error
4. Verify both services are on HTTPS (not HTTP)

#### Issue 3: Shops Not Loading on Frontend

**Cause:** API URL incorrect or backend not responding

**Solution:**
```bash
# Test backend API
curl https://closekart-backend.onrender.com/api/shops

# If empty, check MongoDB connection in Render logs
# If error, verify MONGO_URI environment variable
```

#### Issue 4: "Cannot connect to MongoDB"

**Cause:** MongoDB Atlas IP whitelist or wrong connection string

**Solution:**
1. Go to MongoDB Atlas → Network Access
2. Ensure Render IP is whitelisted
3. Or temporarily allow all IPs: `0.0.0.0/0`
4. Verify `MONGO_URI` in Render matches MongoDB Atlas credentials

### Monitoring Tools

#### Render Service Health

- **URL:** https://render.com/dashboard
- **Check:** Logs → Last 100 lines for errors
- **Monitor:** CPU usage, memory, uptime

#### Frontend Performance

- **Netlify Analytics:** https://app.netlify.com/sites/your-site/analytics
- **Vercel Analytics:** https://vercel.com/dashboard
- **Monitor:** Page load times, build times, errors

#### Database Monitoring

- **MongoDB Atlas Metrics:** https://cloud.mongodb.com/
- **Monitor:** Query performance, storage usage, connection count

---

## Rollback Procedures

### Rollback Backend (Render)

1. **Go to Render Service → Deploys**
2. **Find previous successful deploy**
3. **Click "..." → "Redeploy"**
4. **Or revert commit on GitHub and push:**
   ```bash
   git revert HEAD
   git push origin feature/closekart-v1
   ```

### Rollback Frontend (Netlify)

1. **Go to Netlify → Deploys**
2. **Find previous successful deploy**
3. **Click "..." → "Restore deploy"**
4. **Or revert commit and push to trigger rebuild:**
   ```bash
   git revert HEAD
   git push origin feature/closekart-v1
   ```

### Emergency Rollback

If production is broken:

1. **Backend:** Force redeploy specific commit:
   ```bash
   git revert <commit-hash>
   git push origin feature/closekart-v1
   ```

2. **Frontend:** Same process on frontend branch

3. **Check logs:** Monitor deployments until stable

---

## Production URLs

After successful deployment, your application will be available at:

| Service | URL |
|---------|-----|
| **Frontend** | `https://closekart-yourname.netlify.app` |
| **Backend API** | `https://closekart-backend.onrender.com` |
| **API Endpoint** | `https://closekart-backend.onrender.com/api` |
| **Shops Endpoint** | `https://closekart-backend.onrender.com/api/shops` |

---

## Performance Optimization

### Frontend Optimization

1. **Enable Gzip compression** (Netlify/Vercel do this by default)
2. **Use CDN** (included with Netlify/Vercel)
3. **Optimize images** in `frontend/src/assets/`
4. **Lazy load components** if needed

### Backend Optimization

1. **Add caching headers** to Render service
2. **Enable MongoDB caching** in Atlas
3. **Monitor API response times** in Render logs
4. **Scale up if needed:** Upgrade from Free to Starter plan

---

## Security Checklist

- [ ] JWT_SECRET is strong and random
- [ ] MONGO_URI credentials are kept secret (not in source code)
- [ ] CORS is restricted to known frontend URL
- [ ] HTTPS is enabled on both services
- [ ] MongoDB IP whitelist is configured
- [ ] Environment variables are not logged
- [ ] No API keys exposed in frontend code
- [ ] Sensitive data is not stored in localStorage

---

## Support & Resources

| Resource | Link |
|----------|------|
| Render Docs | https://render.com/docs |
| Netlify Docs | https://docs.netlify.com |
| Vercel Docs | https://vercel.com/docs |
| MongoDB Atlas Docs | https://docs.mongodb.com/atlas/ |
| Vite Deployment Guide | https://vitejs.dev/guide/ssr.html |
| Express Production Best Practices | https://expressjs.com/en/advanced/best-practice-security.html |

---

## Deployment Checklist

Before going live:

- [ ] Backend environment variables configured on Render
- [ ] Frontend .env.production uses correct API URL
- [ ] Frontend build completes without errors
- [ ] MongoDB Atlas has required data (shops, products, etc.)
- [ ] All services tested locally
- [ ] End-to-end test completed successfully
- [ ] CORS headers verified
- [ ] SSL/HTTPS enabled on both services
- [ ] Monitoring and alerts configured
- [ ] Backup strategy in place for MongoDB

---

## Next Steps

1. **Deploy Backend:** Follow Backend Deployment (Render) section
2. **Deploy Frontend:** Follow Frontend Deployment (Netlify/Vercel) section
3. **Configure CORS:** Update backend FRONTEND_URL after frontend deployment
4. **Monitor:** Watch logs for first 24 hours
5. **Test:** Verify all features work in production
6. **Celebrate!** 🎉 CloseKart is now live!

---

## Emergency Contact

For deployment issues:

- **Render Support:** https://render.com/support
- **Netlify Support:** https://support.netlify.com
- **Vercel Support:** https://vercel.com/support
- **MongoDB Support:** https://www.mongodb.com/support

---

**Generated:** 20 February 2026  
**Version:** 1.0  
**Status:** Production Ready ✅
