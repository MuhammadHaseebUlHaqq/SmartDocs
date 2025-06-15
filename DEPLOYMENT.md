# SmartDocs Deployment Guide

This guide will help you deploy your SmartDocs application. The project consists of:
- **Frontend**: Next.js 14 application (deployed on Vercel)
- **Backend**: Django REST API (deployed on Railway/Heroku/similar)

## 🚀 Frontend Deployment (Vercel)

### Prerequisites
1. [Vercel Account](https://vercel.com)
2. GitHub repository (push your code to GitHub first)

### Step 1: Prepare Your Frontend

The frontend is already configured for Vercel deployment with the `vercel.json` file in the root directory.

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect it's a Next.js project
5. Configure the build settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

#### Option B: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from the root directory
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (your username)
# - Link to existing project? N
# - Project name: smartdocs
# - In which directory is your code located? ./frontend
```

### Step 3: Configure Environment Variables

In your Vercel dashboard, go to your project settings and add these environment variables:

```env
# Backend API URL (update after deploying backend)
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api

# Google OAuth (get from Google Cloud Console)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Stripe (get from Stripe Dashboard)
NEXT_PUBLIC_STRIPE_PRICE_STARTER=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE=price_xxxxx
```

## 🐍 Backend Deployment (Railway)

### Prerequisites
1. [Railway Account](https://railway.app)
2. GitHub repository

### Step 1: Prepare Your Backend

1. **Update `backend/smartdocs/settings.py`** for production:

```python
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost').split(',')

# Database - use PostgreSQL in production
if os.getenv('DATABASE_URL'):
    import dj_database_url
    DATABASES = {
        'default': dj_database_url.parse(os.getenv('DATABASE_URL'))
    }
else:
    # Fallback to SQLite for development
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# CORS settings for production
CORS_ALLOWED_ORIGINS = [
    "https://your-vercel-app.vercel.app",  # Update with your Vercel URL
]

CSRF_TRUSTED_ORIGINS = [
    "https://your-vercel-app.vercel.app",  # Update with your Vercel URL
]
```

2. **Add production dependencies** to `backend/requirements.txt`:

```txt
# Add these lines
dj-database-url==1.3.0
psycopg2-binary==2.9.7
gunicorn==21.2.0
whitenoise==6.6.0
```

3. **Create `backend/Procfile`**:

```
web: gunicorn smartdocs.wsgi --log-file -
```

### Step 2: Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect it's a Python project
5. Set the root directory to `backend`

### Step 3: Configure Environment Variables

In Railway dashboard, add these environment variables:

```env
# Django
SECRET_KEY=your-super-secret-django-key
DEBUG=False
ALLOWED_HOSTS=your-app-name.railway.app,localhost

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Google
GOOGLE_APPLICATION_CREDENTIALS=path-to-service-account-json

# Stripe
STRIPE_SECRET_KEY=sk_live_or_test_key
STRIPE_WEBHOOK_SECRET=whsec_webhook_secret

# Database (Railway will auto-provide)
DATABASE_URL=postgresql://... (auto-generated)
```

### Step 4: Run Migrations

After deployment, run migrations using Railway's console:

```bash
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

## 🔄 Connect Frontend and Backend

1. **Update Frontend Environment Variables** in Vercel:
   - Set `NEXT_PUBLIC_API_URL` to your Railway backend URL (e.g., `https://your-app.railway.app/api`)

2. **Update Backend CORS Settings**:
   - Add your Vercel frontend URL to `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS`

3. **Test the Connection**:
   - Try logging in to your frontend
   - Upload a test document
   - Verify API calls work correctly

## 🔒 Security Checklist

### Backend Security
- [ ] Set `DEBUG = False` in production
- [ ] Use strong `SECRET_KEY`
- [ ] Configure proper `ALLOWED_HOSTS`
- [ ] Set up HTTPS (Railway provides this automatically)
- [ ] Configure CORS properly
- [ ] Store sensitive data in environment variables

### Frontend Security
- [ ] Don't expose sensitive API keys in frontend code
- [ ] Use HTTPS (Vercel provides this automatically)
- [ ] Configure proper environment variables

## 📚 Alternative Backend Deployment Options

### Heroku
Similar to Railway, but with these files:
- `backend/Procfile`: `web: gunicorn smartdocs.wsgi`
- `backend/runtime.txt`: `python-3.9.18`

### DigitalOcean App Platform
- Configure via `backend/.do/app.yaml`
- Similar environment variable setup

### AWS Elastic Beanstalk
- Package your Django app as ZIP
- Configure via `.ebextensions/`

## 🛠️ Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Check `CORS_ALLOWED_ORIGINS` in Django settings
   - Ensure frontend URL is added to `CSRF_TRUSTED_ORIGINS`

2. **Environment Variable Issues**:
   - Verify all required environment variables are set
   - Check for typos in variable names

3. **Database Issues**:
   - Run migrations after deployment
   - Check database connection string

4. **Build Failures**:
   - Check build logs in deployment platform
   - Verify all dependencies are in requirements.txt
   - Ensure Python version compatibility

### Getting Help

- Check Railway/Vercel logs for detailed error messages
- Test API endpoints directly using tools like Postman
- Verify environment variables are correctly set

## 🎉 Success!

Once deployed:
1. Your frontend will be available at `https://your-project.vercel.app`
2. Your backend API will be available at `https://your-app.railway.app`
3. Users can create accounts, upload documents, and chat with them using AI!

Remember to:
- Monitor your usage and costs
- Set up monitoring and alerting
- Regularly backup your database
- Keep dependencies updated 