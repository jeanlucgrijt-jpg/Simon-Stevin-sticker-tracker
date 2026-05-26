import React, { useState } from 'react'
import './App.css'
import StickerMap from './components/StickerMap'
import LocationExtractor from './components/LocationExtractor'
import StickerSelector from './components/StickerSelector'

function App() {
  const [activeTab, setActiveTab] = useState('map')

  const renderContent = () => {
    switch (activeTab) {
      case 'map':
        return <StickerMap />
      case 'extractor':
        return <LocationExtractor />
      case 'selector':
        return <StickerSelector />
      default:
        return <StickerMap />
    }
  }

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <div className="brand-icon">🗺️</div>
          Simon Stevin Sticker Tracker
        </div>
        
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            📍 Map
          </button>
          <button 
            className={`nav-tab ${activeTab === 'extractor' ? 'active' : ''}`}
            onClick={() => setActiveTab('extractor')}
          >
            📷 GPS Extractor
          </button>
          <button 
            className={`nav-tab ${activeTab === 'selector' ? 'active' : ''}`}
            onClick={() => setActiveTab('selector')}
          >
            🏷️ Committee Selector
          </button>
        </div>
      </nav>

      <main className="dashboard-content">
        {renderContent()}
      </main>
    </div>
  )
}

export default App
