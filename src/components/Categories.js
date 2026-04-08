import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { setCurrentCategory, clearSearch } from '../features/posts/postsSlice';

const CategoryContainer = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 90px;
  height: auto;
  max-height: 420px;

  @media (max-width: 768px) {
    position: fixed;
    top: 155px;
    left: 0;
    right: 0;
    z-index: 998;
    border-radius: 0 0 8px 8px;
    display: ${props => props.open ? 'block' : 'none'};
    max-height: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const CategoryTitle = styled.h2`
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: #1a1a1b;
  font-weight: 600;

  @media (max-width: 768px) {
    display: none;
  }
`;

const CategoryList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
`;

const CategoryButton = styled.button`
  display: block;
  width: 100%;
  padding: 0.8rem 1rem;
  border: none;
  border-radius: 4px;
  background: ${props => props.active ? '#ff4500' : '#f6f7f8'};
  color: ${props => props.active ? 'white' : '#1a1a1b'};
  font-size: 0.95rem;
  text-align: left;
  transition: all 0.2s ease;
  cursor: pointer;
  font-weight: ${props => props.active ? '600' : '400'};

  &:hover {
    background: ${props => props.active ? '#ff4500' : '#e1e2e3'};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const HamburgerButton = styled.button`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    position: fixed;
    top: 120px;
    left: 0;
    right: 0;
    z-index: 999;
    background: white;
    border: none;
    border-bottom: 1px solid #edeff1;
    padding: 0.75rem 1rem;
    font-size: 0.95rem;
    font-weight: 600;
    color: #1a1a1b;
    cursor: pointer;
    width: 100%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  }
`;

const HamburgerIcon = styled.span`
  font-size: 1.2rem;
`;

const ActiveLabel = styled.span`
  color: #ff4500;
`;

const Overlay = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: ${props => props.open ? 'block' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 997;
    background: rgba(0, 0, 0, 0.3);
  }
`;

const categories = [
  { id: 'popular', name: 'Popular' },
  { id: 'all', name: 'All' },
  { id: 'gaming', name: 'Gaming' },
  { id: 'sports', name: 'Sports' },
  { id: 'news', name: 'News' },
  { id: 'technology', name: 'Technology' },
  { id: 'programming', name: 'Programming' }
];

function Categories() {
  const dispatch = useDispatch();
  const currentCategory = useSelector(state => state.posts.currentCategory);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleCategoryClick = (categoryId) => {
    if (categoryId !== currentCategory) {
      dispatch(clearSearch());
      dispatch(setCurrentCategory(categoryId));
    }
    setMenuOpen(false);
  };

  const currentLabel = categories.find(c => c.id === currentCategory)?.name || 'Popular';

  return (
    <>
      <HamburgerButton onClick={() => setMenuOpen(prev => !prev)}>
        <HamburgerIcon>{menuOpen ? '✕' : '☰'}</HamburgerIcon>
        Category: <ActiveLabel>{currentLabel}</ActiveLabel>
      </HamburgerButton>

      <Overlay open={menuOpen} onClick={() => setMenuOpen(false)} />

      <CategoryContainer open={menuOpen}>
        <CategoryTitle>Categories</CategoryTitle>
        <CategoryList>
          {categories.map(category => (
            <CategoryButton
              key={category.id}
              active={currentCategory === category.id}
              onClick={() => handleCategoryClick(category.id)}
            >
              {category.name}
            </CategoryButton>
          ))}
        </CategoryList>
      </CategoryContainer>
    </>
  );
}

export default React.memo(Categories);