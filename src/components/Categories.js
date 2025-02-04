import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { fetchPosts, setCurrentCategory } from '../features/posts/postsSlice';

const CategoryContainer = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 90px;
  height: auto;
  max-height: 420px;
`;

const CategoryTitle = styled.h2`
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: #1a1a1b;
  font-weight: 600;
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

const categories = [
  { id: 'popular', name: 'Popular' },
  { id: 'all', name: 'All' },
  { id: 'gaming', name: 'Gaming', subreddits: ['gaming', 'Games', 'pcgaming', 'GameDeals', 'Steam', 'videogames', 'esports', 'gamernews'] },
  { id: 'sports', name: 'Sports', subreddits: ['sports', 'nba', 'soccer', 'nfl', 'baseball', 'hockey', 'formula1', 'MMA', 'tennis', 'basketball'] },
  { id: 'news', name: 'News', subreddits: ['news', 'worldnews', 'politics', 'technews', 'UpliftingNews', 'science', 'business', 'economics'] },
  { id: 'technology', name: 'Technology', subreddits: ['technology', 'tech', 'gadgets', 'hardware', 'artificial', 'Futurology', 'cybersecurity'] },
  { id: 'programming', name: 'Programming', subreddits: ['programming', 'coding', 'webdev', 'learnprogramming', 'javascript', 'reactjs', 'python', 'node', 'typescript', 'java', 'csharp', 'cpp', 'golang', 'rust', 'programminghumor'] }
];

function Categories() {
  const dispatch = useDispatch();
  const currentCategory = useSelector(state => state.posts.currentCategory);

  const handleCategoryClick = async (categoryId) => {
    if (categoryId !== currentCategory) {
      dispatch(setCurrentCategory(categoryId));
      await dispatch(fetchPosts({ 
        category: categoryId,
        after: null
      }));
    }
  };

  return (
    <CategoryContainer>
      <CategoryTitle>Categories</CategoryTitle>
      <CategoryList>
        {categories.map(category => (
          <CategoryButton
            key={category.id}
            active={currentCategory === category.id}
            onClick={() => handleCategoryClick(category.id)}
            title={category.subreddits ? `Includes: ${category.subreddits.join(', ')}` : ''}
          >
            {category.name}
          </CategoryButton>
        ))}
      </CategoryList>
    </CategoryContainer>
  );
}

export default React.memo(Categories);