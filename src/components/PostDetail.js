import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 1000;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  justify-content: center;

  @media (max-width: 768px) {
    padding: 0;
    background: #f6f7f8;
  }
`;

const DetailContainer = styled(motion.div)`
  background: white;
  width: 100%;
  max-width: 800px;
  margin: 60px auto;
  border-radius: 12px;
  padding: 30px;
  position: relative;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);

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

  @media (max-width: 768px) {
    margin: 0;
    border-radius: 0;
    padding: 16px;
    max-height: 100vh;
    min-height: 100vh;
    box-shadow: none;
  }
`;

const CloseButton = styled.button`
  position: sticky;
  top: 0;
  float: right;
  background: #f6f7f8;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  z-index: 2;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    color: #ff4500;
    background: rgba(255, 69, 0, 0.1);
  }

  @media (max-width: 768px) {
    position: fixed;
    top: 12px;
    right: 12px;
    float: none;
    background: white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  }
`;

const PostHeader = styled.div`
  margin-bottom: 20px;
  padding-right: 40px;

  h2 {
    margin: 0 0 12px 0;
    font-size: 1.4rem;
    line-height: 1.4;
    color: #1a1a1b;
    font-weight: 600;

    @media (max-width: 768px) {
      font-size: 1.2rem;
    }
  }
`;

const PostMetadata = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: #787c7e;
  font-size: 0.9rem;
  align-items: center;

  span {
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

const PostContent = styled.div`
  margin: 20px 0;
  font-size: 1rem;
  line-height: 1.7;
  color: #1a1a1b;
  white-space: pre-wrap;
  word-break: break-word;
`;

const PostLink = styled.a`
  display: block;
  color: #ff4500;
  font-size: 0.9rem;
  text-decoration: none;
  padding: 12px;
  margin: 16px 0;
  background: #f8f9fa;
  border-radius: 8px;
  word-break: break-all;
  transition: all 0.2s ease;

  &:hover {
    background: #ff45001a;
    color: #cc3700;
  }
`;

const PostImage = styled.img`
  max-width: 100%;
  height: auto;
  margin: 12px 0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const CommentsSection = styled.div`
  margin-top: 24px;
  border-top: 2px solid #eee;
  padding-top: 20px;

  h3 {
    font-size: 1.2rem;
    margin-bottom: 16px;
    color: #1a1a1b;
    font-weight: 600;
  }
`;

const Comment = styled.div`
  padding: 12px;
  margin: 8px 0;
  border-left: 3px solid ${props => props.depth === 0 ? '#ff4500' : '#ff45001a'};
  background: ${props => props.depth % 2 === 0 ? 'white' : '#f8f9fa'};
  margin-left: ${props => Math.min(props.depth * 16, 64)}px;
  border-radius: 6px;

  @media (max-width: 768px) {
    margin-left: ${props => Math.min(props.depth * 10, 40)}px;
  }
`;

const CommentHeader = styled.div`
  font-size: 0.85rem;
  color: #787c7e;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;

  strong {
    color: #1a1a1b;
    font-weight: 600;
  }
`;

const CommentBody = styled.div`
  font-size: 0.95rem;
  line-height: 1.6;
  color: #1a1a1b;
  white-space: pre-wrap;
  word-break: break-word;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  padding: 30px;
  color: #787c7e;
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  padding: 16px;
  text-align: center;
  background: #ffebee;
  border-radius: 8px;
  margin: 12px 0;
`;

const isValidThumbnail = (thumbnail) => {
  if (!thumbnail) return false;
  const invalid = ['self', 'default', 'nsfw', 'spoiler', ''];
  if (invalid.includes(thumbnail)) return false;
  return thumbnail.startsWith('http');
};

function PostDetail({ post, onClose }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://www.reddit.com/comments/${post.id}.json`
        );
        const fetchedComments = response.data[1].data.children
          .filter(child => child.kind === 't1')
          .map(child => child.data);
        setComments(fetchedComments);
        setLoading(false);
      } catch (err) {
        setError('Failed to load comments. Please try again later.');
        setLoading(false);
      }
    };
    fetchComments();
  }, [post.id]);

  const renderComment = (comment, depth = 0) => {
    if (!comment || !comment.body) return null;
    return (
      <div key={comment.id}>
        <Comment depth={depth}>
          <CommentHeader>
            <strong>u/{comment.author}</strong>
            <span>⬆️ {new Intl.NumberFormat().format(comment.score)}</span>
          </CommentHeader>
          <CommentBody>{comment.body}</CommentBody>
        </Comment>
        {comment.replies &&
          comment.replies.data?.children
            .filter(child => child.kind === 't1')
            .map(child => renderComment(child.data, depth + 1))}
      </div>
    );
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <Overlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleOverlayClick}
    >
      <DetailContainer
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
      >
        <CloseButton onClick={onClose}>✕</CloseButton>

        <PostHeader>
          <h2>{post.title}</h2>
          <PostMetadata>
            <span>u/{post.author}</span>
            <span>•</span>
            <span>r/{post.subreddit}</span>
            <span>•</span>
            <span>⬆️ {new Intl.NumberFormat().format(post.score)}</span>
            <span>•</span>
            <span>💬 {new Intl.NumberFormat().format(post.num_comments)}</span>
          </PostMetadata>
        </PostHeader>

        {post.selftext && (
          <PostContent>{post.selftext}</PostContent>
        )}

        {post.url && !post.url.includes('reddit.com') && (
          <PostLink href={post.url} target="_blank" rel="noopener noreferrer">
            🔗 {post.url}
          </PostLink>
        )}

        {isValidThumbnail(post.thumbnail) && (
          <PostImage
            src={post.thumbnail}
            alt=""
            loading="lazy"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}

        <CommentsSection>
          <h3>Comments</h3>
          {loading && <LoadingSpinner>Loading comments...</LoadingSpinner>}
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {!loading && !error && comments.length === 0 && (
            <div>No comments yet</div>
          )}
          {!loading && !error && comments.map(comment => renderComment(comment))}
        </CommentsSection>
      </DetailContainer>
    </Overlay>
  );
}

export default PostDetail;