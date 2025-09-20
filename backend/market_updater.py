import asyncio
import logging
from typing import List, Dict
from market import load_market

# Global variable to store the latest market data
_market_data: List[Dict] = []
_market_data_lock = asyncio.Lock()

logger = logging.getLogger(__name__)


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
            # Continue running even if there's an error
            await asyncio.sleep(30)


def start_market_updater() -> None:
    """Start the market updater background task."""
    asyncio.create_task(market_updater_task())
