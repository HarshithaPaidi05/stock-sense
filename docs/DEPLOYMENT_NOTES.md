# Production Deployment Notes

This document outlines the steps to migrate the Stock Consultant Agent from a development prototype to a production-ready system.

## 🎯 Production Migration Overview

The current system uses mock implementations that need to be replaced with production services:

| Component | Current (Dev) | Production Target |
|-----------|---------------|-------------------|
| **Data Source** | CSV file | Pathway streaming pipeline |
| **Storage** | JSON files | PostgreSQL database |
| **Billing** | FlexpriceMock | Real Flexprice SDK |
| **Auth** | None | JWT + user management |
| **Deployment** | Local dev servers | Docker + cloud hosting |

---

## 📊 1. Replace CSV with Pathway Pipeline

### Current Implementation
```python
# backend/market.py
def load_market(csv_path='../data/stocks.csv'):
    df = pd.read_csv(csv_path)
    return df.to_dict('records')
```

### Production Migration Steps

#### 1.1 Install Pathway SDK
```bash
pip install pathway
```

#### 1.2 Create Pathway Data Pipeline
```python
# backend/pathway_pipeline.py
import pathway as pw
from pathway.stdlib.ml import preprocessing

# Define input schema
class StockSchema(pw.Schema):
    symbol: str
    name: str
    sector: str
    price: float
    change_1d_pct: float
    change_7d_pct: float
    volatility: float
    market_cap_cr: float

# Connect to real data sources
stock_data = pw.io.kafka.read(
    rdkafka_settings={
        "bootstrap.servers": "your-kafka-broker:9092",
        "group.id": "stock-consultant",
        "auto.offset.reset": "latest",
    },
    topic="stock-market-data",
    schema=StockSchema,
    format="json"
)

# Alternative: Connect to database
# stock_data = pw.io.postgres.read(
#     host="your-db-host",
#     port=5432,
#     dbname="market_data",
#     user="readonly_user",
#     password="password",
#     table_name="stock_prices",
#     schema=StockSchema
# )

# Apply real-time transformations
processed_data = stock_data.select(
    symbol=pw.this.symbol,
    name=pw.this.name,
    sector=pw.this.sector,
    price=pw.this.price,
    change_1d_pct=pw.this.change_1d_pct,
    change_7d_pct=pw.this.change_7d_pct,
    volatility=pw.this.volatility,
    market_cap_cr=pw.this.market_cap_cr,
    last_updated=pw.now()
)

# Output to cache/storage
pw.io.jsonlines.write(processed_data, "./data/live_stocks.jsonl")

# Create API endpoint for latest data
@pw.udf
def get_latest_stocks():
    return processed_data.to_dict()
```

#### 1.3 Update Market Module
```python
# backend/market.py (production version)
import pathway as pw
from pathway_pipeline import get_latest_stocks

def load_market():
    """Load market data from Pathway pipeline."""
    return get_latest_stocks()

# Keep CSV fallback for development
def load_market_csv(csv_path='../data/stocks.csv'):
    """Fallback CSV loader for development."""
    df = pd.read_csv(csv_path)
    return df.to_dict('records')
```

#### 1.4 Data Source Configuration
```yaml
# config/data_sources.yaml
pathway:
  enabled: true
  sources:
    - type: kafka
      topic: stock-market-data
      bootstrap_servers: your-kafka-cluster:9092
    - type: postgres
      host: your-db-host
      database: market_data
      table: stock_prices
  refresh_interval: 1  # seconds
  
fallback:
  enabled: true
  csv_path: ./data/stocks.csv
```

---

## 🗃️ 2. Migrate Storage to PostgreSQL

### Current Implementation
```python
# backend/usage_store.py
def record_portfolio_analysis(advice_count):
    usage_data = _load_usage()  # From JSON file
    usage_data['portfolios_analyzed_total'] += 1
    _save_usage(usage_data)     # To JSON file
```

### Production Migration Steps

#### 2.1 Database Schema Design
```sql
-- migrations/001_initial_schema.sql

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    subscription_tier VARCHAR(50) DEFAULT 'basic',
    api_key_hash VARCHAR(255)
);

-- Portfolio analyses table
CREATE TABLE portfolio_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    portfolio_data JSONB NOT NULL,
    advice_count INTEGER NOT NULL,
    portfolio_value DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT NOW(),
    billing_session_id VARCHAR(255)
);

-- Usage tracking table
CREATE TABLE usage_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    event_type VARCHAR(50) NOT NULL, -- 'portfolio_analysis', 'advice_generation'
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB
);

-- Billing records table
CREATE TABLE billing_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    flexprice_transaction_id VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB
);

-- Indexes for performance
CREATE INDEX idx_portfolio_analyses_user_id ON portfolio_analyses(user_id);
CREATE INDEX idx_portfolio_analyses_created_at ON portfolio_analyses(created_at);
CREATE INDEX idx_usage_events_user_id_type ON usage_events(user_id, event_type);
CREATE INDEX idx_billing_records_user_id ON billing_records(user_id);
```

