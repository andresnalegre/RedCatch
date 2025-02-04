import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled, { createGlobalStyle } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPosts } from '../features/posts/postsSlice';
import PostDetail from '../components/PostDetail';

const GlobalStyle = createGlobalStyle`
  body {
    overflow: ${props => props.modalOpen ? 'hidden' : 'auto'};
  }
`;

const PostsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-right: 1rem;
  overflow-y: auto;
  overflow-x: hidden;
  height: calc(100vh - 140px);

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const PostCard = styled(motion.div)`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

const PostTitle = styled.h3`
  margin-bottom: 0.5rem;
  color: #1a1a1b;
  font-size: 1.1rem;
  line-height: 1.4;
`;

const PostMetadata = styled.div`
  display: flex;
  gap: 1rem;
  color: #787c7e;
  font-size: 0.9rem;
  flex-wrap: wrap;
  align-items: center;
`;

const MetadataItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const PostImage = styled.img`
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin-top: 1rem;
  object-fit: cover;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: #1a1a1b;
  font-size: 1.1rem;
`;

const ErrorContainer = styled.div`
  background: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  text-align: center;
`;

const PostsHeader = styled.div`
  position: sticky;
  top: 0;
  width: 880px;
  background: #f6f7f8;
  padding: 1rem 0;
  margin-bottom: 1rem;
  z-index: 1;
`;

const NoPostsMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

function PostsList() {
  const dispatch = useDispatch();
  const { items, loading, error, currentCategory, after } = useSelector(state => state.posts);
  const searchTerm = useSelector(state => state.filters.searchTerm);
  const observerTarget = useRef(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const getTitle = () => {
    switch (currentCategory) {
      case 'popular':
        return 'Popular Posts';
      case 'all':
        return 'All Posts';
      default:
        return `${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)} Posts`;
    }
  };

  const loadMorePosts = useCallback(() => {
    if (!loading && after) {
      dispatch(fetchPosts({ category: currentCategory, after }));
    }
  }, [loading, after, currentCategory, dispatch]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !loading) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMorePosts, loading]);

  const filteredPosts = useMemo(() => {
    let filtered = items;
    
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [items, searchTerm]);

  const handlePostClick = useCallback((post) => {
    setSelectedPost(post);
  }, []);

  if (error) {
    return (
      <ErrorContainer>
        <h3>Error</h3>
        <p>{error}</p>
      </ErrorContainer>
    );
  }

  if (filteredPosts.length === 0 && !loading) {
    return (
      <NoPostsMessage>
        {searchTerm ? 'No posts found matching your search.' : 'No posts available.'}
      </NoPostsMessage>
    );
  }

  return (
    <>
      <GlobalStyle modalOpen={!!selectedPost} />
      <PostsContainer>
        <PostsHeader>
          <h2>{getTitle()}</h2>
        </PostsHeader>
        <AnimatePresence mode="wait">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              whileHover={{ scale: 1.01, translateY: -2 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              onClick={() => handlePostClick(post)}
            >
              <PostTitle>{post.title}</PostTitle>
              <PostMetadata>
                <MetadataItem>
                  👤 u/{post.author}
                </MetadataItem>
                <MetadataItem>
                  📚 r/{post.subreddit}
                </MetadataItem>
                <MetadataItem>
                  ⬆️ {new Intl.NumberFormat().format(post.score)} points
                </MetadataItem>
                <MetadataItem>
                  💬 {new Intl.NumberFormat().format(post.num_comments)} comments
                </MetadataItem>
              </PostMetadata>
              {post.thumbnail && post.thumbnail !== 'self' && (
                <PostImage 
                  src={post.thumbnail} 
                  alt="" 
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
            </PostCard>
          ))}
        </AnimatePresence>
        <div ref={observerTarget}>
          {loading && (
            <LoadingContainer>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Loading more posts...
              </motion.div>
            </LoadingContainer>
          )}
        </div>

        <AnimatePresence>
          {selectedPost && (
            <PostDetail
              post={selectedPost}
              onClose={() => setSelectedPost(null)}
            />
          )}
        </AnimatePresence>
      </PostsContainer>
    </>
  );
}

export default React.memo(PostsList);