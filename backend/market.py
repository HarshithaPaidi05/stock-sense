import pandas as pd
from typing import List, Dict, Optional


def load_market(csv_path: str = '../data/stocks.csv') -> List[Dict]:
    """Load market data from CSV and return as list of dictionaries with numeric fields converted to floats."""
    df = pd.read_csv(csv_path)
    
    # Convert numeric columns to float
    numeric_columns = ['price', 'change_1d_pct', 'change_7d_pct', 'volatility', 'market_cap_cr']
    for col in numeric_columns:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
    
    return df.to_dict('records')


def get_stock_by_symbol(symbol: str, market_list: List[Dict]) -> Optional[Dict]:
    """Find and return stock data by symbol, or None if not found."""
    for stock in market_list:
        if stock.get('symbol') == symbol:
            return stock
    return None
