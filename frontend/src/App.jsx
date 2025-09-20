import { useState } from 'react'
import PortfolioForm from './components/PortfolioForm'
import AdviceList from './components/AdviceList'
import UsageDashboard from './components/UsageDashboard'

function App() {
  const [analysisResult, setAnalysisResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result)
    setLoading(false)
  }

  const handleAnalysisStart = () => {
    setLoading(true)
    setAnalysisResult(null)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      padding: '0',
      margin: '0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        animation: 'float 20s ease-in-out infinite',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '-10%',
        width: '300px',
        height: '300px',
        background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        borderRadius: '50%',
        animation: 'pulse 4s ease-in-out infinite',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '-5%',
        width: '200px',
        height: '200px',
        background: 'linear-gradient(45deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite reverse',
        zIndex: 0
      }} />
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        padding: '25px 0',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h1 className="header-title" style={{
            color: '#2d3748',
            textAlign: 'center',
            margin: '0',
            fontSize: '3rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 4px 8px rgba(0,0,0,0.1)',
            letterSpacing: '-0.02em',
            animation: 'glow 2s ease-in-out infinite alternate'
          }}>
            🧠 Stock Sense
          </h1>
          <p className="header-subtitle" style={{
            textAlign: 'center',
            color: '#4a5568',
            margin: '15px 0 0 0',
            fontSize: '1.2rem',
            fontWeight: '500',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            animation: 'fadeInUp 1s ease-out 0.5s both'
          }}>
            🚀 Get intelligent investment advice in plain English
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content" style={{ 
        padding: '50px 20px', 
        maxWidth: '1200px', 
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        <div className="main-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '30px',
          marginBottom: '40px'
        }}>
          {/* Left Column - Portfolio Form */}
          <div>
            <PortfolioForm 
              onAnalysisStart={handleAnalysisStart}
              onAnalysisComplete={handleAnalysisComplete}
              loading={loading}
            />
            
            {analysisResult && (
              <div style={{
                marginTop: '25px',
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '16px',
                padding: '25px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <h3 style={{
                  color: '#2d3748',
                  margin: '0 0 15px 0',
                  fontSize: '1.5rem',
                  fontWeight: '600'
                }}>
                  💰 Portfolio Summary
                </h3>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  <span style={{ color: '#4a5568', fontSize: '1.1rem' }}>Total Value:</span>
                  <span style={{
                    color: '#38a169',
                    fontSize: '1.5rem',
                    fontWeight: '700'
                  }}>
                    ₹{analysisResult.portfolio_value?.toLocaleString()}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <span style={{ color: '#4a5568', fontWeight: '500' }}>Billing:</span>
                  <span style={{
                    color: '#2d3748',
                    fontWeight: '600',
                    fontSize: '1.1rem'
                  }}>
                    ₹{analysisResult.billing?.charged}
                  </span>
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#718096',
                  marginTop: '10px',
                  textAlign: 'center'
                }}>
                  ₹{analysisResult.billing?.breakdown?.portfolio_analysis} base + 
                  {analysisResult.billing?.breakdown?.advice_items} advice × 
                  ₹{analysisResult.billing?.breakdown?.price_per_advice}
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column - Usage Dashboard */}
          <div>
            <UsageDashboard analysisResult={analysisResult} />
          </div>
        </div>
        
        {/* Advice Section */}
        {analysisResult && (
          <div style={{ marginTop: '30px' }}>
            <AdviceList advice={analysisResult.advice} />
          </div>
        )}
        
        {/* Loading State */}
        {loading && (
          <div style={{
            textAlign: 'center',
            marginTop: '40px',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              display: 'inline-block',
              width: '50px',
              height: '50px',
              border: '4px solid #e2e8f0',
              borderTop: '4px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '20px'
            }}></div>
            <p style={{
              color: '#4a5568',
              fontSize: '1.2rem',
              margin: '0',
              fontWeight: '500'
            }}>
              🔍 Analyzing your portfolio...
            </p>
            <p style={{
              color: '#718096',
              fontSize: '0.9rem',
              margin: '10px 0 0 0'
            }}>
              This may take a few seconds
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        padding: '20px',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '0.9rem'
      }}>
        <p style={{ margin: '0' }}>
          Powered by AI • Real-time market data • Smart investment advice
        </p>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes glow {
          from { text-shadow: 0 4px 8px rgba(0,0,0,0.1); }
          to { text-shadow: 0 4px 20px rgba(102, 126, 234, 0.3), 0 0 30px rgba(118, 75, 162, 0.2); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.1); opacity: 0.4; }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        .fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        
        /* Enhanced card hover effects */
        .card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
        
        /* Button hover effects */
        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }
        
        .btn-success:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(56, 161, 105, 0.4);
        }
        
        .btn-danger:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(229, 62, 62, 0.4);
        }
        
        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .main-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          
          .header-title {
            font-size: 2.2rem !important;
          }
          
          .header-subtitle {
            font-size: 1rem !important;
          }
          
          .main-content {
            padding: 30px 15px !important;
          }
          
          .card {
            padding: 25px !important;
          }
          
          .button-group {
            flex-direction: column !important;
            gap: 12px !important;
          }
          
          .button-group button {
            width: 100% !important;
          }
        }
        
        @media (max-width: 480px) {
          .header-title {
            font-size: 1.8rem !important;
          }
          
          .main-content {
            padding: 20px 10px !important;
          }
          
          .card {
            padding: 20px !important;
            border-radius: 16px !important;
          }
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 10px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          border-radius: 5px;
          border: 2px solid rgba(255, 255, 255, 0.1);
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 50%, #e879f9 100%);
        }
        
        /* Selection styling */
        ::selection {
          background: rgba(102, 126, 234, 0.3);
          color: #2d3748;
        }
        
        /* Focus styles */
        *:focus {
          outline: 2px solid rgba(102, 126, 234, 0.5);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  )
}

export default App
