import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { setCurrentCategory, clearSearch } from '../features/posts/postsSlice';

const CategoryContainer = styled.div`
  background: white;
  padding: 0.75rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f0;
  position: sticky;
  top: 84px;
  height: fit-content;

  @media (max-width: 768px) {
    position: fixed;
    top: 100px;
    left: 0;
    right: 0;
    z-index: 998;
    border-radius: 0 0 12px 12px;
    border: none;
    border-bottom: 1px solid #f0f0f0;
    display: ${props => props.open ? 'block' : 'none'};
    max-height: none;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  }
`;

const CategoryTitle = styled.p`
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #aaa;
  padding: 4px 8px 10px;
  border-bottom: 1px solid #f4f4f4;
  margin-bottom: 6px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const CategoryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 0.55rem 0.75rem;
  border: 1px solid ${props => props.active ? 'rgba(255,69,0,0.2)' : 'transparent'};
  border-radius: 8px;
  background: ${props => props.active ? 'rgba(255, 69, 0, 0.08)' : 'transparent'};
  color: ${props => props.active ? '#ff4500' : '#444'};
  font-size: 0.9rem;
  text-align: left;
  cursor: pointer;
  font-weight: ${props => props.active ? '600' : '400'};
  transition: all 0.15s ease;

  &:hover {
    background: ${props => props.active ? 'rgba(255, 69, 0, 0.08)' : '#f6f7f8'};
    color: ${props => props.active ? '#ff4500' : '#111'};
  }
`;

const Dot = styled.span`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #ff4500;
  flex-shrink: 0;
  opacity: ${props => props.visible ? 1 : 0};
  transition: opacity 0.15s;
`;

const HamburgerButton = styled.button`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    gap: 8px;
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    z-index: 999;
    background: #ffffff;
    border: none;
    border-bottom: 1px solid #f0f0f0;
    border-top: 1px solid #f0f0f0;
    padding: 0.6rem 16px;
    font-size: 0.875rem;
    font-weight: 500;
    color: #444;
    cursor: pointer;
    width: 100%;
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
              <Dot visible={currentCategory === category.id} />
              {category.name}
            </CategoryButton>
          ))}
        </CategoryList>
      </CategoryContainer>
    </>
  );
}

export default React.memo(Categories);