# API Examples

This document provides complete examples of API requests and responses for the Stock Consultant Agent backend.

## Base URL

```
http://localhost:8000
```

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/market` | Get current market data |
| POST | `/api/analyze` | Analyze portfolio and get investment advice |
| GET | `/api/usage` | Get usage statistics |

---

## 1. Get Market Data

### Request
```bash
curl -X GET "http://localhost:8000/api/market"
```

### Response
```json
[
  {
    "symbol": "TCS",
    "name": "Tata Consultancy Services",
    "sector": "IT",
    "price": 3300.0,
    "change_1d_pct": 0.4,
    "change_7d_pct": 1.8,
    "volatility": 0.015,
    "market_cap_cr": 125000.0
  },
  {
    "symbol": "INFY",
    "name": "Infosys",
    "sector": "IT",
    "price": 1700.0,
    "change_1d_pct": -0.6,
    "change_7d_pct": 2.4,
    "volatility": 0.02,
    "market_cap_cr": 76000.0
  },
  {
    "symbol": "RELIANCE",
    "name": "Reliance Industries",
    "sector": "Energy",
    "price": 2600.0,
    "change_1d_pct": 1.2,
    "change_7d_pct": 6.0,
    "volatility": 0.035,
    "market_cap_cr": 160000.0
  },
  {
    "symbol": "SUNPHARMA",
    "name": "Sun Pharmaceutical",
    "sector": "Pharma",
    "price": 900.0,
    "change_1d_pct": -2.5,
    "change_7d_pct": -5.0,
    "volatility": 0.05,
    "market_cap_cr": 18000.0
  },
  {
    "symbol": "HDFCBANK",
    "name": "HDFC Bank",
    "sector": "Banking",
    "price": 1500.0,
    "change_1d_pct": 0.2,
    "change_7d_pct": 0.9,
    "volatility": 0.012,
    "market_cap_cr": 90000.0
  }
]
```

---

## 2. Analyze Portfolio

### Request
```bash
curl -X POST "http://localhost:8000/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "portfolio": [
      {"symbol": "TCS", "quantity": 10},
      {"symbol": "SUNPHARMA", "quantity": 3},
      {"symbol": "RELIANCE", "quantity": 2}
    ]
  }'
```

### Response
```json
{
  "advice": [
    {
      "symbol": "TCS",
      "action": "reduce",
      "message": "Too concentrated — consider reducing this holding."
    },
    {
      "symbol": "SUNPHARMA",
      "action": "reduce",
      "message": "Recent sharp drop — consider reducing or reviewing reason."
    },
    {
      "symbol": "SUNPHARMA",
      "action": "caution",
      "message": "High volatility — this is risky for beginners."
    },
    {
      "symbol": "RELIANCE",
      "action": "hold_or_buy",
      "message": "Strong recent growth — consider holding or adding if underweight."
    },
    {
      "symbol": "PORTFOLIO",
      "action": "diversify",
      "message": "Your portfolio lacks diversification; consider adding stocks from other sectors (e.g., Pharma or Banking)."
    }
  ],
  "portfolio_value": 41900.0,
  "details": {
    "per_stock": [
      {
        "symbol": "TCS",
        "quantity": 10,
        "price": 3300.0,
        "stock_value": 33000.0,
        "sector": "IT",
        "change_7d_pct": 1.8,
        "volatility": 0.015,
        "weight": 0.7876
      },
      {
        "symbol": "SUNPHARMA",
        "quantity": 3,
        "price": 900.0,
        "stock_value": 2700.0,
        "sector": "Pharma",
        "change_7d_pct": -5.0,
        "volatility": 0.05,
        "weight": 0.0644
      },
      {
        "symbol": "RELIANCE",
        "quantity": 2,
        "price": 2600.0,
        "stock_value": 5200.0,
        "sector": "Energy",
        "change_7d_pct": 6.0,
        "volatility": 0.035,
        "weight": 0.1241
      }
    ]
  },
  "billing": {
    "charged": 15,
    "breakdown": {
      "portfolio_analysis": 5,
      "advice_items": 5,
      "price_per_advice": 2,
      "advice_cost": 10
    }
  },
  "usage": {
    "portfolios_analyzed_total": 1,
    "advice_generated_total": 5
  }
}
```

### Analysis Breakdown

**Portfolio Composition:**
- TCS: ₹33,000 (78.8%) - **Over-concentrated**
- SUNPHARMA: ₹2,700 (6.4%) - **Sharp decline & high volatility**
- RELIANCE: ₹5,200 (12.4%) - **Strong performer**
- **Total Value**: ₹41,900

**Advice Generated (5 items):**
1. **TCS Reduce**: Too concentrated (>50% of portfolio)
2. **SUNPHARMA Reduce**: -5% 7-day performance (sharp drop)
3. **SUNPHARMA Caution**: 0.05 volatility (high risk)
4. **RELIANCE Hold/Buy**: +6% 7-day growth (strong performance)
5. **Portfolio Diversify**: Only 3 sectors represented

**Billing:**
- Base fee: ₹5
- 5 advice items × ₹2 = ₹10
- **Total**: ₹15

---

## 3. Concentrated Portfolio Example

### Request (Single High-Concentration Stock)
```bash
curl -X POST "http://localhost:8000/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "portfolio": [
      {"symbol": "TCS", "quantity": 30},
      {"symbol": "INFY", "quantity": 1}
    ]
  }'
