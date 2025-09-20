# 🚀 Quick Deploy Guide - Stock Consultant

## Your Project is Ready to Deploy! 

I've set up everything you need to deploy your Stock Consultant application. Here are your options:

## 🎯 Option 1: Quick Deploy (Easiest - Recommended)

### Deploy Backend to Railway (Free)

1. **Go to [railway.app](https://railway.app)**
2. **Sign up with GitHub**
3. **Click "New Project" → "Deploy from GitHub repo"**
4. **Select your repository**
5. **Railway will automatically detect it's a Python app**
6. **Add environment variables:**
   - `PYTHONPATH` = `/app`
   - `PYTHONUNBUFFERED` = `1`
7. **Deploy!** Railway will give you a URL like: `https://your-app-name.railway.app`

### Deploy Frontend to Vercel (Free)

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up with GitHub**
3. **Click "New Project" → "Import Git Repository"**
4. **Select your repository**
5. **Set build settings:**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. **Add environment variable:**
   - `VITE_API_URL` = your Railway backend URL
7. **Deploy!** Vercel will give you a URL like: `https://your-app.vercel.app`

## 🐳 Option 2: Docker Deploy (Local/Server)

### Using PowerShell (Windows)

```powershell
# Navigate to your project
cd "c:\Users\DELL\OneDrive\Documents\Desktop\stock c"

# Set up development environment
.\deploy.ps1 dev

# Deploy with Docker
.\deploy.ps1 docker

# Test deployment
.\deploy.ps1 test
```

### Using Command Line

```bash
# Make script executable (if on Linux/Mac)
chmod +x deploy.sh

# Deploy
./deploy.sh docker
```

## 🔧 Option 3: Manual Deploy

### Backend (Python/FastAPI)

```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Run the server
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend (React/Vite)

```bash
# Install dependencies
cd frontend
npm install

# Build for production
npm run build

# Serve the built files (you can use any static file server)
# For example, with Python:
cd dist
python -m http.server 3000
```

## ✅ What I've Set Up For You

1. **Docker Configuration**
   - `Dockerfile` - Multi-stage build for production
   - `docker-compose.yml` - Complete stack deployment
   - `frontend/Dockerfile` - Frontend-only deployment

2. **Deployment Scripts**
   - `deploy.ps1` - Windows PowerShell script
   - `deploy.sh` - Linux/Mac bash script

3. **Cloud Platform Configs**
   - `vercel.json` - Vercel deployment config
   - `railway.json` - Railway deployment config

4. **Environment Configuration**
   - `.env.example` - Environment variables template
   - Health check endpoint at `/health`

5. **Documentation**
   - `DEPLOYMENT_GUIDE.md` - Comprehensive deployment guide
   - `QUICK_DEPLOY.md` - This quick start guide

## 🧪 Test Your Deployment

Once deployed, test these endpoints:

1. **Health Check:** `GET /health`
2. **API Test:** `POST /api/analyze` with sample portfolio
3. **Frontend:** Open your frontend URL in browser

## 🆘 Need Help?

### Common Issues:

1. **CORS Errors:** Update CORS origins in `backend/main.py`
2. **Build Failures:** Check Node.js and Python versions
3. **Docker Issues:** Make sure Docker Desktop is running

### Quick Fixes:

```powershell
# Check if everything is working
.\deploy.ps1 test

# Clean up and restart
.\deploy.ps1 cleanup
.\deploy.ps1 docker
```

## 🎉 You're Ready!

Your Stock Consultant application is now ready for deployment. Choose the option that works best for you:

- **Beginners:** Use Option 1 (Railway + Vercel)
- **Developers:** Use Option 2 (Docker)
- **Advanced:** Use Option 3 (Manual)

**Happy Deploying! 🚀**

---

**Next Steps After Deployment:**
1. Set up a custom domain
2. Configure SSL certificates
3. Set up monitoring
4. Add user authentication
5. Scale as needed
