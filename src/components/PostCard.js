import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectSearchTerm } from '../features/posts/postsSlice';

const Card = styled(motion.div)`
  background: white;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const Title = styled.h2`
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  line-height: 1.4;
  color: #1a1a1a;
`;

const Metadata = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const MetadataItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
`;

const Thumbnail = styled.img`
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin-top: 1rem;
  object-fit: cover;
`;

const HighlightedText = styled.span`
  background-color: rgba(255, 69, 0, 0.1);
  padding: 0 2px;
  border-radius: 2px;
  color: #ff4500;
`;

const PostCard = ({ post, onClick }) => {
  const searchTerm = useSelector(selectSearchTerm);

  const highlightText = (text) => {
    if (!searchTerm || !text) return text;
    
    const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? <HighlightedText key={i}>{part}</HighlightedText> : part
    );
  };

  const formatScore = (score) => {
    if (score >= 1000000) {
      return `${(score / 1000000).toFixed(1)}M`;
    } else if (score >= 1000) {
      return `${(score / 1000).toFixed(1)}K`;
    }
    return score;
  };

  const formatComments = (comments) => {
    if (comments >= 1000) {
      return `${(comments / 1000).toFixed(1)}K`;
    }
    return comments;
  };

  return (
    <Card
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      onClick={() => onClick(post)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Title>{highlightText(post.title)}</Title>
      <Metadata>
        <MetadataItem>
          <span>👤</span>
          Posted by u/{highlightText(post.author)}
        </MetadataItem>
        <MetadataItem>
          <span>📱</span>
          r/{highlightText(post.subreddit)}
        </MetadataItem>
        <MetadataItem>
          <span>⬆️</span>
          {formatScore(post.score)} points
        </MetadataItem>
        <MetadataItem>
          <span>💬</span>
          {formatComments(post.num_comments)} comments
        </MetadataItem>
      </Metadata>
      {post.thumbnail && post.thumbnail !== 'self' && post.thumbnail !== 'default' && (
        <Thumbnail 
          src={post.thumbnail} 
          alt={post.title}
          loading="lazy"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      )}
    </Card>
  );
};

export default React.memo(PostCard);