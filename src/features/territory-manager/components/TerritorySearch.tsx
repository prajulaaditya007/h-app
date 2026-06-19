import React, { useEffect, useRef, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store';
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
} from '../store/territorySlice';
import { Search } from './common/Search';

/**
 * Global search card.
 * Types in the search box → debounced fetch to /api/searchResults → dropdown of banks.
 * Selecting a bank → fetch /api/bankresults → loads hierarchy into Redux.
 */
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

  // Debounced search — triggered from onChange, not from an effect
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

  // Close dropdown on outside click
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
    <div className="card shadow-sm border-light mb-4 p-3 bg-white" ref={containerRef}>
      <div className="row align-items-center g-3">
        <div className="col-12 col-md-5 position-relative">
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

          {/* Autocomplete dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <ul
              className="list-group position-absolute w-100 shadow-sm border mt-1"
              style={{ zIndex: 1050, maxHeight: '200px', overflowY: 'auto' }}
            >
              {searchResults.map((bank) => (
                <li
                  key={bank.id}
                  className="list-group-item list-group-item-action d-flex align-items-center gap-2"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSelectBank(bank.id)}
                >
                  <span className="badge bg-primary-subtle text-primary-emphasis rounded-pill">🏦</span>
                  <span className="fw-semibold">{bank.name}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="position-absolute w-100 mt-1 text-center py-2">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <span className="ms-2 text-muted small">Loading bank data...</span>
            </div>
          )}
        </div>

        <div className="col-12 col-md-7 d-flex align-items-center gap-4">
          {(['individual', 'branch'] as const).map((type) => (
            <div className="form-check" key={type}>
              <input
                className="form-check-input"
                type="radio"
                name="searchType"
                id={`search-${type}`}
                checked={searchType === type}
                onChange={() => dispatch(setSearchType(type))}
              />
              <label className="form-check-label fw-bold text-dark" htmlFor={`search-${type}`} style={{ cursor: 'pointer' }}>
                {type === 'individual' ? 'Individual ID' : 'Branch ID'}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
