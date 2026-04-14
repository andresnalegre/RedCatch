import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { fetchPosts } from './features/posts/postsSlice';
import Categories from './components/Categories';
import PostsList from './components/PostsList';
import Header from './components/Header';
import Footer from './components/Footer';
import { motion, AnimatePresence } from 'framer-motion';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #f6f7f8;
  padding-top: 80px;
  padding-bottom: 50px;

  @media (max-width: 768px) {
    padding-top: 175px;
    padding-bottom: 50px;
  }
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 10px;
  }
`;

const ErrorBanner = styled(motion.div)`
  background-color: #ff4444;
  color: white;
  padding: 1rem;
  text-align: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;

function App() {
  const dispatch = useDispatch();
  const [error, setError] = useState(null);
  const { currentCategory } = useSelector(state => state.posts);

  useEffect(() => {
    const load = async () => {
      try {
        await dispatch(fetchPosts({ category: currentCategory })).unwrap();
      } catch (err) {
        setError('Failed to load posts. Please try again later.');
        setTimeout(() => setError(null), 5000);
      }
    };
    load();
  }, [currentCategory, dispatch]);

  return (
    <AppContainer>
      <AnimatePresence>
        {error && (
          <ErrorBanner
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            transition={{ type: 'spring', stiffness: 120 }}
          >
            {error}
          </ErrorBanner>
        )}
      </AnimatePresence>

      <Header />

      <MainContent>
        <Categories />
        <PostsList />
      </MainContent>

      <Footer />
    </AppContainer>
  );
}

export default React.memo(App);