import { useState, useEffect, useCallback } from 'react'
import {
  Building2,
  Search,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Plus,
  Users,
  Loader2
} from 'lucide-react'
import { searchBuildingsByAddress } from './services/buildingService'
import './ResidentAddressSearch.css'

function ResidentAddressSearch({ onBack, onSelectBuilding, onCreateBuilding }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Debounced search
  const performSearch = useCallback(async (query) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([])
      setHasSearched(false)
      return
    }

    setIsSearching(true)
    try {
      const results = await searchBuildingsByAddress(query)
      setSearchResults(results)
      setHasSearched(true)
    } catch (error) {
      console.error('Error searching buildings:', error)
      setSearchResults([])
      setHasSearched(true)
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, performSearch])

  const handleSelectBuilding = (building) => {
    onSelectBuilding(building)
  }

  const handleCreateBuilding = () => {
    onCreateBuilding(searchQuery)
  }

  return (
    <div className="address-search-container">
      {/* Ambient Background */}
      <div className="bg-gradient"></div>

      {/* Background Orbs */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>

      <div className="address-search-content">
        {/* Back Button */}
        <button className="back-button-glass" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="address-search-card">
          {/* Header */}
          <div className="address-search-header">
            <div className="address-search-logo">
              <Search size={24} />
            </div>
            <h1 className="address-search-title">Find your building</h1>
            <p className="address-search-subtitle">
              Enter your building address to see if it's already on Community
            </p>
          </div>

          {/* Search Input */}
          <div className="search-input-group">
            <div className="search-input-wrapper">
              <MapPin size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Enter your building address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {isSearching && <Loader2 size={18} className="search-spinner" />}
            </div>
            <span className="search-helper">Start typing to search (min 3 characters)</span>
          </div>

          {/* Search Results */}
          <div className="search-results">
            {isSearching && (
              <div className="search-loading">
                <Loader2 size={24} className="spinner" />
                <span>Searching buildings...</span>
              </div>
            )}

            {!isSearching && searchResults.length > 0 && (
              <>
                <p className="results-label">Buildings found:</p>
                <div className="results-list">
                  {searchResults.map((building) => {
                    const isResidentLed = building.building_mode === 'resident_only'
                    return (
                      <button
                        key={building.id}
                        className="building-result-card"
                        onClick={() => handleSelectBuilding(building)}
                      >
                        <div className="building-result-icon">
                          <Building2 size={20} />
                        </div>
                        <div className="building-result-info">
                          <div className="building-result-name-row">
                            <h4>{building.name}</h4>
                            <span className={`building-mode-badge ${isResidentLed ? 'community' : 'managed'}`}>
                              {isResidentLed ? 'Community' : 'Managed'}
                            </span>
                          </div>
                          <p>{building.address}</p>
                          {building.resident_count > 0 && (
                            <span className="resident-count">
                              <Users size={12} />
                              {building.resident_count} resident{building.resident_count !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <ArrowRight size={18} className="result-arrow" />
                      </button>
                    )
                  })}
                </div>
              </>
            )}

            {!isSearching && hasSearched && searchResults.length === 0 && searchQuery.length >= 3 && (
              <div className="no-results">
                <div className="no-results-icon">
                  <Building2 size={32} />
                </div>
                <h3>No buildings found</h3>
                <p>We couldn't find a building at that address. You can be the first to add it!</p>
              </div>
            )}
          </div>

          {/* Create Building Option */}
          {hasSearched && searchQuery.length >= 3 && (
            <button className="create-building-btn" onClick={handleCreateBuilding}>
              <div className="create-icon">
                <Plus size={20} />
              </div>
              <div className="create-content">
                <span className="create-label">Don't see your building?</span>
                <span className="create-action">Add it to Community</span>
              </div>
              <ArrowRight size={18} className="create-arrow" />
            </button>
          )}

          {/* Help Text */}
          {!hasSearched && (
            <div className="search-tips">
              <p><strong>Tips:</strong></p>
              <ul>
                <li>Try entering your street address</li>
                <li>Include city or zip code for better results</li>
                <li>Try the building name if you know it</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResidentAddressSearch
