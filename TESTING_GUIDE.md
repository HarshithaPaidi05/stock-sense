# Stock Consultant Agent - Complete Testing Guide

This guide walks you through running the application and testing every feature step by step.

## 🚀 How to Run the Application

### Step 1: Start the Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (first time only)
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate

# Mac/Linux:
# source .venv/bin/activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Start the backend server
uvicorn main:app --reload --port 8000
```

**Expected Output:**
```
INFO:     Will watch for changes in these directories: ['C:\Users\DELL\OneDrive\Documents\Desktop\stock c\backend']
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx] using StatReload
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Starting market updater background task...
INFO:     [Pathway Mock] Fetching data from ../data/stocks.csv
INFO:     [Pathway Mock] Successfully loaded 5 stocks at 2024-09-19 XX:XX:XX.XXXXXX
INFO:     Market data refreshed: 5 stocks loaded
INFO:     Application startup complete.
```

### Step 2: Start the Frontend (New Terminal)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**Expected Output:**
```
> stock-consultant-frontend@0.0.0 dev
> vite

  VITE v4.4.5  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### Step 3: Access the Application

- **Frontend**: Open http://localhost:5173
- **Backend API**: Available at http://localhost:8000
- **API Docs**: Visit http://localhost:8000/docs for Swagger documentation

---

## 🧪 Complete Feature Testing Guide

### 🔍 Test 1: Basic API Health Check

#### 1.1 Test Market Data API
```bash
curl -X GET "http://localhost:8000/api/market"
```