#### 2.2 Database Configuration
```python
# backend/database.py
import asyncpg
import os
from contextlib import asynccontextmanager

class DatabaseManager:
    def __init__(self):
        self.pool = None
    
    async def initialize(self):
        self.pool = await asyncpg.create_pool(
            host=os.getenv('DB_HOST', 'localhost'),
            port=os.getenv('DB_PORT', 5432),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME', 'stock_consultant'),
            min_size=5,
            max_size=20
        )
    
    @asynccontextmanager
    async def get_connection(self):
        async with self.pool.acquire() as connection:
            yield connection

db = DatabaseManager()
```

#### 2.3 Updated Usage Store
```python
# backend/usage_store.py (production version)
from database import db
from datetime import datetime
import uuid

async def record_portfolio_analysis(user_id: str, portfolio_data: dict, advice_count: int, portfolio_value: float):
    """Record portfolio analysis in PostgreSQL."""
    async with db.get_connection() as conn:
        # Insert portfolio analysis
        analysis_id = await conn.fetchval("""
            INSERT INTO portfolio_analyses (user_id, portfolio_data, advice_count, portfolio_value)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        """, uuid.UUID(user_id), portfolio_data, advice_count, portfolio_value)
        
        # Record usage events
        await conn.execute("""
            INSERT INTO usage_events (user_id, event_type, quantity, metadata)
            VALUES ($1, 'portfolio_analysis', 1, $2),
                   ($1, 'advice_generation', $3, $4)
        """, uuid.UUID(user_id), {'analysis_id': str(analysis_id)}, advice_count, {'analysis_id': str(analysis_id)})
        
        return analysis_id

async def get_usage_summary(user_id: str = None):
    """Get usage summary from PostgreSQL."""
    async with db.get_connection() as conn:
        if user_id:
            # Per-user usage
            return await conn.fetchrow("""
                SELECT 
                    COUNT(*) FILTER (WHERE event_type = 'portfolio_analysis') as portfolios_analyzed_total,
                    COALESCE(SUM(quantity) FILTER (WHERE event_type = 'advice_generation'), 0) as advice_generated_total
                FROM usage_events 
                WHERE user_id = $1
            """, uuid.UUID(user_id))
        else:
            # Global usage
            return await conn.fetchrow("""
                SELECT 
                    COUNT(*) FILTER (WHERE event_type = 'portfolio_analysis') as portfolios_analyzed_total,
                    COALESCE(SUM(quantity) FILTER (WHERE event_type = 'advice_generation'), 0) as advice_generated_total
                FROM usage_events
            """)
```

#### 2.4 Migration Script
```python
# scripts/migrate_json_to_postgres.py
import json
import asyncio
import asyncpg
from datetime import datetime

async def migrate_usage_data():
    """Migrate existing JSON data to PostgreSQL."""
    
    # Load existing JSON data
    with open('backend/usage.json', 'r') as f:
        json_data = json.load(f)
    
    # Connect to database
    conn = await asyncpg.connect('postgresql://user:pass@localhost/stock_consultant')
    
    try:
        # Create a migration user for existing data
        user_id = await conn.fetchval("""
            INSERT INTO users (email) 
            VALUES ('migration@legacy.data') 
            RETURNING id
        """)
        
        # Migrate portfolio analyses (estimated from totals)
        portfolios_count = json_data.get('portfolios_analyzed_total', 0)
        advice_count = json_data.get('advice_generated_total', 0)
        
        for i in range(portfolios_count):
            await conn.execute("""
                INSERT INTO usage_events (user_id, event_type, created_at)
                VALUES ($1, 'portfolio_analysis', $2)
            """, user_id, datetime.now())
        
        # Migrate advice events
        if portfolios_count > 0:
            avg_advice_per_portfolio = advice_count // portfolios_count
            for i in range(portfolios_count):
                await conn.execute("""
                    INSERT INTO usage_events (user_id, event_type, quantity, created_at)
                    VALUES ($1, 'advice_generation', $2, $3)
                """, user_id, avg_advice_per_portfolio, datetime.now())
        
        print(f"Migrated {portfolios_count} portfolio analyses and {advice_count} advice events")
        
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(migrate_usage_data())
```

