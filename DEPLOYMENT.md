# Deployment Guide: Vercel (Frontend) + Railway (Backend + ML)

## Prerequisites

- [Vercel Account](https://vercel.com/signup)
- [Railway Account](https://railway.app/register)
- GitHub repository with your code pushed
- Git CLI installed locally

---

## Part 1: Deploy Backend & ML Engine to Railway

### Step 1: Push Your Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2: Create a Railway Project

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub account
5. Select the repository containing your Leadsieve code
6. Railway will auto-detect the Dockerfile and deploy

### Step 3: Configure Railway Environment Variables

In the Railway dashboard for your project:

1. Go to **Variables** tab
2. Add these environment variables:

   ```
   PORT=3000
   NODE_ENV=production
   NLP_ENGINE_URL=http://localhost:5001
   FLASK_ENV=production
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   ```

3. Replace `https://your-vercel-app.vercel.app` with your actual Vercel frontend URL (you'll get this after deploying frontend)

### Step 4: Wait for Deployment

- Railway will build and deploy your Docker image
- Once complete, you'll get a public URL: `https://your-railway-app.up.railway.app`
- **Note this URL** - you'll need it for the frontend

### Step 5: Test the Backend

```bash
# Test if backend is running
curl https://your-railway-app.up.railway.app/
```

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Import Project to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"** → **"Import Git Repository"**
3. Select your GitHub repository
4. Click **"Import"**

### Step 2: Configure Environment Variables in Vercel

Before deploying, set environment variables:

1. In the Vercel project settings, go to **Settings** → **Environment Variables**
2. Add this variable (replace with your Railway URL):
   ```
   VITE_API_URL=https://your-railway-app.up.railway.app
   ```

### Step 3: Configure Build Settings

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Root Directory**: `./client`

### Step 4: Deploy

- Click **"Deploy"**
- Vercel will automatically build and deploy your frontend
- Your app will be live at `https://your-project.vercel.app`

### Step 5: Update Railway CORS

1. Go back to Railway dashboard
2. Update `CORS_ORIGIN` environment variable with your Vercel URL
3. Railway will redeploy automatically

---

## Part 3: Verify Everything Works

### Frontend to Backend Connection

1. Open your Vercel app: `https://your-project.vercel.app`
2. Try analyzing a URL
3. Check the browser console (F12) for any errors

### Debugging Common Issues

**CORS Errors:**

- Make sure `CORS_ORIGIN` in Railway matches your Vercel URL exactly
- Verify CORS is enabled in `server.js`

**NLP Engine Errors (503/500):**

- Check Railway logs: Dashboard → Your Project → Logs
- The ML models take time to load on first run (30s+)
- Increase Railway's memory if needed: Settings → Plan

**API Connection Timeouts:**

- Verify `VITE_API_URL` is set correctly in Vercel
- Check if Railway app is running: Visit the Railway URL directly
- Increase timeout in `server.js` if needed

---

## Environment Variables Reference

### Railway (Backend + ML)

```
PORT=3000
NODE_ENV=production
NLP_ENGINE_URL=http://localhost:5001
FLASK_ENV=production
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

### Vercel (Frontend)

```
VITE_API_URL=https://your-railway-app.up.railway.app
```

---

## Local Development

### Run locally before deploying:

```bash
# Terminal 1: Start NLP engine
python nlp_engine.py

# Terminal 2: Start backend server
node server.js

# Terminal 3: Start frontend
cd client && npm run dev
```

Then visit: `http://localhost:5173`

---

## Redeployment

**To redeploy after code changes:**

### For Backend (Railway)

- Push changes to GitHub
- Railway auto-deploys from main branch

### For Frontend (Vercel)

- Push changes to GitHub
- Vercel auto-deploys from main branch
- Or manually trigger in Vercel dashboard

---

## Production Optimization Tips

1. **Railway Memory**: Upgrade plan if ML model loading times out
2. **Model Caching**: Models are cached after first load
3. **Vercel**: Use the default serverless plan for frontend only
4. **Cold Starts**: First request may be slow (models loading)

---

## Troubleshooting

**Models not loading:**

```
Check Railway logs:
- Click your project
- Go to Logs tab
- Look for "Loading sentiment model" message
```

**API requests failing:**

- Open browser DevTools (F12)
- Check Network tab
- Verify response headers include CORS headers

**Build fails on Vercel:**

- Check build logs in Vercel dashboard
- Ensure `client/package.json` has all dependencies
- Run `npm run build` locally to test

---

## Cost Estimates

- **Vercel**: Free plan sufficient for frontend (~3GB/month)
- **Railway**: Free plan includes $5 credit (~100 hours computation)
  - For regular usage, expect $10-20/month
  - ML model inference is the main cost driver

For production workloads, consider:

- Vercel Pro ($20/month) for higher limits
- Railway paid plan for more resources
