#!/bin/bash
# Quick setup script for production deployment

# Update these values
VERCEL_FRONTEND_URL="https://your-app.vercel.app"
RAILWAY_BACKEND_URL="https://your-app.up.railway.app"

# Step 1: Set up Vercel environment
echo "📦 Setting up Vercel (Frontend)..."
echo "1. Go to https://vercel.com/new"
echo "2. Import your GitHub repository"
echo "3. Set Environment Variable:"
echo "   VITE_API_URL=$RAILWAY_BACKEND_URL"
echo "4. Set Build Command: npm run build"
echo "5. Set Output Directory: client/dist"
echo ""

# Step 2: Set up Railway environment
echo "🚀 Setting up Railway (Backend + ML)..."
echo "1. Go to https://railway.app"
echo "2. Create new project from GitHub"
echo "3. Set Environment Variables:"
echo "   - PORT=3000"
echo "   - NODE_ENV=production"
echo "   - NLP_ENGINE_URL=http://localhost:5001"
echo "   - FLASK_ENV=production"
echo "   - CORS_ORIGIN=$VERCEL_FRONTEND_URL"
echo ""

# Step 3: Push to GitHub
echo "📤 Pushing code to GitHub..."
git add .
git commit -m "Update deployment configuration"
git push origin main
echo ""

echo "✅ Setup complete!"
echo "Once deployed, update the URLs above and redeploy for final connection."
