from typing import List, Dict
from market import get_stock_by_symbol


def analyze_portfolio(portfolio: List[Dict], market_data: List[Dict]) -> Dict:
    """
    Analyze portfolio and provide investment advice.
    
    Args:
        portfolio: List of {"symbol": "...", "quantity": <int>}
        market_data: List of stock data dictionaries
    
    Returns:
        Dict with advice, portfolio_value, and details
    """
    advice = []
    per_stock_details = []
    total_portfolio_value = 0.0
    sectors_present = set()
    
    # Calculate portfolio value and per-stock details
    for holding in portfolio:
        symbol = holding['symbol']
        quantity = holding['quantity']
        
        stock_data = get_stock_by_symbol(symbol, market_data)
        if not stock_data:
            continue
            
        price = stock_data['price']
        stock_value = price * quantity
        total_portfolio_value += stock_value
        
        sectors_present.add(stock_data['sector'])
        
        per_stock_details.append({
            'symbol': symbol,
            'quantity': quantity,
            'price': price,
            'stock_value': stock_value,
            'sector': stock_data['sector'],
            'change_7d_pct': stock_data['change_7d_pct'],
            'volatility': stock_data['volatility']
        })
    
    # Calculate weights and generate advice
    for detail in per_stock_details:
        symbol = detail['symbol']
        weight = detail['stock_value'] / total_portfolio_value if total_portfolio_value > 0 else 0
        detail['weight'] = weight
        
        change_7d_pct = detail['change_7d_pct']
        volatility = detail['volatility']
        
        # Generate advice based on rules
        if weight > 0.5:
            advice.append({
                'symbol': symbol,
                'action': 'reduce',
                'message': 'Too concentrated — consider reducing this holding.'
            })
        
        if change_7d_pct < -5:
            advice.append({
                'symbol': symbol,
                'action': 'reduce',
                'message': 'Recent sharp drop — consider reducing or reviewing reason.'
            })
        
        if change_7d_pct > 5:
            advice.append({
                'symbol': symbol,
                'action': 'hold_or_buy',
                'message': 'Strong recent growth — consider holding or adding if underweight.'
            })
        
        if volatility > 0.04:
            # Append to existing advice or create new one
            existing_advice = next((a for a in advice if a['symbol'] == symbol), None)
            if existing_advice:
                existing_advice['message'] += ' High volatility — this is risky for beginners.'
            else:
                advice.append({
                    'symbol': symbol,
                    'action': 'caution',
                    'message': 'High volatility — this is risky for beginners.'
                })
        
        if weight < 0.05 and change_7d_pct > 2:
            advice.append({
                'symbol': symbol,
                'action': 'buy',
                'message': 'Underweight and positive momentum — consider adding a small position.'
            })
    
    # Check sector diversification
    if len(sectors_present) < 2:
        advice.append({
            'symbol': 'PORTFOLIO',
            'action': 'diversify',
            'message': 'Your portfolio lacks diversification; consider adding stocks from other sectors (e.g., Pharma or Banking).'
        })
    
    return {
        'advice': advice,
        'portfolio_value': total_portfolio_value,
        'details': {
            'per_stock': per_stock_details
        }
    }