**Expected Response:**
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
  // ... 4 more stocks
]
```

#### 1.2 Test Usage API
```bash
curl -X GET "http://localhost:8000/api/usage"
```

**Expected Response:**
```json
{
  "portfolios_analyzed_total": 0,
  "advice_generated_total": 0
}
```

#### 1.3 Test Integrations Status
```bash
curl -X GET "http://localhost:8000/api/integrations/status"
```

**Expected Response:**
```json
{
  "pathway": {
    "connected": true,
    "last_updated": "2024-09-19T...",
    "data_source": "../data/stocks.csv",
    "cached_records": 5
  },
  "flexprice": {
    "connected": true,
    "api_key_prefix": "mock_flexprice_key_12345",
    "pricing_config": {...}
  }
}
```

---

### 📊 Test 2: Frontend UI Testing

#### 2.1 Load the Application
1. Open http://localhost:5173
2. **Expected**: See "Stock Consultant Agent" title
3. **Expected**: Portfolio input form with CSV upload section
4. **Expected**: Usage dashboard on the right side

#### 2.2 Test Empty State
1. **Action**: Load the page
2. **Expected**: One empty row with Symbol and Quantity fields
3. **Expected**: "Add Row" and "Analyze Portfolio" buttons
4. **Expected**: Usage dashboard shows loading or zero values

---

### 📈 Test 3: Manual Portfolio Entry

#### 3.1 Single Stock Portfolio
1. **Action**: Enter "TCS" in Symbol field
2. **Action**: Enter "10" in Quantity field
3. **Action**: Click "Analyze Portfolio"

**Expected Results:**
- **Portfolio Value**: ₹33,000
- **Advice**: "Too concentrated — consider reducing this holding"
- **Billing**: ₹7 (₹5 base + 1 advice × ₹2)
- **Usage**: 1 portfolio analyzed, 1 advice generated

#### 3.2 Multi-Stock Portfolio Test
1. **Action**: Click "Add Row" to add more stocks
2. **Action**: Enter:
   - Row 1: TCS, 10
   - Row 2: SUNPHARMA, 3
   - Row 3: RELIANCE, 2
3. **Action**: Click "Analyze Portfolio"

**Expected Results:**
- **Portfolio Value**: ₹41,900
- **Advice Count**: 4-5 recommendations
- **Advice Types**:
  - TCS: "Too concentrated" (78.8% of portfolio)
  - SUNPHARMA: "Recent sharp drop" (-5% 7-day) + "High volatility" (0.05)
  - RELIANCE: "Strong recent growth" (+6% 7-day)
  - Portfolio: "Lacks diversification"
- **Billing**: ₹13-15 depending on advice count
- **Usage Dashboard**: Updates with new totals

---

### 📄 Test 4: CSV Upload Feature

#### 4.1 Create Test CSV File
Create a file called `test_portfolio.csv`:
```csv
symbol,quantity
TCS,5
INFY,5
RELIANCE,3
HDFCBANK,8
```

#### 4.2 Test CSV Upload
1. **Action**: Click "Choose File" in CSV upload section
2. **Action**: Select your `test_portfolio.csv` file
3. **Expected**: Green success message "✅ Successfully loaded 4 stocks from CSV"
4. **Expected**: Manual entry rows are replaced with CSV data
5. **Action**: Click "Analyze Portfolio"

**Expected Results:**
- **Portfolio Value**: ₹36,900 (5×3300 + 5×1700 + 3×2600 + 8×1500)
- **More Balanced Portfolio**: No concentration warnings
- **Diversification**: 3 sectors (IT, Energy, Banking)
- **Billing**: Lower cost due to fewer warnings

#### 4.3 Test Simple CSV Format
Create `simple_portfolio.csv` (no headers):
```csv
TCS,15
SUNPHARMA,10
```

1. **Action**: Upload this file
2. **Expected**: "✅ Loaded 2 stocks from CSV (simple format)"
3. **Expected**: Data populates correctly

#### 4.4 Test CSV Clear Function
1. **Action**: After uploading CSV, click "Clear" button
2. **Expected**: Portfolio resets to single empty row
3. **Expected**: CSV status message disappears

---

### ⚠️ Test 5: Investment Rules Testing

#### 5.1 Test Concentration Risk (>50% in one stock)
**Portfolio**: TCS: 20, INFY: 1
1. **Expected Advice**: "Too concentrated — consider reducing this holding"
2. **Expected Action**: "reduce"
3. **Expected**: TCS weight ~97%

#### 5.2 Test Sharp Decline Rule (<-5% 7-day change)
**Portfolio**: SUNPHARMA: 10, TCS: 5
1. **Expected Advice**: "Recent sharp drop — consider reducing or reviewing reason"
2. **Expected**: SUNPHARMA has -5% 7-day change

#### 5.3 Test High Volatility Warning (>0.04)
**Portfolio**: SUNPHARMA: 5, HDFCBANK: 5
1. **Expected Advice**: "High volatility — this is risky for beginners"
2. **Expected**: SUNPHARMA has 0.05 volatility

#### 5.4 Test Strong Growth Signal (>5% 7-day change)
**Portfolio**: RELIANCE: 5, TCS: 5
1. **Expected Advice**: "Strong recent growth — consider holding or adding"
2. **Expected**: RELIANCE has +6% 7-day change

#### 5.5 Test Underweight + Momentum (<5% weight + >2% growth)
**Portfolio**: TCS: 30, INFY: 1
1. **Expected Advice**: "Underweight and positive momentum — consider adding"
2. **Expected**: INFY has ~2.4% 7-day growth and <5% weight

#### 5.6 Test Diversification Warning (<2 sectors)
**Portfolio**: TCS: 10, INFY: 5 (both IT sector)
1. **Expected Advice**: "Your portfolio lacks diversification; consider adding stocks from other sectors"
2. **Expected Action**: "diversify"

---

### 💰 Test 6: Billing System

#### 6.1 Test Billing Calculations
**Test Case**: Portfolio with 3 advice items
1. **Expected Base Fee**: ₹5
2. **Expected Advice Fee**: 3 × ₹2 = ₹6
3. **Expected Total**: ₹11
4. **Expected Breakdown**: Shows all components

#### 6.2 Test Flexprice Integration
1. **Action**: Run any portfolio analysis
2. **Expected**: Response includes:
   ```json
   "flexprice_session": "flx_session_XXXXXXXX",
   "flexprice_total": 11.0,
   "flexprice_status": "completed"
   ```

#### 6.3 Test Usage Accumulation
1. **Action**: Run 3 different analyses
2. **Expected**: Usage dashboard shows cumulative totals
3. **Expected**: Each analysis increments both portfolios and advice counts

---

### 🔄 Test 7: Real-time Data Updates

#### 7.1 Test Background Data Refresh
1. **Action**: Note current time
2. **Action**: Wait 30+ seconds
3. **Expected**: Backend logs show "Market data refreshed: 5 stocks loaded"

#### 7.2 Test Live Data Editing
1. **Action**: Run analysis with RELIANCE (note advice)
2. **Action**: Edit `data/stocks.csv` - change RELIANCE `change_7d_pct` from `6.0` to `-8.0`
3. **Action**: Wait 30+ seconds for refresh
4. **Action**: Run same analysis again
5. **Expected**: Advice changes from "Strong growth" to "Sharp drop"

#### 7.3 Test Data Freshness
1. **Action**: Check `/api/integrations/status`
2. **Expected**: `last_updated` timestamp is recent
3. **Expected**: `cached_records` shows 5

---

### 🧪 Test 8: Error Handling

#### 8.1 Test Invalid Stock Symbol
**Portfolio**: INVALID: 10, TCS: 5
1. **Expected**: Analysis continues with valid stocks only
2. **Expected**: No crash or error

#### 8.2 Test Empty Portfolio Analysis
1. **Action**: Leave all fields empty, click "Analyze"
2. **Expected**: Alert: "Please add at least one valid portfolio entry"

#### 8.3 Test Invalid CSV
Create `bad.csv`:
```csv
this,is,bad,data
not,stock,symbols
```

1. **Action**: Upload bad CSV
2. **Expected**: Error message about invalid format

#### 8.4 Test Backend Offline
1. **Action**: Stop backend server (Ctrl+C)
2. **Action**: Try to analyze portfolio in frontend
3. **Expected**: Error message: "Make sure the backend is running"

---

### 📊 Test 9: Usage Dashboard

#### 9.1 Test Real-time Updates
1. **Action**: Note current usage numbers
2. **Action**: Run portfolio analysis
3. **Expected**: Dashboard updates immediately after analysis
4. **Expected**: Both portfolio and advice counts increment

#### 9.2 Test Manual Refresh
1. **Action**: Click "Refresh" button in usage dashboard
2. **Expected**: Data refreshes from server
3. **Expected**: "Refreshing..." state appears briefly

#### 9.3 Test Billing Display
1. **Action**: Run analysis and check usage dashboard
2. **Expected**: "Last Analysis Billing" section appears
3. **Expected**: Shows total cost and breakdown

---

### 🔧 Test 10: Advanced Features

#### 10.1 Test Large Portfolio
Create CSV with 10+ stocks:
```csv
symbol,quantity
TCS,10
INFY,8
RELIANCE,5
SUNPHARMA,3
HDFCBANK,12
WIPRO,6
ICICIBANK,4
LT,2
BHARTIARTL,7
MARUTI,3
```

1. **Action**: Upload and analyze
2. **Expected**: Multiple advice items
3. **Expected**: Higher billing due to more advice
4. **Expected**: Better diversification (fewer warnings)

#### 10.2 Test Performance
1. **Action**: Run multiple rapid analyses
2. **Expected**: Each completes within 2-3 seconds
3. **Expected**: No timeouts or crashes

#### 10.3 Test Browser Compatibility
1. **Action**: Test in Chrome, Firefox, Safari, Edge
2. **Expected**: Consistent behavior across browsers
3. **Expected**: CSV upload works in all browsers

---

## 🐛 Troubleshooting Common Issues

### Backend Won't Start
```bash
# Check if port 8000 is available
netstat -an | grep 8000

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### Frontend Won't Start
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### CSV Upload Not Working
- Check file format (CSV with commas)
- Ensure symbols match those in `data/stocks.csv`
- Try simple format without headers

