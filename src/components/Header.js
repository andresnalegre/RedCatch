import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { AnimatePresence } from 'framer-motion';
import { searchPosts, fetchPosts, clearSearch } from '../features/posts/postsSlice';
import debounce from 'lodash/debounce';
import RedcatchLogo from '../assets/Redcatch.png';
import About from './About';

const HeaderContainer = styled.header`
  background-color: #ffffff;
  padding: 0 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 72px;
  transform: translateZ(0);
  will-change: transform;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: 60px;
    padding: 0 14px;
    gap: 10px;
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
  height: 48px;
  width: auto;
  object-fit: contain;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    height: 36px;
  }
`;



const RightSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;

  @media (max-width: 768px) {
    gap: 6px;
    flex-shrink: 0;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 420px;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    flex: 1;
    width: auto;
    min-width: 0;
  }
`;

const SearchInput = styled.input`
  padding: 0.55rem 2.8rem 0.55rem 1.25rem;
  border: 1.5px solid #e8e8e8;
  border-radius: 24px;
  width: 100%;
  font-size: 0.95rem;
  background: #f6f7f8;
  color: #1a1a1b;
  transition: all 0.25s ease;

  &::placeholder {
    color: #aaa;
  }

  &:focus {
    outline: none;
    background: #ffffff;
    border-color: #ff4500;
    box-shadow: 0 0 0 3px rgba(255, 69, 0, 0.1);
  }

  &:disabled {
    opacity: 0.5;
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

const InfoButton = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1.5px solid #e0e0e0;
  background: #ffffff;
  color: #ff4500;
  font-size: 0.8rem;
  font-weight: 700;
  font-style: italic;
  font-family: Georgia, 'Times New Roman', serif;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  letter-spacing: -0.5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  transition: all 0.2s ease;

  &:hover {
    background: #ff4500;
    color: #ffffff;
    border-color: #ff4500;
    box-shadow: 0 3px 10px rgba(255,69,0,0.3);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 4px rgba(255,69,0,0.2);
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
  const [showAbout, setShowAbout] = useState(false);
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
    <>
      <HeaderContainer>
        <LogoContainer href="/" onClick={handleLogoClick}>
          <LogoImage src={RedcatchLogo} alt="RedCatch Logo" />
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

        <RightSection>
          <InfoButton onClick={() => setShowAbout(true)} title="About RedCatch">
            i
          </InfoButton>
        </RightSection>
      </HeaderContainer>

      <AnimatePresence>
        {showAbout && <About onClose={() => setShowAbout(false)} />}
      </AnimatePresence>
    </>
  );
};

export default React.memo(Header);