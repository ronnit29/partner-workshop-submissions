import React, { useState } from 'react';

interface AccountFiltersProps {
  onFilterChange: (filters: FilterCriteria) => void;
}

interface FilterCriteria {
  region: string;
  sector: string;
}

const AccountFilters: React.FC<AccountFiltersProps> = ({ onFilterChange }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('');
  
  // Map of regions to their corresponding sectors
  const sectorsByRegion: Record<string, string[]> = {
    'APAC': ['Technology', 'Manufacturing', 'Finance'],
    'EMEA': ['Healthcare', 'Retail', 'Energy'],
    'Americas': ['Education', 'Government', 'Services']
  };

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedSector(''); // Reset sector when region changes
    onFilterChange({ region, sector: '' });
  };

  const handleSectorChange = (sector: string) => {
    setSelectedSector(sector);
    onFilterChange({ region: selectedRegion, sector });
  };

  return (
    <div className="filters-container">
      <select 
        value={selectedRegion} 
        onChange={(e) => handleRegionChange(e.target.value)}
      >
        <option value="">Select Region</option>
        {Object.keys(sectorsByRegion).map(region => (
          <option key={region} value={region}>{region}</option>
        ))}
      </select>

      <select 
        value={selectedSector}
        onChange={(e) => handleSectorChange(e.target.value)}
        disabled={!selectedRegion}
      >
        <option value="">Select Sector</option>
        {selectedRegion && sectorsByRegion[selectedRegion].map(sector => (
          <option key={sector} value={sector}>{sector}</option>
        ))}
      </select>
    </div>
  );
};

export default AccountFilters; 