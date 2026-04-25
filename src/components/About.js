import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const Modal = styled(motion.div)`
  background: #ffffff;
  border-radius: 16px;
  padding: 32px 28px 28px;
  width: 100%;
  max-width: 400px;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);

  @media (max-width: 480px) {
    padding: 26px 20px 22px;
    border-radius: 12px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  background: #f6f7f8;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  font-size: 13px;
  color: #787c7e;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: #edeff1;
    color: #1a1a1b;
  }
`;

const AboutLabel = styled.p`
  text-align: center;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: #787c7e;
  text-transform: uppercase;
  margin-bottom: 14px;
`;

const AppName = styled.h2`
  text-align: center;
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 12px;
  font-family: Arial, sans-serif;
  letter-spacing: -0.02em;

  span:first-child { color: #ff4500; }
  span:last-child  { color: #1a1a1b; }
`;

const Description = styled.p`
  text-align: center;
  color: #787c7e;
  font-size: 0.875rem;
  line-height: 1.6;
  margin-bottom: 24px;
`;

const InfoList = styled.div`
  border-top: 1px solid #edeff1;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 13px 0;
  border-bottom: 1px solid #edeff1;
`;

const IconBadge = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 69, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
`;

const InfoText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const InfoLabel = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a1b;
`;

const InfoValue = styled.span`
  font-size: 0.825rem;
  color: ${props => props.link ? '#ff4500' : '#787c7e'};
  text-decoration: none;

  &:hover {
    text-decoration: ${props => props.link ? 'underline' : 'none'};
  }
`;

function About({ onClose }) {
  return (
    <Overlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <Modal
        initial={{ scale: 0.93, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      >
        <CloseButton onClick={onClose}>✕</CloseButton>

        <AboutLabel>About</AboutLabel>

        <AppName>
          <span>Red</span><span>Catch</span>
        </AppName>

        <Description>
          A Reddit aggregator that lets you browse posts by category and search across subreddits in real time.
        </Description>

        <InfoList>
          <InfoRow>
            <IconBadge>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff4500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
              </svg>
            </IconBadge>
            <InfoText>
              <InfoLabel>Stack</InfoLabel>
              <InfoValue>React + Redux</InfoValue>
            </InfoText>
          </InfoRow>
          <InfoRow>
            <IconBadge>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff4500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </IconBadge>
            <InfoText>
              <InfoLabel>Deploy</InfoLabel>
              <InfoValue>Hosted by GitHub Pages</InfoValue>
            </InfoText>
          </InfoRow>
          <InfoRow>
            <IconBadge>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff4500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </IconBadge>
            <InfoText>
              <InfoLabel>Version</InfoLabel>
              <InfoValue>2.0.0</InfoValue>
            </InfoText>
          </InfoRow>
          <InfoRow>
            <IconBadge>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff4500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </IconBadge>
            <InfoText>
              <InfoLabel>Developed by</InfoLabel>
              <InfoValue as="a" href="https://andresnicolas.com/" target="_blank" rel="noopener noreferrer" link>Andres Nicolas</InfoValue>
            </InfoText>
          </InfoRow>
        </InfoList>
      </Modal>
    </Overlay>
  );
}

export default About;