```

### Response
```json
{
  "advice": [
    {
      "symbol": "TCS",
      "action": "reduce",
      "message": "Too concentrated — consider reducing this holding."
    },
    {
      "symbol": "PORTFOLIO",
      "action": "diversify",
      "message": "Your portfolio lacks diversification; consider adding stocks from other sectors (e.g., Pharma or Banking)."
    }
  ],
  "portfolio_value": 100700.0,
  "details": {
    "per_stock": [
      {
        "symbol": "TCS",
        "quantity": 30,
        "price": 3300.0,
        "stock_value": 99000.0,
        "weight": 0.9831
      },
      {
        "symbol": "INFY",
        "quantity": 1,
        "price": 1700.0,
        "stock_value": 1700.0,
        "weight": 0.0169
      }
    ]
  },
  "billing": {
    "charged": 9,
    "breakdown": {
      "portfolio_analysis": 5,
      "advice_items": 2,
      "price_per_advice": 2,
      "advice_cost": 4
    }
  }
}
```

**Key Points:**
- TCS is 98.3% of portfolio (extreme concentration)
- Only IT sector (poor diversification)
- Lower billing due to fewer advice items

---

## 4. Underweight Momentum Example

### Request (Small Position with Growth)
```bash
curl -X POST "http://localhost:8000/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "portfolio": [
      {"symbol": "TCS", "quantity": 20},
      {"symbol": "INFY", "quantity": 1}
    ]
  }'
```

### Response
```json
{
  "advice": [
    {
      "symbol": "INFY",
      "action": "buy",
      "message": "Underweight and positive momentum — consider adding a small position."
    },
    {
      "symbol": "PORTFOLIO",
      "action": "diversify",
      "message": "Your portfolio lacks diversification; consider adding stocks from other sectors (e.g., Pharma or Banking)."
    }
  ],
  "portfolio_value": 67700.0,
  "details": {
    "per_stock": [
      {
        "symbol": "TCS",
        "quantity": 20,
        "price": 3300.0,
        "stock_value": 66000.0,
        "weight": 0.9749
      },
      {
        "symbol": "INFY",
        "quantity": 1,
        "price": 1700.0,
        "stock_value": 1700.0,
        "change_7d_pct": 2.4,
        "weight": 0.0251
      }
    ]
  }
}
```

**Analysis:**
- INFY has 2.5% weight (< 5%) with +2.4% growth (> 2%) → Buy signal

---

## 5. Get Usage Statistics

### Request
```bash
curl -X GET "http://localhost:8000/api/usage"
```

### Response
```json
{
  "portfolios_analyzed_total": 3,
  "advice_generated_total": 12
}
```

---

## Error Responses

### 404 - Stock Not Found
```bash
curl -X POST "http://localhost:8000/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "portfolio": [
      {"symbol": "INVALID", "quantity": 10}
    ]
  }'
```

**Response:** The system gracefully handles unknown symbols by skipping them in analysis.

### 400 - Invalid Request Format
```bash
curl -X POST "http://localhost:8000/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "invalid_field": "value"
  }'
```

**Response:**
```json
{
  "detail": [
    {
      "loc": ["body", "portfolio"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## Real-time Data Testing

### Test Market Data Updates

1. **Make initial request** to see current advice
2. **Edit `data/stocks.csv`** - change a stock's `change_7d_pct` value
3. **Wait 30 seconds** for background refresh
4. **Make same request** - advice should reflect new data

Example: Change RELIANCE from +6.0% to -8.0% to see it switch from "hold_or_buy" to "reduce" advice.

---

## Authentication & Headers

Currently, no authentication is required. All endpoints accept standard HTTP requests with `Content-Type: application/json` for POST requests.

## Rate Limiting

No rate limiting is currently implemented. The system can handle multiple concurrent requests.
