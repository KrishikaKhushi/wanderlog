import { useState } from 'react';

export const useCountrySearch = (countryLabels, onCountrySelect) => {
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    const filtered = countryLabels.filter((c) =>
      c.name.toLowerCase().startsWith(val.toLowerCase())
    );
    setSuggestions(filtered.slice(0, 8));
  };

  const handleSuggestionClick = (countryName) => {
    setSearchInput(countryName);
    setSuggestions([]);
    onCountrySelect(countryName);
  };

  return {
    searchInput,
    suggestions,
    handleSearchChange,
    handleSuggestionClick
  };
};