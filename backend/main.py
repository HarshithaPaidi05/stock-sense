# Run instructions:
# python -m venv .venv ; source .venv/bin/activate ; pip install -r requirements.txt ; uvicorn main:app --reload --port 8000

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import market
import advisor
import usage_store
import market_updater
import pathway_mock
import flexprice_mock
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    """Initialize background tasks on startup."""
    logger.info("Starting market updater background task...")
    market_updater.start_market_updater()

# Add CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Billing constants
PRICE_PER_ADVICE = 2
PRICE_PER_PORTFOLIO = 5


class PortfolioRequest(BaseModel):
    portfolio: List[Dict]


@app.get("/api/market")
async def get_market():
    """Get market data from in-memory cache."""
    return await market_updater.get_market_data()


@app.post("/api/analyze")
async def analyze_portfolio(request: PortfolioRequest):
    """Analyze portfolio and provide investment advice."""
    # Get latest market data from in-memory cache
    market_data = await market_updater.get_market_data()
    
    # Analyze portfolio
    analysis_result = advisor.analyze_portfolio(request.portfolio, market_data)
    
    # Record usage
    advice_count = len(analysis_result['advice'])
    usage_store.record_portfolio_analysis(advice_count)
    
    # Process billing through Flexprice Mock
    flexprice_billing = flexprice_mock.flexprice_client.process_full_analysis_billing(advice_count)
    
    # Create simplified billing response (maintaining compatibility)
    total_charged = PRICE_PER_PORTFOLIO + (advice_count * PRICE_PER_ADVICE)
    billing = {
        'charged': total_charged,
        'breakdown': {
            'portfolio_analysis': PRICE_PER_PORTFOLIO,
            'advice_items': advice_count,
            'price_per_advice': PRICE_PER_ADVICE,
            'advice_cost': advice_count * PRICE_PER_ADVICE
        },
        'flexprice_session': flexprice_billing.get('session_id'),
        'flexprice_total': flexprice_billing.get('total_amount'),
        'flexprice_status': flexprice_billing.get('status')
    }
    
    # Get usage summary
    usage_summary = usage_store.get_usage_summary()
    
    return {
        'advice': analysis_result['advice'],
        'portfolio_value': analysis_result['portfolio_value'],
        'details': analysis_result['details'],
        'billing': billing,
        'usage': usage_summary
    }


@app.get("/api/usage")
async def get_usage():
    """Get usage summary."""
    return usage_store.get_usage_summary()


@app.get("/health")
async def health_check():
    """Health check endpoint for deployment monitoring."""
    return {
        "status": "healthy",
        "service": "stock-consultant-api",
        "version": "1.0.0",
        "timestamp": usage_store.get_usage_summary()
    }


@app.get("/api/integrations/status")
async def get_integrations_status():
    """Get status of Pathway and Flexprice integrations."""
    return {
        'pathway': pathway_mock.get_pathway_status(),
        'flexprice': {
            'connected': flexprice_mock.flexprice_client.connected,
            'api_key_prefix': flexprice_mock.flexprice_client.api_key[:10],
            'pricing_config': flexprice_mock.flexprice_client.pricing_config,
            'usage_summary': flexprice_mock.flexprice_client.get_usage_summary()
        },
        'timestamp': usage_store.get_usage_summary()
    }
