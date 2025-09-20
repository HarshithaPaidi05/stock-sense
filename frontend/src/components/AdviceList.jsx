function AdviceList({ advice }) {
  if (!advice || advice.length === 0) {
    return null
  }

  const getActionColor = (action) => {
    switch (action) {
      case 'buy': return 'linear-gradient(135deg, #38a169 0%, #2f855a 100%)'
      case 'hold_or_buy': return 'linear-gradient(135deg, #3182ce 0%, #2c5282 100%)'
      case 'reduce': return 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)'
      case 'diversify': return 'linear-gradient(135deg, #d69e2e 0%, #b7791f 100%)'
      case 'caution': return 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)'
      default: return 'linear-gradient(135deg, #a0aec0 0%, #718096 100%)'
    }
  }

  const getActionIcon = (action) => {
    switch (action) {
      case 'buy': return '📈'
      case 'hold_or_buy': return '🤝'
      case 'reduce': return '📉'
      case 'diversify': return '🌐'
      case 'caution': return '⚠️'
      default: return '💡'
    }
  }

  const getActionLabel = (action) => {
    switch (action) {
      case 'buy': return 'BUY'
      case 'hold_or_buy': return 'HOLD/BUY'
      case 'reduce': return 'REDUCE'
      case 'diversify': return 'DIVERSIFY'
      case 'caution': return 'CAUTION'
      default: return action.toUpperCase()
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
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
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
          }}>💡</span>
          Investment Advice
        </h2>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '0.9rem',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
        }}>
          {advice.length} recommendations
        </div>
      </div>
      
      <div style={{ display: 'grid', gap: '20px' }}>
        {advice.map((item, index) => (
          <div 
            key={index}
            style={{ 
              background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
              border: '2px solid #e2e8f0',
              padding: '20px', 
              borderRadius: '16px',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              animation: 'fadeIn 0.6s ease-out',
              animationDelay: `${index * 0.1}s`
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)'
              e.currentTarget.style.borderColor = '#667eea'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = '#e2e8f0'
            }}
          >
            {/* Decorative background */}
            <div style={{
              position: 'absolute',
              top: '0',
              right: '0',
              width: '100px',
              height: '100px',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              borderRadius: '0 16px 0 100px',
              zIndex: 0
            }} />
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start', 
              marginBottom: '15px',
              position: 'relative',
              zIndex: 1
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}>
                  {getActionIcon(item.action)}
                </div>
                <div>
                  <h4 style={{ 
                    margin: '0 0 5px 0', 
                    color: '#2d3748',
                    fontSize: '1.3rem',
                    fontWeight: '700'
                  }}>
                    {item.symbol}
                  </h4>
                  <p style={{
                    margin: '0',
                    color: '#718096',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}>
                    {item.symbol === 'PORTFOLIO' ? 'Portfolio Level' : 'Individual Stock'}
                  </p>
                </div>
              </div>
              <span 
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '25px', 
                  background: getActionColor(item.action),
                  color: 'white',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                {getActionLabel(item.action)}
              </span>
            </div>
            <p style={{ 
              margin: '0', 
              color: '#4a5568', 
              lineHeight: '1.6',
              fontSize: '1rem',
              fontWeight: '500',
              position: 'relative',
              zIndex: 1
            }}>
              {item.message}
            </p>
          </div>
        ))}
      </div>
      
      {advice.length > 0 && (
        <div style={{
          marginTop: '25px',
          padding: '20px',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          borderRadius: '12px',
          border: '1px solid rgba(102, 126, 234, 0.2)',
          textAlign: 'center'
        }}>
          <p style={{
            margin: '0',
            color: '#4a5568',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}>
            💡 <strong>Remember:</strong> These are AI-generated recommendations based on your portfolio data. 
            Always do your own research before making investment decisions.
          </p>
        </div>
      )}
    </div>
  )
}

export default AdviceList
