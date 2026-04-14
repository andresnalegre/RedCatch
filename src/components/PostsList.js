import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPosts, selectSearchTerm, selectErrorType, selectIsSearching } from '../features/posts/postsSlice';
import PostDetail from '../components/PostDetail';

const GlobalStyle = createGlobalStyle`
  body {
    overflow: ${props => props.modalOpen ? 'hidden' : 'auto'};
  }
`;

const shimmer = keyframes`
  0% { background-position: -600px 0; }
  100% { background-position: 600px 0; }
`;

const SkeletonBase = styled.div`
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 600px 100%;
  animation: ${shimmer} 1.4s infinite linear;
  border-radius: 4px;
`;

const SkeletonLine = styled(SkeletonBase)`
  height: ${props => props.height || '14px'};
  width: ${props => props.width || '100%'};
  margin-bottom: ${props => props.mb || '8px'};
`;

const SkeletonCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SkeletonMeta = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  width: 36px;
  height: 36px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ff4500;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
  margin: 2rem auto;
`;

const PostsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

const ErrorContainer = styled.div`
  background: ${props => props.rateLimit ? '#fff8e1' : '#ffebee'};
  color: ${props => props.rateLimit ? '#e65100' : '#c62828'};
  border: 1px solid ${props => props.rateLimit ? '#ffe082' : '#ef9a9a'};
  padding: 1.5rem;
  border-radius: 8px;
  margin: 1rem 0;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const ErrorTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
`;

const ErrorMessage = styled.p`
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  opacity: 0.85;
`;

const RetryButton = styled.button`
  padding: 0.6rem 1.5rem;
  background: #ff4500;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #cc3700;
  }
`;

const PostsHeader = styled.div`
  width: 100%;
  padding: 1rem 0;
  margin-bottom: 1rem;
`;

const NoPostsMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const PostCardSkeleton = () => (
  <SkeletonCard>
    <SkeletonLine height="18px" width="85%" mb="12px" />
    <SkeletonLine height="18px" width="60%" mb="16px" />
    <SkeletonMeta>
      <SkeletonLine height="12px" width="80px" mb="0" />
      <SkeletonLine height="12px" width="80px" mb="0" />
      <SkeletonLine height="12px" width="80px" mb="0" />
    </SkeletonMeta>
  </SkeletonCard>
);

function PostsList() {
  const dispatch = useDispatch();
  const { items, loading, error, currentCategory, after } = useSelector(state => state.posts);
  const searchTerm = useSelector(selectSearchTerm);
  const errorType = useSelector(selectErrorType);
  const isSearching = useSelector(selectIsSearching);
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
    if (!loading && after && !searchTerm && !isSearching) {
      dispatch(fetchPosts({ category: currentCategory, after }));
    }
  }, [loading, after, currentCategory, dispatch, searchTerm, isSearching]);

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
    if (!searchTerm) return items;
    return items.filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  const handlePostClick = useCallback((post) => {
    setSelectedPost(post);
  }, []);

  const handleRetry = useCallback(() => {
    dispatch(fetchPosts({ category: currentCategory }));
  }, [dispatch, currentCategory]);

  if (error) {
    const isRateLimit = errorType === 'rate_limit';
    return (
      <ErrorContainer rateLimit={isRateLimit}>
        <ErrorIcon>{isRateLimit ? '⏱️' : '⚠️'}</ErrorIcon>
        <ErrorTitle>
          {isRateLimit ? 'Reddit API rate limit reached' : 'Failed to load posts'}
        </ErrorTitle>
        <ErrorMessage>
          {isRateLimit
            ? 'Too many requests were made to the Reddit API. Please wait a few seconds and try again.'
            : 'Something went wrong while fetching posts. Please try again.'}
        </ErrorMessage>
        <RetryButton onClick={handleRetry}>Try again</RetryButton>
      </ErrorContainer>
    );
  }

  if (loading && items.length === 0) {
    return (
      <PostsContainer>
        <PostsHeader>
          <h2>{getTitle()}</h2>
        </PostsHeader>
        {[1, 2, 3, 4, 5].map(i => (
          <PostCardSkeleton key={i} />
        ))}
      </PostsContainer>
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
                <MetadataItem>👤 u/{post.author}</MetadataItem>
                <MetadataItem>📚 r/{post.subreddit}</MetadataItem>
                <MetadataItem>⬆️ {new Intl.NumberFormat().format(post.score)} points</MetadataItem>
                <MetadataItem>💬 {new Intl.NumberFormat().format(post.num_comments)} comments</MetadataItem>
              </PostMetadata>
              {post.thumbnail &&
                post.thumbnail !== 'self' &&
                post.thumbnail !== 'default' &&
                post.thumbnail !== 'nsfw' &&
                post.thumbnail !== 'spoiler' &&
                post.thumbnail.startsWith('http') && (
                <PostImage
                  src={post.thumbnail}
                  alt=""
                  loading="lazy"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
            </PostCard>
          ))}
        </AnimatePresence>
        <div ref={observerTarget}>
          {loading && <Spinner />}
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