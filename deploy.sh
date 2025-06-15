#!/bin/bash

echo "🚀 SmartDocs Deployment Helper"
echo "=============================="

echo "📋 Pre-deployment Checklist:"
echo "1. Push your code to GitHub"
echo "2. Create accounts on Vercel and Railway"
echo "3. Set up environment variables (see DEPLOYMENT.md)"
echo ""

echo "🌐 Frontend Deployment (Vercel):"
echo "1. Go to https://vercel.com"
echo "2. Import your GitHub repository"
echo "3. Set root directory to: frontend"
echo "4. Add environment variables in Vercel dashboard"
echo ""

echo "🐍 Backend Deployment (Railway):"
echo "1. Go to https://railway.app"
echo "2. Deploy from GitHub repository"
echo "3. Set root directory to: backend"
echo "4. Add environment variables in Railway dashboard"
echo "5. Run migrations after deployment"
echo ""

echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "⚠️  No git repository found. Initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo ""
fi

# Check if package.json exists in frontend
if [ ! -f "frontend/package.json" ]; then
    echo "❌ Frontend package.json not found"
    exit 1
fi

# Check if requirements.txt exists in backend
if [ ! -f "backend/requirements.txt" ]; then
    echo "❌ Backend requirements.txt not found"
    exit 1
fi

echo "✅ All files are ready for deployment!"
echo "🎯 Next steps:"
echo "1. Push to GitHub: git push origin main"
echo "2. Deploy frontend on Vercel"
echo "3. Deploy backend on Railway"
echo "4. Configure environment variables"
echo "5. Test your deployed application" 