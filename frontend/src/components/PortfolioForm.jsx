import { useState } from 'react'
import { API_ENDPOINTS } from '../config'

function PortfolioForm({ onAnalysisStart, onAnalysisComplete, loading }) {
  const [portfolio, setPortfolio] = useState([{ symbol: '', quantity: '' }])
  const [csvFile, setCsvFile] = useState(null)
  const [csvStatus, setCsvStatus] = useState('')

  const addRow = () => {
    setPortfolio([...portfolio, { symbol: '', quantity: '' }])
  }

  const updateRow = (index, field, value) => {
    const updated = portfolio.map((row, i) => 
      i === index ? { ...row, [field]: value } : row
    )
    setPortfolio(updated)
  }

  const removeRow = (index) => {
    if (portfolio.length > 1) {
      setPortfolio(portfolio.filter((_, i) => i !== index))
    }
  }

  const handleCsvUpload = (event) => {
    const file = event.target.files[0]
    if (!file) {
      setCsvFile(null)
      setCsvStatus('')
      return
    }

    setCsvFile(file)
    setCsvStatus('Reading CSV file...')

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csv = e.target.result
        const lines = csv.split('\n').filter(line => line.trim()) // Remove empty lines
        
        if (lines.length < 2) {
          setCsvStatus('❌ CSV file must have at least a header and one data row')
          return
        }

        // Parse header row
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
        const symbolIndex = headers.findIndex(h => h === 'symbol')
        const quantityIndex = headers.findIndex(h => h === 'quantity')
        
        // Check for required columns
        if (symbolIndex === -1 || quantityIndex === -1) {
          // Try simple format without header (symbol,quantity)
          if (lines[0].split(',').length >= 2) {
            const newPortfolio = []
            for (let i = 0; i < lines.length; i++) {
              const values = lines[i].split(',').map(v => v.trim())
              if (values.length >= 2) {
                const symbol = values[0]?.toUpperCase()
                const quantity = values[1]
                if (symbol && quantity && !isNaN(quantity)) {
                  newPortfolio.push({ symbol, quantity })
                }
              }
            }
            if (newPortfolio.length > 0) {
              setPortfolio(newPortfolio)
              setCsvStatus(`✅ Loaded ${newPortfolio.length} stocks from CSV (simple format)`)
              return
            }
          }
          setCsvStatus('❌ CSV must have "symbol" and "quantity" columns, or use simple format: symbol,quantity')
          return
        }

        // Parse data rows with headers
        const newPortfolio = []
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim())
          if (values.length > Math.max(symbolIndex, quantityIndex)) {
            const symbol = values[symbolIndex]?.toUpperCase()
            const quantity = values[quantityIndex]
            
            if (symbol && quantity && !isNaN(quantity) && parseInt(quantity) > 0) {
              newPortfolio.push({ symbol, quantity })
            }
          }
        }
        
        if (newPortfolio.length > 0) {
          setPortfolio(newPortfolio)
          setCsvStatus(`✅ Successfully loaded ${newPortfolio.length} stocks from CSV`)
        } else {
          setCsvStatus('❌ No valid stock entries found in CSV')
        }
      } catch (error) {
        setCsvStatus('❌ Error reading CSV file: ' + error.message)
      }
    }
    
    reader.onerror = () => {
      setCsvStatus('❌ Failed to read file')
    }
    
    reader.readAsText(file)
  }

  const clearCsv = () => {
    setCsvFile(null)
    setCsvStatus('')
    setPortfolio([{ symbol: '', quantity: '' }])
  }

  const analyzePortfolio = async () => {
    const validPortfolio = portfolio.filter(row => row.symbol && row.quantity)
    if (validPortfolio.length === 0) {
      alert('Please add at least one valid portfolio entry')
      return
    }

    onAnalysisStart()

    try {
      const response = await fetch(API_ENDPOINTS.ANALYZE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          portfolio: validPortfolio.map(row => ({
            symbol: row.symbol,
            quantity: parseInt(row.quantity)
          }))
        })
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const result = await response.json()
      onAnalysisComplete(result)
    } catch (error) {
      console.error('Error analyzing portfolio:', error)
      alert('Failed to analyze portfolio. Make sure the backend is running.')
      onAnalysisComplete(null)
    }
  }

  return (
    <div className="card" style={{
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
      borderRadius: '24px',
      padding: '35px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(102, 126, 234, 0.1)',
      backdropFilter: 'blur(20px)',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      animation: 'fadeIn 0.8s ease-out',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative gradient overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        borderRadius: '24px 24px 0 0'
      }} />
      <h2 style={{
        color: '#2d3748',
        margin: '0 0 30px 0',
        fontSize: '2rem',
        fontWeight: '800',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        textShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'relative',
        zIndex: 1
      }}>
        <span style={{
          fontSize: '2.2rem',
          animation: 'bounce 2s infinite'
        }}>📊</span>
        Portfolio Input
      </h2>
      
      {/* CSV Upload Section */}
      <div style={{ marginBottom: '25px' }}>
        <label style={{
          display: 'block',
          marginBottom: '12px',
          fontWeight: '600',
          color: '#4a5568',
          fontSize: '1.1rem'
        }}>
          📁 Upload Portfolio CSV
        </label>
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <div style={{
            flex: 1,
            position: 'relative',
            background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
            borderRadius: '12px',
            border: '2px dashed #cbd5e0',
            padding: '15px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            ':hover': {
              borderColor: '#667eea',
              background: 'linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%)'
            }
          }}>
            <input 
              type="file" 
              accept=".csv,.txt"
              onChange={handleCsvUpload}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer'
              }}
            />
            <div style={{ color: '#4a5568', fontSize: '0.9rem' }}>
              📄 Click to upload CSV file
            </div>
          </div>
          {csvFile && (
            <button 
              onClick={clearCsv}
              style={{ 
                padding: '12px 16px', 
                background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '10px', 
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(229, 62, 62, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 6px 16px rgba(229, 62, 62, 0.4)'
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 4px 12px rgba(229, 62, 62, 0.3)'
              }}
            >
              Clear
            </button>
          )}
        </div>
        
        {csvStatus && (
          <div style={{ 
            padding: '12px 16px', 
            marginBottom: '15px',
            borderRadius: '12px',
            background: csvStatus.includes('✅') 
              ? 'linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%)' 
              : 'linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%)',
            border: `2px solid ${csvStatus.includes('✅') ? '#68d391' : '#fc8181'}`,
            color: csvStatus.includes('✅') ? '#22543d' : '#742a2a',
            fontSize: '0.9rem',
            fontWeight: '500',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            {csvStatus}
          </div>
        )}
        
        <div style={{
          fontSize: '0.85rem',
          color: '#718096',
          lineHeight: '1.5',
          background: 'rgba(102, 126, 234, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid rgba(102, 126, 234, 0.2)'
        }}>
          <strong style={{ color: '#4a5568' }}>Supported formats:</strong><br/>
          • With headers: <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>symbol,quantity</code><br/>
          • Simple format: <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>TCS,10</code><br/>
          • Example: <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>INFY,5</code>
        </div>
      </div>

      {/* Manual Entry Section */}
      <div style={{ marginBottom: '25px' }}>
        <h3 style={{
          color: '#4a5568',
          margin: '0 0 15px 0',
          fontSize: '1.2rem',
          fontWeight: '600'
        }}>
          ✏️ Manual Entry
        </h3>
        {portfolio.map((row, index) => (
          <div key={index} style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '12px',
            alignItems: 'center',
            background: 'rgba(102, 126, 234, 0.05)',
            padding: '12px',
            borderRadius: '12px',
            border: '1px solid rgba(102, 126, 234, 0.1)',
            transition: 'all 0.3s ease'
          }}>
            <input
              type="text"
              placeholder="Symbol (e.g., TCS)"
              value={row.symbol}
              onChange={(e) => updateRow(index, 'symbol', e.target.value.toUpperCase())}
              style={{
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                flex: 1,
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                background: 'white',
                ':focus': {
                  outline: 'none',
                  borderColor: '#667eea',
                  boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
                }
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea'
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0'
                e.target.style.boxShadow = 'none'
              }}
            />
            <input
              type="number"
              placeholder="Quantity"
              value={row.quantity}
              onChange={(e) => updateRow(index, 'quantity', e.target.value)}
              style={{
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                width: '120px',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
                background: 'white'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea'
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0'
                e.target.style.boxShadow = 'none'
              }}
            />
            {portfolio.length > 1 && (
              <button 
                onClick={() => removeRow(index)}
                style={{
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(229, 62, 62, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 6px 16px rgba(229, 62, 62, 0.4)'
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 4px 12px rgba(229, 62, 62, 0.3)'
                }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="button-group" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button 
          onClick={addRow}
          style={{
            padding: '14px 24px',
            background: 'linear-gradient(135deg, #38a169 0%, #2f855a 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(56, 161, 105, 0.3)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 6px 16px rgba(56, 161, 105, 0.4)'
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 4px 12px rgba(56, 161, 105, 0.3)'
          }}
        >
          ➕ Add Row
        </button>
        
        <button 
          onClick={analyzePortfolio}
          disabled={loading}
          style={{ 
            padding: '14px 24px',
            background: loading 
              ? 'linear-gradient(135deg, #a0aec0 0%, #718096 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            boxShadow: loading 
              ? '0 4px 12px rgba(160, 174, 192, 0.3)'
              : '0 4px 12px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: loading ? 0.7 : 1
          }}
          onMouseOver={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(-2px)'
              e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)'
            }
          }}
          onMouseOut={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'
            }
          }}
        >
          {loading ? '⏳ Analyzing...' : '🔍 Analyze Portfolio'}
        </button>
      </div>
    </div>
  )
}

export default PortfolioForm
