# 🚀 Stock Consultant Deployment Guide

This guide will help you deploy your Stock Consultant application to various platforms.

## 📋 Prerequisites

Before deploying, ensure you have:

- [ ] Node.js 18+ installed
- [ ] Python 3.11+ installed
- [ ] Git installed
- [ ] Docker installed (for containerized deployment)
- [ ] A cloud platform account (Vercel, Railway, Heroku, etc.)

## 🎯 Deployment Options

### Option 1: Quick Deploy (Recommended for beginners)

**Frontend**: Vercel (Free)
**Backend**: Railway (Free tier available)

#### Step 1: Deploy Backend to Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy Backend**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Deploy backend
   cd backend
   railway init
   railway up
   ```

3. **Get Backend URL**
   - Railway will provide a URL like: `https://your-app-name.railway.app`
   - Note this URL for frontend configuration

#### Step 2: Deploy Frontend to Vercel

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Deploy Frontend**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy frontend
   cd frontend
   vercel
   ```

3. **Configure Environment Variables**
   - In Vercel dashboard, go to your project settings
   - Add environment variable: `VITE_API_URL` = your Railway backend URL

### Option 2: Docker Deployment

#### Local Docker Deployment

```bash
# Make the deployment script executable
chmod +x deploy.sh

# Deploy with Docker Compose
./deploy.sh compose
```

#### Cloud Docker Deployment (DigitalOcean, AWS, etc.)

1. **Prepare your server**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Deploy your application**
   ```bash
   # Clone your repository
   git clone <your-repo-url>
   cd stock-consultant
   
   # Deploy
   ./deploy.sh compose
   ```

### Option 3: Manual Server Deployment

#### Step 1: Prepare Server

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python
sudo apt-get install -y python3.11 python3.11-pip python3.11-venv

# Install Nginx
sudo apt-get install -y nginx
```

#### Step 2: Deploy Backend

```bash
# Create virtual environment
cd backend
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create systemd service
sudo nano /etc/systemd/system/stock-consultant.service
```

Add this content to the service file:
```ini
[Unit]
Description=Stock Consultant API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/your/backend
Environment=PATH=/path/to/your/backend/venv/bin
ExecStart=/path/to/your/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable stock-consultant
sudo systemctl start stock-consultant
```

#### Step 3: Deploy Frontend

```bash
# Build frontend
cd frontend
npm install
npm run build

# Copy to Nginx
sudo cp -r dist/* /var/www/html/
```

#### Step 4: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/stock-consultant
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/stock-consultant /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in your project root:

```bash
# Copy the example file
cp .env.example .env

# Edit with your values
nano .env
```

Required variables:
- `VITE_API_URL`: Your backend API URL
- `JWT_SECRET_KEY`: Secret key for JWT tokens
- `DB_PASSWORD`: Database password (if using database)

### CORS Configuration

Update the CORS settings in `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-frontend-domain.com",
        "https://your-vercel-app.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🚀 Quick Start Commands

```bash
# Development setup
./deploy.sh dev

# Production build
./deploy.sh build

# Docker deployment
./deploy.sh docker

# Docker Compose deployment
./deploy.sh compose

# Cleanup
./deploy.sh cleanup
```

## 🔍 Testing Your Deployment

1. **Health Check**
   ```bash
   curl http://your-backend-url/health
   ```

2. **API Test**
   ```bash
   curl -X POST http://your-backend-url/api/analyze \
     -H "Content-Type: application/json" \
     -d '{"portfolio": [{"symbol": "AAPL", "shares": 10}]}'
   ```

3. **Frontend Test**
   - Open your frontend URL in a browser
   - Try analyzing a sample portfolio

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Update CORS origins in `backend/main.py`
   - Ensure frontend URL is included

2. **API Connection Issues**
   - Check if backend is running: `curl http://localhost:8000/health`
   - Verify environment variables are set correctly

3. **Build Failures**
   - Check Node.js and Python versions
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`

4. **Docker Issues**
   - Check Docker is running: `docker ps`
   - View logs: `docker logs stock-consultant-app`

### Logs and Monitoring

```bash
# View backend logs
docker logs stock-consultant-app

# View Docker Compose logs
docker-compose logs -f

# View systemd logs
sudo journalctl -u stock-consultant -f
```

## 📊 Performance Optimization

1. **Enable Gzip Compression**
   ```nginx
   gzip on;
   gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
   ```

2. **Set Cache Headers**
   ```nginx
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

3. **Database Optimization**
   - Use connection pooling
   - Add database indexes
   - Monitor query performance

## 🔒 Security Considerations

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong, unique secrets
   - Rotate secrets regularly

2. **HTTPS**
   - Use SSL certificates (Let's Encrypt)
   - Redirect HTTP to HTTPS

3. **API Security**
   - Implement rate limiting
   - Add authentication if needed
   - Validate all inputs

## 📈 Scaling

### Horizontal Scaling

1. **Load Balancer**
   - Use Nginx or cloud load balancer
   - Distribute traffic across multiple backend instances

2. **Database Scaling**
   - Use read replicas
   - Implement connection pooling

3. **Caching**
   - Add Redis for session storage
   - Cache API responses

### Vertical Scaling

1. **Increase Resources**
   - More CPU/RAM for backend
   - Larger database instance

2. **Optimize Code**
   - Profile and optimize slow queries
   - Implement async processing

## 🆘 Support

If you encounter issues:

1. Check the logs first
2. Verify all environment variables
3. Test each component individually
4. Check the troubleshooting section above

## 📝 Next Steps

After successful deployment:

1. Set up monitoring (Prometheus, Grafana)
2. Configure backups
3. Set up CI/CD pipeline
4. Add user authentication
5. Implement real-time data feeds
6. Add more advanced features

---

**Happy Deploying! 🚀**

Your Stock Consultant application should now be live and accessible to users worldwide!
