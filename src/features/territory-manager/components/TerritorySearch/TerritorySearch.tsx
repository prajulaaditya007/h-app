import React, { useEffect, useRef, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store';
import {
  setGlobalSearchQuery,
  setSearchType,
  setSearchResults,
  setSelectedBankName,
  setSelectedBankId,
  setHierarchyData,
  setUnassignedBranches,
  setShowPanel,
  setIsLoading,
} from '../../store/territorySlice';
import { Search } from '@/components/ui';
import './TerritorySearchStyles.css';

export const TerritorySearch: React.FC = () => {
  const dispatch = useAppDispatch();
  const globalSearchQuery = useAppSelector((s) => s.territory.globalSearchQuery);
  const searchType = useAppSelector((s) => s.territory.searchType);
  const searchResults = useAppSelector((s) => s.territory.searchResults);
  const isLoading = useAppSelector((s) => s.territory.isLoading);

  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchAbortControllerRef = useRef<AbortController | null>(null);
  const selectAbortControllerRef = useRef<AbortController | null>(null);

  // Clean up abort controllers on unmount
  useEffect(() => {
    return () => {
      if (searchAbortControllerRef.current) searchAbortControllerRef.current.abort();
      if (selectAbortControllerRef.current) selectAbortControllerRef.current.abort();
    };
  }, []);

  const handleSearchChange = (val: string) => {
    dispatch(setGlobalSearchQuery(val));

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchAbortControllerRef.current) searchAbortControllerRef.current.abort();

    const query = val.trim();
    if (!query) {
      dispatch(setSearchResults([]));
      setShowDropdown(false);
      return;
    }

    const controller = new AbortController();
    searchAbortControllerRef.current = controller;

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/searchResults?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        dispatch(setSearchResults(data.results ?? []));
        setShowDropdown(true);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error('Search failed:', err);
        dispatch(setSearchResults([]));
      }
    }, 300);
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelectBank = async (bankId: string) => {
    setShowDropdown(false);
    dispatch(setIsLoading(true));

    if (selectAbortControllerRef.current) selectAbortControllerRef.current.abort();
    const controller = new AbortController();
    selectAbortControllerRef.current = controller;

    try {
      const res = await fetch(`/api/bankresults?bankId=${encodeURIComponent(bankId)}`, {
        signal: controller.signal,
      });
      const data = await res.json();

      dispatch(setHierarchyData(data.hierarchy));
      dispatch(setUnassignedBranches(data.unassigned));
      dispatch(setSelectedBankName(data.bankName));
      dispatch(setSelectedBankId(bankId));
      dispatch(setGlobalSearchQuery(''));
      dispatch(setShowPanel(true));
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      console.error('Failed to load bank data:', err);
    } finally {
      if (!controller.signal.aborted) {
        dispatch(setIsLoading(false));
      }
    }
  };

  return (
    <div className="territory-search-card" ref={containerRef}>
      <div className="search-columns-wrapper">
        <div className="search-input-col">
          <Search
            id="global-search"
            label="Search"
            size="default"
            placeholder={
              searchType === 'individual'
                ? 'Search Institution or Bank name...'
                : 'Search Branch ID or name...'
            }
            value={globalSearchQuery}
            onChange={handleSearchChange}
            minChars={3}
          />

          {showDropdown && searchResults.length > 0 && (
            <ul className="autocomplete-dropdown">
              {searchResults.map((bank) => (
                <li
                  key={bank.id}
                  className="autocomplete-item"
                  onClick={() => handleSelectBank(bank.id)}
                >
                  <span className="autocomplete-icon-badge">🏦</span>
                  <span className="autocomplete-text">{bank.name}</span>
                </li>
              ))}
            </ul>
          )}

          {isLoading && (
            <div className="search-loading-container">
              <div className="spinner-border-sm" role="status" />
              <span className="search-loading-text">Loading bank data...</span>
            </div>
          )}
        </div>

        <div className="search-radio-col">
          {(['individual', 'branch'] as const).map((type) => (
            <div className="search-radio-group" key={type}>
              <input
                className="search-radio-input"
                type="radio"
                name="searchType"
                id={`search-${type}`}
                checked={searchType === type}
                onChange={() => dispatch(setSearchType(type))}
              />
              <label className="search-radio-label" htmlFor={`search-${type}`}>
                {type === 'individual' ? 'Individual ID' : 'Branch ID'}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
