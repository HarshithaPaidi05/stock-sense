# Advisor Logic Tests

This directory contains unit tests for the portfolio advisor recommendation logic.

## Running Tests

### Setup
```bash
cd backend
pip install -r requirements.txt
```

### Run Tests
```bash
# Run all tests with quiet output
pytest -q

# Run tests with verbose output
pytest -v

# Run specific test file
pytest tests/test_advisor.py -v

# Run specific test
pytest tests/test_advisor.py::TestAdvisorLogic::test_concentrated_holding_reduce_action -v
```

## Test Coverage

The tests validate key advisor rules:

### ✅ **Concentration Risk**
- Holdings with weight > 50% should get "reduce" action
- Tests portfolio with 98% concentration in single stock

### ✅ **Sharp Declines**
- Stocks with 7-day drop < -5% should get "reduce" action
- Tests with SUNPHARMA having -7% performance

### ✅ **Underweight + Momentum**
- Small positions (< 5%) with positive momentum (> 2%) should get "buy" action
- Tests HDFCBANK with 4.3% weight and +3.5% 7-day growth

### ✅ **Strong Growth**
- Stocks with 7-day growth > 5% should get "hold_or_buy" action
- Tests RELIANCE with +6% performance

### ✅ **High Volatility**
- Stocks with volatility > 0.04 should get caution advice
- Tests SUNPHARMA with 0.050 volatility

### ✅ **Sector Diversification**
- Single-sector portfolios should get "diversify" advice
- Tests IT-only portfolio

### ✅ **Calculations**
- Portfolio value calculation accuracy
- Individual stock weight calculations
- Empty portfolio handling

## Test Data

Tests use mock market data with realistic Indian stock prices and characteristics:
- **TCS**: ₹3,300, IT sector, low volatility
- **INFY**: ₹1,700, IT sector, moderate volatility  
- **RELIANCE**: ₹2,600, Energy sector, strong growth
- **SUNPHARMA**: ₹900, Pharma sector, high volatility, sharp decline
- **HDFCBANK**: ₹1,500, Banking sector, positive momentum
