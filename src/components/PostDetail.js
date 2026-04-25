import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchComments,
  clearComments,
  selectComments,
  selectCommentsLoading,
  selectCommentsError
} from '../features/posts/postsSlice';

// Parse Reddit markdown links [text](url) and detect image URLs
const parseMarkdown = (text) => {
  if (!text) return [];
  const parts = [];
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g; // eslint-disable-line no-useless-escape
  let lastIndex = 0;
  let match;
  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'link', label: match[1], url: match[2] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }
  return parts.length > 0 ? parts : [{ type: 'text', content: text }];
};

const isImageUrl = (url) => /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url);

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 10, 10, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  justify-content: center;
  overflow: hidden;

  @media (max-width: 768px) {
    background: #ffffff;
    backdrop-filter: none;
    align-items: flex-start;
  }
`;

const DetailContainer = styled(motion.div)`
  background: #ffffff;
  width: 100%;
  max-width: 720px;
  margin: 40px auto;
  border-radius: 18px;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  max-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18), 0 4px 16px rgba(0, 0, 0, 0.08);
  -webkit-overflow-scrolling: touch;

  @media (max-width: 768px) {
    margin: 0;
    border-radius: 0;
    width: 100%;
    height: 100%;
    max-height: none;
    min-height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    box-shadow: none;
  }
`;

const ModalHeader = styled.div`
  padding: 24px 28px 20px;
  border-bottom: 1px solid #f4f4f4;
  position: relative;
  flex-shrink: 0;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 18px;
  right: 18px;
  background: #f6f7f8;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 13px;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.18s ease;
  flex-shrink: 0;

  &:hover {
    background: #fff0ec;
    color: #ff4500;
  }
`;

const SubredditTag = styled.span`
  display: inline-block;
  background: rgba(255, 69, 0, 0.08);
  color: #ff4500;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 3px 10px;
  border-radius: 20px;
  margin-bottom: 10px;
`;

const PostTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.4;
  color: #111;
  margin: 0 40px 14px 0;
  letter-spacing: -0.01em;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0;
  color: #aaa;
  font-size: 0.8rem;
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #999;

  &:not(:last-child)::after {
    content: '·';
    margin: 0 8px;
    color: #ddd;
  }
`;

const MetaHighlight = styled.span`
  color: #555;
  font-weight: 500;
`;

const StatBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f6f7f8;
  border-radius: 20px;
  padding: 2px 10px;
  font-size: 0.78rem;
  color: #666;
  font-weight: 500;
