import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { searchPosts, fetchPosts, clearSearch } from '../features/posts/postsSlice';
import debounce from 'lodash/debounce';
import RedcatchLogo from '../assets/Redcatch.png';

const HeaderContainer = styled.header`
  background-color: #ffffff;
  padding: 0.75rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 80px;
  transform: translateZ(0);
  will-change: transform;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: auto;
    padding: 0.75rem 1rem;
    gap: 0.5rem;
    transform: translateZ(0);
    will-change: transform;
  }
`;

const LogoContainer = styled.a`
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;

  &:hover {
    opacity: 0.8;
    transform: scale(1.02);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const LogoImage = styled.img`
  height: 100px;
  width: auto;
  object-fit: contain;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    height: 60px;
  }
`;

const Logo = styled.h1`
  color: #FF4500;
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0;
  font-family: Arial, sans-serif;
  user-select: none;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 300px;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SearchInput = styled.input`
  padding: 0.5rem 2.5rem 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #ff4500;
    box-shadow: 0 2px 4px rgba(255, 69, 0, 0.1);
    transform: translateY(-1px);
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const SearchIcon = styled.span`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: #ff4500;
    transform: translateY(-50%) scale(1.1);
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }
`;

const ErrorMessage = styled.div`
  color: red;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const Header = () => {
  const dispatch = useDispatch();
  const [searchInput, setSearchInput] = useState('');
  const [error, setError] = useState(null);
  const currentCategory = useSelector(state => state.posts.currentCategory);
  const loading = useSelector(state => state.posts.loading);
  const debouncedSearchRef = useRef();

  const performSearch = useCallback(async (term) => {
    try {
      setError(null);
      if (term.trim().length >= 3) {
        await dispatch(searchPosts({ searchTerm: term, category: currentCategory })).unwrap();
      } else if (term.trim().length === 0) {
        dispatch(clearSearch());
        await dispatch(fetchPosts({ category: currentCategory })).unwrap();
      }
    } catch (err) {
      setError(err.message || 'An error occurred while searching');
    }
  }, [dispatch, currentCategory]);

  useEffect(() => {
    debouncedSearchRef.current = debounce((term) => {
      performSearch(term);
    }, 500);

    return () => {
      if (debouncedSearchRef.current) {
        debouncedSearchRef.current.cancel();
      }
    };
  }, [performSearch]);

  useEffect(() => {
    setSearchInput('');
    dispatch(clearSearch());
  }, [currentCategory, dispatch]);

  const handleSearch = useCallback((e) => {
    const newSearchTerm = e.target.value;
    setSearchInput(newSearchTerm);

    if (newSearchTerm.trim().length === 0) {
      if (debouncedSearchRef.current) {
        debouncedSearchRef.current.cancel();
      }
      performSearch('');
    } else {
      debouncedSearchRef.current(newSearchTerm);
    }
  }, [performSearch]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (debouncedSearchRef.current) {
        debouncedSearchRef.current.cancel();
      }
      performSearch(searchInput);
    }
  }, [performSearch, searchInput]);

  const handleLogoClick = useCallback((e) => {
    e.preventDefault();
    window.location.reload();
  }, []);

  return (
    <HeaderContainer>
      <LogoContainer href="/" onClick={handleLogoClick}>
        <LogoImage src={RedcatchLogo} alt="RedCatch Logo" />
        <Logo>RedCatch</Logo>
      </LogoContainer>
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder={`Search in ${currentCategory}...`}
          value={searchInput}
          onChange={handleSearch}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <SearchIcon
          onClick={() => !loading && performSearch(searchInput)}
          style={{ opacity: loading ? 0.5 : 1 }}
        >
          🔍
        </SearchIcon>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </SearchContainer>
    </HeaderContainer>
  );
};

export default React.memo(Header);