---

## 💳 3. Integrate Real Flexprice SDK

### Current Implementation
```python
# backend/flexprice_mock.py
class FlexpriceMock:
    def process_full_analysis_billing(self, advice_count):
        # Mock billing logic
        return {'session_id': 'mock_session', 'amount': 13.0}
```

### Production Migration Steps

#### 3.1 Install Flexprice SDK
```bash
pip install flexprice
```

#### 3.2 Real Flexprice Integration
```python
# backend/billing.py
import os
from flexprice import FlexpriceClient
from decimal import Decimal

class ProductionBilling:
    def __init__(self):
        self.client = FlexpriceClient(
            api_key=os.getenv('FLEXPRICE_API_KEY'),
            environment=os.getenv('FLEXPRICE_ENV', 'production')  # or 'sandbox'
        )
        
        # Define pricing model
        self.pricing_model = self.client.get_pricing_model('stock_consultant_v1')
    
    async def process_analysis_billing(self, user_id: str, advice_count: int):
        """Process billing for portfolio analysis."""
        try:
            # Record usage with Flexprice
            usage_record = await self.client.record_usage(
                customer_id=user_id,
                pricing_model_id=self.pricing_model.id,
                usage_events=[
                    {
                        'feature': 'portfolio_analysis',
                        'quantity': 1,
                        'timestamp': datetime.now().isoformat()
                    },
                    {
                        'feature': 'advice_generation', 
                        'quantity': advice_count,
                        'timestamp': datetime.now().isoformat()
                    }
                ]
            )
            
            # Get immediate billing calculation
            billing_preview = await self.client.preview_bill(
                customer_id=user_id,
                usage_record_id=usage_record.id
            )
            
            return {
                'usage_record_id': usage_record.id,
                'total_amount': billing_preview.total_amount,
                'currency': billing_preview.currency,
                'breakdown': billing_preview.line_items,
                'billing_date': billing_preview.billing_date
            }
            
        except Exception as e:
            logger.error(f"Flexprice billing error: {e}")
            # Fallback to mock billing for reliability
            return self._fallback_billing(advice_count)
    
    def _fallback_billing(self, advice_count: int):
        """Fallback billing calculation."""
        portfolio_fee = Decimal('5.00')
        advice_fee = Decimal('2.00') * advice_count
        return {
            'total_amount': portfolio_fee + advice_fee,
            'currency': 'INR',
            'status': 'fallback_calculation'
        }
```

#### 3.3 Flexprice Configuration
```yaml
# config/flexprice.yaml
flexprice:
  api_key: ${FLEXPRICE_API_KEY}
  environment: production  # or sandbox
  pricing_model: stock_consultant_v1
  
  # Pricing components
  features:
    portfolio_analysis:
      type: fixed
      price: 5.00
      currency: INR
    advice_generation:
      type: per_unit
      price: 2.00
      currency: INR
  
  # Billing configuration
  billing:
    cycle: monthly
    grace_period_days: 3
    late_fee_percentage: 2.5
```

#### 3.4 Usage Data to Pass to Flexprice
```python
# Information to track for Flexprice billing
usage_data = {
    'customer_id': user_id,  # Your internal user ID
    'features': {
        'portfolio_analysis': 1,  # Always 1 per analysis
        'advice_generation': advice_count,  # Variable count
    },
    'metadata': {
        'portfolio_value': portfolio_value,
        'sectors_analyzed': len(unique_sectors),
        'analysis_timestamp': datetime.now().isoformat(),
        'api_version': 'v1'
    }
}
```

---

## 🔐 4. Add Authentication & User Management

### Current State
- No authentication
- No user tracking
- Global usage statistics

### Production Requirements

#### 4.1 Authentication Setup
```python
# backend/auth.py
import jwt
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer
import bcrypt

security = HTTPBearer()

class AuthManager:
    def __init__(self):
        self.secret_key = os.getenv('JWT_SECRET_KEY')
        self.algorithm = 'HS256'
    
    def create_access_token(self, user_id: str, email: str):
        payload = {
            'user_id': user_id,
            'email': email,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    def verify_token(self, token: str):
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(token: str = Depends(security)):
    """Dependency to get current authenticated user."""
    auth = AuthManager()
    payload = auth.verify_token(token.credentials)
    return payload['user_id']
```

