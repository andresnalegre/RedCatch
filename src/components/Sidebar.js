import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { setCurrentCategory } from '../../features/posts/postsSlice';

const SidebarContainer = styled.div`
  width: 250px;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 90px;
`;

const Section = styled.div`
  margin-bottom: 1.5rem;
`;

const Title = styled.h3`
  margin-bottom: 1rem;
  color: #1a1a1b;
  font-size: 1.2rem;
  font-weight: 500;
`;

const Button = styled.button`
  display: block;
  width: 100%;
  padding: 0.8rem 1rem;
  margin: 0.5rem 0;
  border: none;
  background: ${props => props.active ? '#ff4500' : '#f6f7f8'};
  color: ${props => props.active ? 'white' : '#1a1a1b'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.95rem;
  text-align: left;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? '#ff4500' : '#e1e2e3'};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const categories = [
  { id: 'popular', name: 'Popular' },
  { id: 'all', name: 'All' },
  { id: 'gaming', name: 'Gaming' },
  { id: 'news', name: 'News' },
  { id: 'sports', name: 'Sports' },
  { id: 'technology', name: 'Technology' },
  { id: 'programming', name: 'Programming' }
];

const Sidebar = () => {
  const dispatch = useDispatch();
  const currentCategory = useSelector(state => state.posts.currentCategory);

  const handleCategoryClick = (categoryId) => {
    dispatch(setCurrentCategory(categoryId));
  };

  return (
    <SidebarContainer>
      <Section>
        <Title>Categories</Title>
        {categories.map((category) => (
          <Button
            key={category.id}
            active={currentCategory === category.id}
            onClick={() => handleCategoryClick(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </Section>
    </SidebarContainer>
  );
};

export default React.memo(Sidebar);