import React, { useCallback, useMemo, useState } from 'react';
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
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 600px 100%;
  animation: ${shimmer} 1.4s infinite linear;
  border-radius: 6px;
`;

const SkeletonLine = styled(SkeletonBase)`
  height: ${props => props.height || '14px'};
  width: ${props => props.width || '100%'};
  margin-bottom: ${props => props.mb || '8px'};
`;

const SkeletonCard = styled.div`
  background: white;
  padding: 1.25rem 1.5rem;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
`;

const SkeletonMeta = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.75rem;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  width: 28px;
  height: 28px;
  border: 2.5px solid #f0f0f0;
  border-top: 2.5px solid #ff4500;
  border-radius: 50%;
  animation: ${spin} 0.75s linear infinite;
  margin: 0;
`;

const LoadMoreButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.75rem;
  margin-top: 4px;
  background: #ffffff;
  border: 1px solid #efefef;
  border-radius: 12px;
  color: #555;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.18s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);

  &:hover {
    border-color: rgba(255,69,0,0.25);
    color: #ff4500;
    box-shadow: 0 4px 12px rgba(255,69,0,0.08);
  }
`;

const PostsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const PostCard = styled(motion.div)`
  background: linear-gradient(135deg, #ffffff 0%, #fffaf9 100%);
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  border: 1px solid #f0ece9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03);
  cursor: pointer;
  transition: all 0.22s ease;

  &:hover {
    border-color: rgba(255, 69, 0, 0.18);
    box-shadow: 0 8px 24px rgba(255, 69, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
    background: linear-gradient(135deg, #ffffff 0%, #fff5f2 100%);
  }
`;

const PostTitle = styled.h3`
  margin-bottom: 0.6rem;
  color: #1a1a1b;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.45;
  letter-spacing: -0.01em;
`;

const PostMetadata = styled.div`
  display: flex;
  gap: 0;
  color: #999;
  font-size: 0.82rem;
  flex-wrap: wrap;
  align-items: center;
`;

const MetadataItem = styled.span`
  display: flex;
  align-items: center;
  gap: 3px;

  &:not(:last-child)::after {
    content: '·';
    margin: 0 7px;
    color: #ddd;
  }
`;

const PostImage = styled.img`
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin-top: 0.875rem;
  object-fit: cover;
  border: 1px solid #f0f0f0;
`;

const ErrorContainer = styled.div`
  background: ${props => props.rateLimit ? '#fffbeb' : '#fff5f5'};
  color: ${props => props.rateLimit ? '#b45309' : '#c0392b'};
  border: 1px solid ${props => props.rateLimit ? '#fde68a' : '#fca5a5'};
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 1.75rem;
  margin-bottom: 0.75rem;
`;

const ErrorTitle = styled.h3`
  margin: 0 0 0.4rem 0;
  font-size: 1rem;
  font-weight: 600;
`;

const ErrorMessage = styled.p`
  margin: 0 0 1.25rem 0;
  font-size: 0.875rem;
  opacity: 0.8;
`;

const RetryButton = styled.button`
  padding: 0.5rem 1.5rem;
  background: #ff4500;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover { background: #e03d00; }
`;

const PostsHeader = styled.div`
  padding: 4px 0 8px;
`;

const SectionTitle = styled.h2`
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #aaa;
`;

const NoPostsMessage = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: #999;
  background: white;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  font-size: 0.9rem;
`;

const PostCardSkeleton = () => (
  <SkeletonCard>
    <SkeletonLine height="16px" width="82%" mb="10px" />
    <SkeletonLine height="16px" width="58%" mb="16px" />
    <SkeletonMeta>
      <SkeletonLine height="11px" width="75px" mb="0" />
      <SkeletonLine height="11px" width="75px" mb="0" />
      <SkeletonLine height="11px" width="75px" mb="0" />
    </SkeletonMeta>
  </SkeletonCard>
);

function PostsList() {
  const dispatch = useDispatch();
  const { items, loading, error, currentCategory, after } = useSelector(state => state.posts);
  const searchTerm = useSelector(selectSearchTerm);
  const errorType = useSelector(selectErrorType);
  const isSearching = useSelector(selectIsSearching);
  const [selectedPost, setSelectedPost] = useState(null);

  const getTitle = () => {
    switch (currentCategory) {
      case 'popular': return 'Popular';
      case 'all':     return 'All';
      default:        return currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
    }
  };

  const handleLoadMore = useCallback(() => {
    if (!loading && after && !searchTerm && !isSearching)
      dispatch(fetchPosts({ category: currentCategory, after }));
  }, [loading, after, currentCategory, dispatch, searchTerm, isSearching]);

  const filteredPosts = useMemo(() => {
    if (!searchTerm) return items;
    return items.filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  const handlePostClick = useCallback((post) => setSelectedPost(post), []);
  const handleRetry = useCallback(() => dispatch(fetchPosts({ category: currentCategory })), [dispatch, currentCategory]);

  if (error) {
    const isRateLimit = errorType === 'rate_limit';
    return (
      <ErrorContainer rateLimit={isRateLimit}>
        <ErrorIcon>{isRateLimit ? '⏱️' : '⚠️'}</ErrorIcon>
        <ErrorTitle>{isRateLimit ? 'Rate limit reached' : 'Failed to load posts'}</ErrorTitle>
        <ErrorMessage>
          {isRateLimit
            ? 'Too many requests to the Reddit API. Wait a moment and try again.'
            : 'Something went wrong while fetching posts. Please try again.'}
        </ErrorMessage>
        <RetryButton onClick={handleRetry}>Try again</RetryButton>
      </ErrorContainer>
    );
  }

  if (loading && items.length === 0) {
    return (
      <PostsContainer>
        <PostsHeader><SectionTitle>{getTitle()}</SectionTitle></PostsHeader>
        {[1, 2, 3, 4, 5].map(i => <PostCardSkeleton key={i} />)}
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
        <PostsHeader><SectionTitle>{getTitle()}</SectionTitle></PostsHeader>
        <AnimatePresence mode="wait">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              onClick={() => handlePostClick(post)}
            >
              <PostTitle>{post.title}</PostTitle>
              <PostMetadata>
                <MetadataItem>u/{post.author}</MetadataItem>
                <MetadataItem>r/{post.subreddit}</MetadataItem>
                <MetadataItem>↑ {new Intl.NumberFormat().format(post.score)}</MetadataItem>
                <MetadataItem>💬 {new Intl.NumberFormat().format(post.num_comments)}</MetadataItem>
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
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem 0' }}>
            <Spinner />
          </div>
        )}
        {after && !searchTerm && !loading && (
          <LoadMoreButton onClick={handleLoadMore}>
            Load more
          </LoadMoreButton>
        )}

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