#### 4.2 Updated API Endpoints
```python
# backend/main.py (with authentication)
from auth import get_current_user

@app.post("/api/analyze")
async def analyze_portfolio(
    request: PortfolioRequest, 
    current_user: str = Depends(get_current_user)
):
    """Analyze portfolio with user authentication."""
    # ... existing logic ...
    
    # Record usage per user
    await usage_store.record_portfolio_analysis(
        user_id=current_user,
        portfolio_data=request.portfolio,
        advice_count=advice_count,
        portfolio_value=analysis_result['portfolio_value']
    )
    
    # Process billing per user
    billing = await billing_service.process_analysis_billing(
        user_id=current_user,
        advice_count=advice_count
    )
```

#### 4.3 User Registration & API Keys
```python
# backend/users.py
@app.post("/api/auth/register")
async def register_user(email: str, password: str):
    """Register new user."""
    # Hash password
    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    
    # Create user
    user_id = await db.create_user(email, password_hash)
    
    # Generate API key
    api_key = generate_api_key()
    await db.store_api_key(user_id, api_key)
    
    return {'user_id': user_id, 'api_key': api_key}

@app.post("/api/auth/login")
async def login(email: str, password: str):
    """User login."""
    user = await db.get_user_by_email(email)
    if bcrypt.checkpw(password.encode(), user.password_hash):
        token = auth.create_access_token(user.id, user.email)
        return {'access_token': token, 'token_type': 'bearer'}
    raise HTTPException(status_code=401, detail="Invalid credentials")
```

---

## 🚀 5. Deployment Configuration

### 5.1 Docker Configuration
```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN pip install -r requirements.txt

# Copy application
COPY backend/ ./backend/
COPY data/ ./data/

# Environment configuration
ENV PYTHONPATH=/app/backend
ENV DB_HOST=postgres
ENV REDIS_HOST=redis

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DB_HOST=postgres
      - FLEXPRICE_API_KEY=${FLEXPRICE_API_KEY}
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
    depends_on:
      - postgres
      - redis
  
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: stock_consultant
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./migrations:/docker-entrypoint-initdb.d
  
  redis:
    image: redis:7-alpine
    
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:8000

volumes:
  postgres_data:
```

### 5.2 Environment Variables
```bash
# .env.production
DB_HOST=your-postgres-host
DB_PASSWORD=secure-password
JWT_SECRET_KEY=your-jwt-secret
FLEXPRICE_API_KEY=flx_your_api_key
PATHWAY_KAFKA_SERVERS=your-kafka-cluster
```

### 5.3 Cloud Deployment (AWS Example)
```yaml
# aws/infrastructure.yml
Resources:
  ECSCluster:
    Type: AWS::ECS::Cluster
    
  TaskDefinition:
    Type: AWS::ECS::TaskDefinition
    Properties:
      ContainerDefinitions:
        - Name: stock-consultant-api
          Image: your-account.dkr.ecr.region.amazonaws.com/stock-consultant:latest
          Environment:
            - Name: DB_HOST
              Value: !GetAtt RDSInstance.Endpoint.Address
            - Name: FLEXPRICE_API_KEY
              ValueFrom: !Ref FlexpriceSecret
              
  RDSInstance:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceClass: db.t3.micro
      Engine: postgres
      
  LoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
```

---

## 📋 Production Checklist

### Before Launch:
- [ ] Set up PostgreSQL database with proper schemas
- [ ] Configure Pathway data pipeline with real sources
- [ ] Integrate production Flexprice billing
- [ ] Implement user authentication and API keys
- [ ] Set up monitoring and logging (Prometheus, Grafana)
- [ ] Configure SSL certificates
- [ ] Set up backup and disaster recovery
- [ ] Load testing and performance optimization
- [ ] Security audit and penetration testing
- [ ] Documentation and API docs update

### Monitoring & Maintenance:
- [ ] Set up health checks for all services
- [ ] Monitor Pathway data pipeline health
- [ ] Track Flexprice billing reconciliation
- [ ] Monitor database performance
- [ ] Set up alerts for system issues
- [ ] Regular security updates
- [ ] Performance metrics and optimization

---

## 📞 Support Contacts

- **Pathway Integration**: [Pathway Support](https://pathway.com/support)
- **Flexprice Billing**: [Flexprice Docs](https://flexprice.dev/docs)
- **Database Issues**: Your DBA team
- **Deployment**: DevOps/Infrastructure team

---

This deployment guide provides a roadmap from prototype to production. Each section can be implemented incrementally to minimize risk and ensure system stability.
