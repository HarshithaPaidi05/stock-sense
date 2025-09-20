import { useState, useEffect } from 'react'
import { API_ENDPOINTS } from '../config'

function UsageDashboard({ analysisResult }) {
  const [usage, setUsage] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchUsage = async () => {
    setLoading(true)
    try {
      const response = await fetch(API_ENDPOINTS.USAGE)
      if (response.ok) {
        const data = await response.json()
        setUsage(data)
      }
    } catch (error) {
      console.error('Error fetching usage:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsage()
  }, [])

  // Refresh usage when new analysis is completed
  useEffect(() => {
    if (analysisResult) {
      // Use the usage data from the analysis result if available
      if (analysisResult.usage) {
        setUsage(analysisResult.usage)
      } else {
        // Otherwise fetch fresh data
        fetchUsage()
      }
    }
  }, [analysisResult])

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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '25px',
        paddingBottom: '15px',
        borderBottom: '2px solid #e2e8f0'
      }}>
        <h2 style={{
          color: '#2d3748',
          margin: '0',
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
          Usage Dashboard
        </h2>
        <button 
          onClick={fetchUsage}
          disabled={loading}
          style={{ 
            padding: '10px 16px', 
            background: loading 
              ? 'linear-gradient(135deg, #a0aec0 0%, #718096 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '12px', 
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
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
          {loading ? '⏳ Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      {usage ? (
        <div style={{ display: 'grid', gap: '20px' }}>
          {/* Portfolios Analyzed */}
          <div style={{ 
            background: 'linear-gradient(135deg, #e6fffa 0%, #b2f5ea 100%)', 
            padding: '20px', 
            borderRadius: '16px',
            border: '2px solid #81e6d9',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #38b2ac 0%, #319795 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              color: 'white',
              boxShadow: '0 4px 12px rgba(56, 178, 172, 0.3)'
            }}>
              📈
            </div>
            <h4 style={{ 
              margin: '0 0 10px 0', 
              color: '#234e52',
              fontSize: '1.1rem',
              fontWeight: '600'
            }}>
              Portfolios Analyzed
            </h4>
            <p style={{ 
              margin: '0', 
              fontSize: '2.5rem', 
              fontWeight: '800', 
              color: '#234e52',
              lineHeight: '1'
            }}>
              {usage.portfolios_analyzed_total}
            </p>
            <p style={{
              margin: '8px 0 0 0',
              color: '#2c7a7b',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              Total analyses completed
            </p>
          </div>

          {/* Advice Generated */}
          <div style={{ 
            background: 'linear-gradient(135deg, #fef5e7 0%, #fed7aa 100%)', 
            padding: '20px', 
            borderRadius: '16px',
            border: '2px solid #f6ad55',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              color: 'white',
              boxShadow: '0 4px 12px rgba(237, 137, 54, 0.3)'
            }}>
              💡
            </div>
            <h4 style={{ 
              margin: '0 0 10px 0', 
              color: '#7c2d12',
              fontSize: '1.1rem',
              fontWeight: '600'
            }}>
              Advice Generated
            </h4>
            <p style={{ 
              margin: '0', 
              fontSize: '2.5rem', 
              fontWeight: '800', 
              color: '#7c2d12',
              lineHeight: '1'
            }}>
              {usage.advice_generated_total}
            </p>
            <p style={{
              margin: '8px 0 0 0',
              color: '#9a3412',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              Investment recommendations
            </p>
          </div>

          {/* Last Analysis Billing */}
          {analysisResult?.billing && (
            <div style={{ 
              background: 'linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%)', 
              padding: '20px', 
              borderRadius: '16px',
              border: '2px solid #9ae6b4',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #38a169 0%, #2f855a 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                color: 'white',
                boxShadow: '0 4px 12px rgba(56, 161, 105, 0.3)'
              }}>
                💰
              </div>
              <h4 style={{ 
                margin: '0 0 10px 0', 
                color: '#22543d',
                fontSize: '1.1rem',
                fontWeight: '600'
              }}>
                Last Analysis Cost
              </h4>
              <p style={{ 
                margin: '0 0 8px 0', 
                fontSize: '2rem', 
                fontWeight: '800', 
                color: '#22543d',
                lineHeight: '1'
              }}>
                ₹{analysisResult.billing.charged}
              </p>
              <div style={{
                fontSize: '0.85rem',
                color: '#2f855a',
                fontWeight: '500',
                background: 'rgba(56, 161, 105, 0.1)',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(56, 161, 105, 0.2)'
              }}>
                ₹{analysisResult.billing.breakdown.portfolio_analysis} base + 
                {analysisResult.billing.breakdown.advice_items} advice × 
                ₹{analysisResult.billing.breakdown.price_per_advice}
              </div>
            </div>
          )}

          {/* Average Advice per Portfolio */}
          {usage.portfolios_analyzed_total > 0 && (
            <div style={{ 
              background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)', 
              padding: '20px', 
              borderRadius: '16px',
              border: '2px solid #cbd5e0',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                color: 'white',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}>
                📊
              </div>
              <h4 style={{ 
                margin: '0 0 10px 0', 
                color: '#2d3748',
                fontSize: '1.1rem',
                fontWeight: '600'
              }}>
                Average Advice per Portfolio
              </h4>
              <p style={{ 
                margin: '0', 
                fontSize: '2rem', 
                fontWeight: '800', 
                color: '#2d3748',
                lineHeight: '1'
              }}>
                {(usage.advice_generated_total / usage.portfolios_analyzed_total).toFixed(1)}
              </p>
              <p style={{
                margin: '8px 0 0 0',
                color: '#4a5568',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                Recommendations per analysis
              </p>
            </div>
          )}

          {/* Flexprice Integration Status */}
          {analysisResult?.billing?.flexprice_session && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              padding: '15px',
              borderRadius: '12px',
              border: '1px solid rgba(102, 126, 234, 0.2)',
              textAlign: 'center'
            }}>
              <p style={{
                margin: '0',
                color: '#4a5568',
                fontSize: '0.85rem',
                fontWeight: '500'
              }}>
                🔗 <strong>Flexprice Session:</strong> {analysisResult.billing.flexprice_session}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#718096'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '15px'
          }}>
            {loading ? '⏳' : '📊'}
          </div>
          <p style={{ 
            margin: '0',
            fontSize: '1.1rem',
            fontWeight: '500'
          }}>
            {loading ? 'Loading usage data...' : 'No usage data available'}
          </p>
        </div>
      )}
    </div>
  )
}

export default UsageDashboard
