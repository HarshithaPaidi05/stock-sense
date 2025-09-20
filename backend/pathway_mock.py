"""
Pathway Mock Integration

This module simulates Pathway's real-time data streaming capabilities
by reading from a CSV file. In a real implementation, this would connect
to Pathway's streaming data pipeline.

Pathway Documentation: https://pathway.com/
"""

import pandas as pd
import logging
from typing import List, Dict, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class PathwayDataSource:
    """Mock Pathway data source that reads from CSV files."""
    
    def __init__(self, csv_path: str = '../data/stocks.csv'):
        self.csv_path = csv_path
        self.last_updated = None
        self._cache = None
    
    def fetch_latest_csv(self) -> List[Dict]:
        """
        Fetch latest market data from CSV source.
        
        In a real Pathway integration, this would:
        - Connect to streaming data sources (Kafka, databases, APIs)
        - Apply real-time transformations
        - Handle incremental updates
        - Provide fault tolerance and recovery
        
        Returns:
            List of stock data dictionaries
        """
        try:
            logger.info(f"[Pathway Mock] Fetching data from {self.csv_path}")
            
            # Simulate Pathway's data loading
            df = pd.read_csv(self.csv_path)
            
            # Convert numeric columns (Pathway would handle schema validation)
            numeric_columns = ['price', 'change_1d_pct', 'change_7d_pct', 'volatility', 'market_cap_cr']
            for col in numeric_columns:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors='coerce')
            
            # Convert to list of dicts (Pathway output format)
            data = df.to_dict('records')
            
            # Update metadata
            self.last_updated = datetime.now()
            self._cache = data
            
            logger.info(f"[Pathway Mock] Successfully loaded {len(data)} stocks at {self.last_updated}")
            
            return data
            
        except FileNotFoundError:
            logger.error(f"[Pathway Mock] CSV file not found: {self.csv_path}")
            return self._cache or []
        except Exception as e:
            logger.error(f"[Pathway Mock] Error loading data: {e}")
            return self._cache or []
    
    def get_data_freshness(self) -> Optional[datetime]:
        """Get timestamp of last data update."""
        return self.last_updated
    
    def is_connected(self) -> bool:
        """Check if data source is available."""
        try:
            import os
            return os.path.exists(self.csv_path)
        except:
            return False


# Global Pathway instance
pathway_source = PathwayDataSource()


def fetch_latest_csv() -> List[Dict]:
    """
    Simple function interface for fetching latest market data.
    
    This simulates the main Pathway integration point where you would:
    - Connect to live data streams
    - Apply real-time transformations
    - Get incremental updates as data changes
    
    Returns:
        List of current stock data
    """
    return pathway_source.fetch_latest_csv()


def get_pathway_status() -> Dict:
    """
    Get status information about the Pathway connection.
    
    Returns:
        Dict with connection status, last update time, and data count
    """
    return {
        'connected': pathway_source.is_connected(),
        'last_updated': pathway_source.get_data_freshness(),
        'data_source': pathway_source.csv_path,
        'cached_records': len(pathway_source._cache) if pathway_source._cache else 0
    }


# Example of how real Pathway integration might look:
"""
Real Pathway Integration Example:

import pathway as pw

# Define input data source
input_data = pw.io.csv.read(
    "./data/stocks.csv",
    schema=StockSchema,
    mode="streaming"  # Real-time updates
)

# Apply transformations
processed_data = input_data.select(
    symbol=pw.this.symbol,
    price=pw.this.price.cast(float),
    volatility=pw.this.volatility.cast(float),
    # ... other transformations
)

# Set up real-time output
pw.io.jsonlines.write(processed_data, "./output/stocks.jsonl")

# Run the pipeline
pw.run()
"""
