# 🧠 Stock Sense - AI-Powered Investment Advisor

A modern, intelligent stock portfolio analysis tool that provides personalized investment advice using AI and real-time market data.

![Stock Sense](https://img.shields.io/badge/Stock-Sense-blue?style=for-the-badge&logo=chart-line)
![React](https://img.shields.io/badge/React-18.2.0-blue?style=flat&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.116.2-green?style=flat&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.11+-yellow?style=flat&logo=python)

## ✨ Features

- 🎯 **Portfolio Analysis**: Get detailed analysis of your stock portfolio
- 💡 **AI-Powered Advice**: Receive personalized investment recommendations
- 📊 **Real-time Data**: Access live market data and trends
- 💰 **Billing Integration**: Transparent pricing with Flexprice integration
- 📱 **Responsive Design**: Beautiful, mobile-friendly interface
- 🚀 **Fast Performance**: Optimized for speed and reliability

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Data Sources  │
│   (React/Vite)  │◄──►│   (FastAPI)     │◄──►│   (CSV/Pathway) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │   Railway       │    │   Market Data   │
│   (Hosting)     │    │   (API Host)    │    │   (Real-time)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Python 3.11+
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/stock-sense.git
   cd stock-sense
   ```

2. **Set up development environment**
   ```bash
   # Windows
   .\deploy.bat dev
   
   # Linux/Mac
   ./deploy.sh dev
   ```

3. **Start the development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   uvicorn main:app --reload --port 8000
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

4. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## 🐳 Docker Deployment

### Quick Deploy with Docker

```bash
# Build and run with Docker
.\deploy.bat docker

# Or use Docker Compose
.\deploy.bat compose
```

### Manual Docker Commands

```bash
# Build the image
docker build -t stock-sense .

# Run the container
docker run -d --name stock-sense-app -p 8000:8000 stock-sense

# Access the application
open http://localhost:8000
```

## ☁️ Cloud Deployment

### Option 1: Vercel + Railway (Recommended)

1. **Deploy Backend to Railway**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Deploy automatically

2. **Deploy Frontend to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub repository
   - Set environment variable: `VITE_API_URL` = your Railway URL
   - Deploy!

### Option 2: Docker Cloud Deployment

Deploy to any cloud provider that supports Docker:
- DigitalOcean App Platform
- AWS ECS
- Google Cloud Run
- Azure Container Instances

## 📁 Project Structure

```
stock-sense/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.jsx         # Main application component
│   │   └── main.jsx        # Application entry point
│   ├── public/             # Static assets
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
├── backend/                 # FastAPI backend application
│   ├── main.py             # FastAPI application
│   ├── advisor.py          # AI advisor logic
│   ├── market.py           # Market data handling
│   ├── usage_store.py      # Usage tracking
│   └── requirements.txt    # Python dependencies
├── data/                   # Market data files
│   └── stocks.csv          # Sample stock data
├── docs/                   # Documentation
│   ├── DEPLOYMENT_GUIDE.md # Comprehensive deployment guide
│   └── EXAMPLES.md         # Usage examples
├── tests/                  # Test files
├── deploy.bat             # Windows deployment script
├── deploy.sh              # Linux/Mac deployment script
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile             # Docker configuration
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
VITE_API_URL=http://localhost:8000

# Security
JWT_SECRET_KEY=your_jwt_secret_key_here

# External Services
FLEXPRICE_API_KEY=your_flexprice_api_key_here
PATHWAY_KAFKA_SERVERS=your_kafka_servers_here
```

### CORS Configuration

Update CORS settings in `backend/main.py` for production:

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

## 🧪 Testing

### Run Tests

```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd frontend
npm test

# Test deployment
.\deploy.bat test
```

### API Testing

```bash
# Health check
curl http://localhost:8000/health

# Portfolio analysis
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"portfolio": [{"symbol": "AAPL", "shares": 10}]}'
```

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/market` | GET | Get market data |
| `/api/analyze` | POST | Analyze portfolio |
| `/api/usage` | GET | Get usage statistics |
| `/api/integrations/status` | GET | Check service status |

## 🛠️ Development

### Adding New Features

1. **Frontend**: Add components in `frontend/src/components/`
2. **Backend**: Add endpoints in `backend/main.py`
3. **Styling**: Update styles in component files
4. **Data**: Add new data sources in `backend/market.py`

### Code Style

- **Frontend**: ESLint + Prettier
- **Backend**: Black + isort
- **Commits**: Conventional Commits

## 🚀 Performance

- **Frontend**: Vite for fast builds and HMR
- **Backend**: FastAPI for high performance
- **Caching**: In-memory market data cache
- **Optimization**: Gzip compression, static asset caching

## 🔒 Security

- CORS configuration
- Input validation
- Environment variable protection
- Rate limiting (planned)

## 📈 Monitoring

- Health check endpoint: `/health`
- Usage tracking
- Error logging
- Performance metrics (planned)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Modern, fast web framework
- [React](https://reactjs.org/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [Pathway](https://pathway.com/) - Real-time data processing
- [Flexprice](https://flexprice.dev/) - Billing integration

## 📞 Support

- 📧 Email: your-email@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/stock-sense/issues)
- 📖 Documentation: [Wiki](https://github.com/yourusername/stock-sense/wiki)

## 🎯 Roadmap

- [ ] User authentication
- [ ] Real-time data feeds
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Portfolio tracking
- [ ] Social features

---

**Made with ❤️ for smart investors**

⭐ Star this repository if you find it helpful!