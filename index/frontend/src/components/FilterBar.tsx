import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './FilterBar.css';

// Info icon component with tooltip that positions itself correctly
const InfoIconWithTooltip: React.FC = () => {
  const iconRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);

  const updateTooltipPosition = () => {
    if (!iconRef.current || !tooltipRef.current) return;
    
    const iconRect = iconRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current;
    const header = document.querySelector('.app-header');
    const headerRect = header?.getBoundingClientRect();
    
    // Calculate tooltip height (approximate)
    const tooltipHeight = 60; // Approximate height including padding
    
    // Position tooltip above the icon
    let tooltipTop = iconRect.top - tooltipHeight - 8;
    let transform = 'translate(-50%, -100%)';
    
    // If tooltip would overlap with header, position it below the header instead
    if (headerRect && tooltipTop < headerRect.bottom + 8) {
      tooltipTop = headerRect.bottom + 8;
      transform = 'translate(-50%, 0)';
      tooltip.setAttribute('data-position', 'below-header');
    } else {
      tooltip.removeAttribute('data-position');
    }
    
    tooltip.style.left = `${iconRect.left + iconRect.width / 2}px`;
    tooltip.style.top = `${tooltipTop}px`;
    tooltip.style.transform = transform;
  };

  const handleMouseEnter = () => {
    updateTooltipPosition();
  };

  const handleMouseMove = () => {
    updateTooltipPosition();
  };

  return (
    <span 
      className="info-icon" 
      ref={iconRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
    >
      <span className="info-icon-text">?</span>
      <span 
        className="info-tooltip" 
        ref={tooltipRef}
      >
        Code repository was verified via GitHub API to have requirements.txt/environment.yml and entry points
      </span>
    </span>
  );
};

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void;
  filters?: FilterState; // Optional prop to sync with parent state
}

export interface FilterState {
  searchText: string;
  topics: string[];
  dataTypes: string[];
  modelTypes: string[];
  metrics: string[];
  verifiedOnly: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({ onFilterChange, filters: externalFilters }) => {
  // Use local state only for available options and UI state (dropdown open/closed)
  // Filter state is derived from externalFilters prop
  const [showTopicsDropdown, setShowTopicsDropdown] = useState(false);
  
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [availableDataTypes, setAvailableDataTypes] = useState<string[]>([]);
  const [availableModelTypes, setAvailableModelTypes] = useState<string[]>([]);
  const [availableMetrics, setAvailableMetrics] = useState<string[]>([]);
  
  // Default empty filter state if not provided
  const currentFilters = externalFilters || {
    searchText: '',
    topics: [],
    dataTypes: [],
    modelTypes: [],
    metrics: [],
    verifiedOnly: false
  };

  const { searchText, topics, dataTypes, modelTypes, metrics, verifiedOnly } = currentFilters;

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await axios.get('/tasks/filters/metadata');
        setAvailableTopics(response.data.topics || []);
        setAvailableDataTypes(response.data.data_types || []);
        setAvailableModelTypes(response.data.model_types || []);
        setAvailableMetrics(response.data.metrics || []);
      } catch (error) {
        console.error('Error fetching filter metadata:', error);
      }
    };
    fetchMetadata();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showTopicsDropdown && !target.closest('.dropdown-wrapper')) {
        setShowTopicsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTopicsDropdown]);

  const updateFilters = (updates: Partial<FilterState>) => {
    const newFilters = { ...currentFilters, ...updates };
    onFilterChange(newFilters);
  };

  const toggleTag = (value: string, current: string[], key: keyof FilterState) => {
    const newValues = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    
    updateFilters({ [key]: newValues });
  };

  const toggleTopic = (topic: string) => {
    toggleTag(topic, topics, 'topics');
  };

  return (
    <div className="filter-bar">
      {/* Row 1: Search, Verified, and Clear Filters */}
      <div className="filter-row">
        <div className="filter-group">
          <input
            type="search"
            placeholder="Search tasks..."
            value={searchText}
            onChange={(e) => updateFilters({ searchText: e.target.value })}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => updateFilters({ verifiedOnly: e.target.checked })}
            />
            Verified Code
            <InfoIconWithTooltip />
          </label>
        </div>

        <button
          onClick={() => {
            onFilterChange({
              searchText: '',
              topics: [],
              dataTypes: [],
              modelTypes: [],
              metrics: [],
              verifiedOnly: false
            });
          }}
          className="clear-filters-btn"
          disabled={topics.length === 0 && dataTypes.length === 0 && modelTypes.length === 0 && metrics.length === 0 && !verifiedOnly && !searchText}
        >
          Clear Filters
        </button>
      </div>

      {/* Row 3: Data Types */}
      <div className="filter-row">
        <div className="filter-group tag-group">
          <span className="tag-label">Data Types:</span>
          <div className="tag-list">
            {availableDataTypes.slice(0, 10).map(dt => (
              <button
                key={dt}
                className={`tag ${dataTypes.includes(dt) ? 'active' : ''}`}
                onClick={() => toggleTag(dt, dataTypes, 'dataTypes')}
              >
                {dt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Model Types */}
      <div className="filter-row">
        <div className="filter-group tag-group">
          <span className="tag-label">Model Types:</span>
          <div className="tag-list">
            {availableModelTypes.slice(0, 10).map(mt => (
              <button
                key={mt}
                className={`tag ${modelTypes.includes(mt) ? 'active' : ''}`}
                onClick={() => toggleTag(mt, modelTypes, 'modelTypes')}
              >
                {mt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 5: Metrics */}
      <div className="filter-row">
        <div className="filter-group tag-group">
          <span className="tag-label">Metrics:</span>
          <div className="tag-list">
            {availableMetrics.slice(0, 10).map(m => (
              <button
                key={m}
                className={`tag ${metrics.includes(m) ? 'active' : ''}`}
                onClick={() => toggleTag(m, metrics, 'metrics')}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 6: Topics (dropdown only) */}
      <div className="filter-row">
        <div className="filter-group dropdown-wrapper">
          <span className="filter-label">Topics:</span>
          <button 
            className="dropdown-trigger topics-dropdown-btn"
            onClick={() => setShowTopicsDropdown(!showTopicsDropdown)}
          >
            {topics.length === 0 ? 'Select topics...' : `${topics.length} selected`} ▼
          </button>
          {showTopicsDropdown && (
            <div className="dropdown-menu topics-dropdown-menu">
              {availableTopics.map(topic => (
                <label key={topic} className="dropdown-checkbox">
                  <input
                    type="checkbox"
                    checked={topics.includes(topic)}
                    onChange={() => toggleTopic(topic)}
                  />
                  {topic}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
