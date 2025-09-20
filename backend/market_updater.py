import asyncio
import logging
from typing import List, Dict
import os
from market import load_market as load_market_original


# ------------------------------
# Configure logging
logger = logging.getLogger(__name__)

# Global variable to store the latest market data
_market_data: List[Dict] = []
_market_data_lock = asyncio.Lock()

# ------------------------------
# Determine the path to stocks.csv dynamically
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # directory of this file
DATA_FILE = os.path.join(BASE_DIR, "data", "stocks.csv")  # assumes backend/data/stocks.csv

# ------------------------------
# Wrapper to load market using absolute path
def load_market() -> List[Dict]:
    if not os.path.exists(DATA_FILE):
        raise FileNotFoundError(f"Market data CSV not found at {DATA_FILE}")
    return load_market_original(DATA_FILE)  # pass the absolute path to your original load_market function

# ------------------------------
# Async functions
async def get_market_data() -> List[Dict]:
    """Get the current in-memory market data."""
    async with _market_data_lock:
        return _market_data.copy()


async def refresh_market_data() -> None:
    """Refresh market data from CSV file."""
    global _market_data
    try:
        new_data = load_market()
        async with _market_data_lock:
            _market_data = new_data
        logger.info(f"Market data refreshed: {len(new_data)} stocks loaded")
    except Exception as e:
        logger.error(f"Failed to refresh market data: {e}")


async def market_updater_task() -> None:
    """Background task that refreshes market data every 30 seconds."""
    logger.info("Market updater task started")
    
    # Initial load
    await refresh_market_data()
    
    # Periodic refresh every 30 seconds
    while True:
        try:
            await asyncio.sleep(30)
            await refresh_market_data()
        except Exception as e:
            logger.error(f"Error in market updater task: {e}")
            await asyncio.sleep(30)


def start_market_updater() -> None:
    """Start the market updater background task."""
    asyncio.create_task(market_updater_task())
