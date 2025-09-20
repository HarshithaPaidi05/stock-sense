import json
import os
from typing import Dict


USAGE_FILE = 'usage.json'


def _load_usage() -> Dict:
    """Load usage data from JSON file."""
    if os.path.exists(USAGE_FILE):
        try:
            with open(USAGE_FILE, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            pass
    
    # Return default structure
    return {
        'portfolios_analyzed_total': 0,
        'advice_generated_total': 0
    }


def _save_usage(usage_data: Dict) -> None:
    """Save usage data to JSON file."""
    with open(USAGE_FILE, 'w') as f:
        json.dump(usage_data, f, indent=2)


def record_portfolio_analysis(advice_count: int) -> None:
    """Record a portfolio analysis and the number of advice items generated."""
    usage_data = _load_usage()
    usage_data['portfolios_analyzed_total'] += 1
    usage_data['advice_generated_total'] += advice_count
    _save_usage(usage_data)


def get_usage_summary() -> Dict:
    """Get current usage summary."""
    return _load_usage()