`;

const ScrollBody = styled.div`
  overflow-y: auto;
  flex: 1;
  padding: 24px 28px;

  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: #e8e8e8; border-radius: 3px; }
  &::-webkit-scrollbar-thumb:hover { background: #ccc; }

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const PostContent = styled.div`
  font-size: 0.95rem;
  line-height: 1.75;
  color: #444;
  white-space: pre-wrap;
  word-break: break-word;
  margin-bottom: 20px;
`;

const PostLink = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ff4500;
  font-size: 0.85rem;
  text-decoration: none;
  padding: 11px 14px;
  margin-bottom: 20px;
  background: rgba(255, 69, 0, 0.05);
  border: 1px solid rgba(255, 69, 0, 0.12);
  border-radius: 10px;
  word-break: break-all;
  transition: background 0.18s;

  &:hover { background: rgba(255, 69, 0, 0.09); }

  span { flex-shrink: 0; }
`;


const ImageModalOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  cursor: zoom-out;
`;

const ImageModalImg = styled.img`
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 24px 64px rgba(0,0,0,0.5);
`;

const ImageModalClose = styled.button`
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(255,255,255,0.15);
  border: none;
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.18s;
  &:hover { background: rgba(255,255,255,0.25); }
`;

const InlineImage = styled.img`
  max-width: 100%;
  height: auto;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
  margin-bottom: 16px;
  cursor: zoom-in;
  display: block;
  transition: opacity 0.18s;
  &:hover { opacity: 0.92; }
`;

const MarkdownLink = styled.a`
  color: #ff4500;
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

const CommentsSection = styled.div`
  border-top: 1px solid #f4f4f4;
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const CommentsSectionTitle = styled.h3`
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #bbb;
  margin-bottom: 16px;
`;

const Comment = styled.div`
  padding: 14px 16px;
  margin: 5px 0;
  margin-left: ${props => Math.min(props.depth * 20, 80)}px;
  background: ${props => props.depth === 0 ? '#ffffff' : props.depth === 1 ? '#fafafa' : '#f5f5f5'};
  border: 1px solid ${props => props.depth === 0 ? '#f0ece9' : '#efefef'};
  border-radius: 10px;

  @media (max-width: 768px) {
    margin-left: ${props => Math.min(props.depth * 12, 48)}px;
  }
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const CommentAuthor = styled.span`
  font-size: 0.8rem;
  font-weight: 700;
  color: #1a1a1b;
`;

const CommentScore = styled.span`
  font-size: 0.72rem;
  color: #bbb;
  display: flex;
  align-items: center;
  gap: 3px;
  background: #f6f7f8;
  padding: 2px 7px;
  border-radius: 20px;
`;

const RepliesToggle = styled.button`
  margin-left: auto;
  border: none;
  font-size: 0.72rem;
  font-weight: 600;
  color: #999;
  cursor: pointer;
  padding: 3px 10px;
  border-radius: 20px;
  background: #f0f0f0;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;

  &:hover {
    background: rgba(255, 69, 0, 0.08);
    color: #ff4500;
  }
`;

const CommentBody = styled.div`
  font-size: 0.875rem;
  line-height: 1.7;
  color: #444;
  white-space: pre-wrap;
  word-break: break-word;
`;

const shimmer = keyframes`
  0% { background-position: -600px 0; }
  100% { background-position: 600px 0; }
`;

const SkeletonBase = styled.div`
  background: linear-gradient(90deg, #f5f5f5 25%, #ececec 50%, #f5f5f5 75%);
  background-size: 600px 100%;
  animation: ${shimmer} 1.4s infinite linear;
  border-radius: 6px;
`;

const SkeletonLine = styled(SkeletonBase)`
  height: ${props => props.height || '13px'};
  width: ${props => props.width || '100%'};
  margin-bottom: ${props => props.mb || '8px'};
`;

const SkeletonComment = styled.div`
  padding: 12px 14px;
  margin: 6px 0;
  border-left: 2px solid #f0f0f0;
  border-radius: 0 8px 8px 0;
`;

const ErrorMsg = styled.div`
  color: #ff4500;
  padding: 12px 16px;
  background: rgba(255, 69, 0, 0.05);
  border: 1px solid rgba(255, 69, 0, 0.12);
  border-radius: 10px;
  font-size: 0.875rem;
`;

const isValidThumbnail = (thumbnail) => {
  if (!thumbnail) return false;
  const invalid = ['self', 'default', 'nsfw', 'spoiler', ''];
  if (invalid.includes(thumbnail)) return false;
  return thumbnail.startsWith('http');
};

const CommentSkeleton = () => (
  <>
    {[1, 2, 3, 4, 5].map(i => (
      <SkeletonComment key={i}>
        <SkeletonLine height="11px" width="110px" mb="10px" />
        <SkeletonLine width="100%" />
        <SkeletonLine width="72%" />
      </SkeletonComment>
    ))}
  </>
);

function CommentNode({ comment, depth = 0 }) {
  const [expanded, setExpanded] = React.useState(false);

  if (!comment || !comment.body) return null;

  const replies = comment.replies?.data?.children?.filter(c => c.kind === 't1') || [];
  const hasReplies = replies.length > 0;

  return (
    <div>
      <Comment depth={depth}>
        <CommentHeader>
          <CommentAuthor>u/{comment.author}</CommentAuthor>
          <CommentScore>↑ {new Intl.NumberFormat().format(comment.score)}</CommentScore>
          {hasReplies && (
            <RepliesToggle onClick={() => setExpanded(prev => !prev)}>
              {expanded ? '▲' : '▼'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </RepliesToggle>
          )}
        </CommentHeader>
        <CommentBody>{comment.body}</CommentBody>
      </Comment>
      {hasReplies && expanded && (
        <div>
          {replies.map(child => (
            <CommentNode key={child.data.id} comment={child.data} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function MarkdownText({ text }) {
  const parts = parseMarkdown(text);
  return (
    <>
      {parts.map((part, i) => {
        if (part.type === 'link') {
          return <MarkdownLink key={i} href={part.url} target="_blank" rel="noopener noreferrer">{part.label}</MarkdownLink>;
        }
        return <span key={i}>{part.content}</span>;
      })}
    </>
  );
}

function PostDetail({ post, onClose }) {
  const dispatch = useDispatch();
  const comments = useSelector(selectComments);
  const commentsLoading = useSelector(selectCommentsLoading);
  const commentsError = useSelector(selectCommentsError);
  const [lightboxImg, setLightboxImg] = React.useState(null);

  useEffect(() => {
    dispatch(fetchComments({ postId: post.id }));
    return () => { dispatch(clearComments()); };
  }, [post.id, dispatch]);

  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  const isPostImage = post.url && isImageUrl(post.url);

  return (
    <>
    <Overlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <DetailContainer
        initial={{ y: 32, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 32, opacity: 0, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      >
        <ModalHeader>
          <CloseButton onClick={onClose}>✕</CloseButton>
          <SubredditTag>r/{post.subreddit}</SubredditTag>
          <PostTitle>{post.title}</PostTitle>
          <MetaRow>
            <MetaItem>
              <MetaHighlight>u/{post.author}</MetaHighlight>
            </MetaItem>
            <MetaItem>
              <StatBadge>↑ {new Intl.NumberFormat().format(post.score)}</StatBadge>
            </MetaItem>
            <MetaItem>
              <StatBadge>💬 {new Intl.NumberFormat().format(post.num_comments)}</StatBadge>
            </MetaItem>
          </MetaRow>
        </ModalHeader>

        <ScrollBody>
          {post.selftext && (
            <PostContent>
              <MarkdownText text={post.selftext} />
            </PostContent>
          )}

          {isPostImage && (
            <InlineImage
              src={post.url}
              alt=""
              loading="lazy"
              onClick={() => setLightboxImg(post.url)}
              onError={e => { e.target.style.display = 'none'; }}
            />
          )}

          {!isPostImage && post.url && !post.url.includes('reddit.com') && (
            <PostLink href={post.url} target="_blank" rel="noopener noreferrer">
              <span>🔗</span> {post.url}
            </PostLink>
          )}

          {!isPostImage && isValidThumbnail(post.thumbnail) && (
            <InlineImage
              src={post.thumbnail}
              alt=""
              loading="lazy"
              onClick={() => setLightboxImg(post.thumbnail)}
              onError={e => { e.target.style.display = 'none'; }}
            />
          )}

          <CommentsSection>
            <CommentsSectionTitle>Comments</CommentsSectionTitle>
            {commentsLoading && <CommentSkeleton />}
            {commentsError && <ErrorMsg>{commentsError}</ErrorMsg>}
            {!commentsLoading && !commentsError && comments.length === 0 && (
              <div style={{ color: '#bbb', fontSize: '0.875rem' }}>No comments yet.</div>
            )}
            {!commentsLoading && !commentsError && comments.map(comment => <CommentNode key={comment.id} comment={comment} depth={0} />)}
          </CommentsSection>
        </ScrollBody>
      </DetailContainer>
    </Overlay>

    <AnimatePresence>
      {lightboxImg && (
        <ImageModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setLightboxImg(null)}
        >
          <ImageModalClose onClick={() => setLightboxImg(null)}>✕</ImageModalClose>
          <ImageModalImg
            src={lightboxImg}
            alt=""
            onClick={e => e.stopPropagation()}
          />
        </ImageModalOverlay>
      )}
    </AnimatePresence>
    </>
  );
}

export default PostDetail;