import pytest
import sys
import os

# Add backend directory to Python path so we can import modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from advisor import analyze_portfolio


class TestAdvisorLogic:
    """Test cases for portfolio advisor recommendation logic."""
    
    def setup_method(self):
        """Setup test data for each test."""
        # Mock market data for testing
        self.mock_market_data = [
            {
                'symbol': 'TCS',
                'name': 'Tata Consultancy Services',
                'sector': 'IT',
                'price': 3300.0,
                'change_1d_pct': 0.4,
                'change_7d_pct': 1.8,
                'volatility': 0.015,
                'market_cap_cr': 125000
            },
            {
                'symbol': 'INFY',
                'name': 'Infosys',
                'sector': 'IT',
                'price': 1700.0,
                'change_1d_pct': -0.6,
                'change_7d_pct': 2.4,
                'volatility': 0.020,
                'market_cap_cr': 76000
            },
            {
                'symbol': 'RELIANCE',
                'name': 'Reliance Industries',
                'sector': 'Energy',
                'price': 2600.0,
                'change_1d_pct': 1.2,
                'change_7d_pct': 6.0,
                'volatility': 0.035,
                'market_cap_cr': 160000
            },
            {
                'symbol': 'SUNPHARMA',
                'name': 'Sun Pharmaceutical',
                'sector': 'Pharma',
                'price': 900.0,
                'change_1d_pct': -2.5,
                'change_7d_pct': -7.0,  # Sharp drop for testing
                'volatility': 0.050,
                'market_cap_cr': 18000
            },
            {
                'symbol': 'HDFCBANK',
                'name': 'HDFC Bank',
                'sector': 'Banking',
                'price': 1500.0,
                'change_1d_pct': 0.2,
                'change_7d_pct': 3.5,  # Positive momentum for testing
                'volatility': 0.012,
                'market_cap_cr': 90000
            }
        ]

    def test_concentrated_holding_reduce_action(self):
        """Test that concentrated holdings (weight > 50%) get 'reduce' action."""
        # Portfolio with 90% concentration in TCS
        portfolio = [
            {'symbol': 'TCS', 'quantity': 30},  # 30 * 3300 = 99,000
            {'symbol': 'INFY', 'quantity': 1}   # 1 * 1700 = 1,700
        ]
        # Total value: 100,700, TCS weight: 98.3%
        
        result = analyze_portfolio(portfolio, self.mock_market_data)
        
        # Find advice for TCS
        tcs_advice = [advice for advice in result['advice'] if advice['symbol'] == 'TCS']
        
        assert len(tcs_advice) > 0, "Should have advice for TCS"
        reduce_advice = [advice for advice in tcs_advice if advice['action'] == 'reduce']
        assert len(reduce_advice) > 0, "Should have 'reduce' action for concentrated TCS holding"
        
        # Verify the message mentions concentration
        assert any('concentrated' in advice['message'].lower() for advice in reduce_advice), \
            "Reduce advice should mention concentration"

    def test_sharp_drop_reduce_action(self):
        """Test that stocks with 7-day drop < -5% get 'reduce' action."""
        # Portfolio with SUNPHARMA that has -7% 7-day performance
        portfolio = [
            {'symbol': 'SUNPHARMA', 'quantity': 10},  # Has -7% 7-day change
            {'symbol': 'HDFCBANK', 'quantity': 10}    # Positive performer for balance
        ]
        
        result = analyze_portfolio(portfolio, self.mock_market_data)
        
        # Find advice for SUNPHARMA
        sunpharma_advice = [advice for advice in result['advice'] if advice['symbol'] == 'SUNPHARMA']
        
        assert len(sunpharma_advice) > 0, "Should have advice for SUNPHARMA"
        reduce_advice = [advice for advice in sunpharma_advice if advice['action'] == 'reduce']
        assert len(reduce_advice) > 0, "Should have 'reduce' action for SUNPHARMA with sharp drop"
        
        # Verify the message mentions the drop
        assert any('drop' in advice['message'].lower() for advice in reduce_advice), \
            "Reduce advice should mention the drop"

    def test_underweight_positive_momentum_buy_action(self):
        """Test that underweight stocks with positive momentum get 'buy' action."""
        # Portfolio where HDFCBANK is underweight but has positive momentum
        portfolio = [
            {'symbol': 'TCS', 'quantity': 10},        # 33,000 (large holding)
            {'symbol': 'HDFCBANK', 'quantity': 1}     # 1,500 (small holding with +3.5% 7-day)
        ]
        # Total: 34,500, HDFCBANK weight: ~4.3% (< 5%), has +3.5% momentum (> 2%)
        
        result = analyze_portfolio(portfolio, self.mock_market_data)
        
        # Find advice for HDFCBANK
        hdfc_advice = [advice for advice in result['advice'] if advice['symbol'] == 'HDFCBANK']
        
        assert len(hdfc_advice) > 0, "Should have advice for HDFCBANK"
        buy_advice = [advice for advice in hdfc_advice if advice['action'] == 'buy']
        assert len(buy_advice) > 0, "Should have 'buy' action for underweight HDFCBANK with positive momentum"
        
        # Verify the message mentions underweight and momentum
        buy_message = buy_advice[0]['message'].lower()
        assert 'underweight' in buy_message or 'small' in buy_message, \
            "Buy advice should mention underweight position"
        assert 'growth' in buy_message or 'momentum' in buy_message or 'positive' in buy_message, \
            "Buy advice should mention positive performance"

    def test_strong_growth_hold_or_buy_action(self):
        """Test that stocks with strong 7-day growth get 'hold_or_buy' action."""
        # Portfolio with RELIANCE that has +6% 7-day performance
        portfolio = [
            {'symbol': 'RELIANCE', 'quantity': 5},
            {'symbol': 'TCS', 'quantity': 5}
        ]
        
        result = analyze_portfolio(portfolio, self.mock_market_data)
        
        # Find advice for RELIANCE
        reliance_advice = [advice for advice in result['advice'] if advice['symbol'] == 'RELIANCE']
        
        assert len(reliance_advice) > 0, "Should have advice for RELIANCE"
        hold_buy_advice = [advice for advice in reliance_advice if advice['action'] == 'hold_or_buy']
        assert len(hold_buy_advice) > 0, "Should have 'hold_or_buy' action for RELIANCE with strong growth"

    def test_high_volatility_caution(self):
        """Test that high volatility stocks get caution advice."""
        # Portfolio with SUNPHARMA that has high volatility (0.050 > 0.04)
        portfolio = [
            {'symbol': 'SUNPHARMA', 'quantity': 10},
            {'symbol': 'TCS', 'quantity': 10}
        ]
        
        result = analyze_portfolio(portfolio, self.mock_market_data)
        
        # Find advice for SUNPHARMA
        sunpharma_advice = [advice for advice in result['advice'] if advice['symbol'] == 'SUNPHARMA']
        
        # Should have advice mentioning volatility/risk
        volatility_advice = [advice for advice in sunpharma_advice 
                           if 'volatility' in advice['message'].lower() or 'risky' in advice['message'].lower()]
        assert len(volatility_advice) > 0, "Should have volatility warning for SUNPHARMA"

    def test_sector_diversification_advice(self):
        """Test that portfolios with poor sector diversification get diversify advice."""
        # Portfolio with only IT stocks (single sector)
        portfolio = [
            {'symbol': 'TCS', 'quantity': 10},
            {'symbol': 'INFY', 'quantity': 10}
        ]
        
        result = analyze_portfolio(portfolio, self.mock_market_data)
        
        # Should have portfolio-level diversification advice
        diversify_advice = [advice for advice in result['advice'] 
                          if advice['symbol'] == 'PORTFOLIO' and advice['action'] == 'diversify']
        assert len(diversify_advice) > 0, "Should have diversification advice for single-sector portfolio"

    def test_portfolio_value_calculation(self):
        """Test that portfolio value is calculated correctly."""
        portfolio = [
            {'symbol': 'TCS', 'quantity': 10},     # 10 * 3300 = 33,000
            {'symbol': 'INFY', 'quantity': 5}      # 5 * 1700 = 8,500
        ]
        # Expected total: 41,500
        
        result = analyze_portfolio(portfolio, self.mock_market_data)
        
        assert result['portfolio_value'] == 41500.0, f"Expected portfolio value 41500, got {result['portfolio_value']}"

    def test_weight_calculation(self):
        """Test that individual stock weights are calculated correctly."""
        portfolio = [
            {'symbol': 'TCS', 'quantity': 10},     # 33,000 / 41,500 = ~79.5%
            {'symbol': 'INFY', 'quantity': 5}      # 8,500 / 41,500 = ~20.5%
        ]
        
        result = analyze_portfolio(portfolio, self.mock_market_data)
        
        # Check TCS weight
        tcs_detail = next(stock for stock in result['details']['per_stock'] if stock['symbol'] == 'TCS')
        expected_tcs_weight = 33000 / 41500
        assert abs(tcs_detail['weight'] - expected_tcs_weight) < 0.001, \
            f"TCS weight calculation incorrect: expected {expected_tcs_weight}, got {tcs_detail['weight']}"

    def test_empty_portfolio_handling(self):
        """Test handling of empty portfolio."""
        portfolio = []
        
        result = analyze_portfolio(portfolio, self.mock_market_data)
        
        assert result['portfolio_value'] == 0.0, "Empty portfolio should have zero value"
        assert result['advice'] == [], "Empty portfolio should have no advice"


if __name__ == "__main__":
    pytest.main([__file__])