### No Market Data
- Check `data/stocks.csv` exists and has data
- Check backend logs for loading errors
- Verify file path is correct

### Analysis Not Working
- Check browser console for errors
- Verify backend is running on port 8000
- Check network tab for failed API calls

---

## ✅ Complete Testing Checklist

### API Tests:
- [ ] GET /api/market returns 5 stocks
- [ ] GET /api/usage returns totals
- [ ] GET /api/integrations/status shows system health
- [ ] POST /api/analyze processes portfolio correctly

### Frontend Tests:
- [ ] Page loads without errors
- [ ] Manual portfolio entry works
- [ ] CSV upload with headers works
- [ ] CSV upload simple format works
- [ ] Clear CSV function works
- [ ] Add/remove rows works
- [ ] Usage dashboard updates

### Investment Logic Tests:
- [ ] Concentration risk detection (>50%)
- [ ] Sharp decline warnings (<-5%)
- [ ] High volatility alerts (>0.04)
- [ ] Strong growth recommendations (>5%)
- [ ] Underweight momentum signals
- [ ] Diversification advice

### Billing Tests:
- [ ] Correct fee calculations
- [ ] Flexprice integration working
- [ ] Usage accumulation accurate
- [ ] Billing breakdown displayed

### Real-time Tests:
- [ ] Background data refresh (30s)
- [ ] Live CSV editing reflected
- [ ] Data freshness tracking

### Error Handling Tests:
- [ ] Invalid symbols handled
- [ ] Empty portfolio rejected
- [ ] Bad CSV format handled
- [ ] Backend offline handled

If all tests pass, your Stock Consultant Agent is working perfectly! 🎉
