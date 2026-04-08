import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background-color: #ffffff;
  border-top: 1px solid #edeff1;
  padding: 0.6rem 2rem;
  text-align: center;
  color: #787c7e;
  font-size: 0.85rem;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
  transform: translateY(${props => props.offset}px);
  transition: transform 0.15s ease;

  @media (max-width: 768px) {
    transition: none;
  }
`;

const FooterLink = styled.a`
  color: #ff4500;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

function Footer() {
  const [offset, setOffset] = useState(0);
  const baseHeightRef = useRef(null);

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return;

    baseHeightRef.current = window.innerHeight;

    const handleResize = () => {
      const current = window.innerHeight;
      const base = baseHeightRef.current;
      if (current > base) {
        setOffset(current - base);
      } else {
        baseHeightRef.current = current;
        setOffset(0);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <FooterContainer offset={offset}>
      © {new Date().getFullYear()} RedCatch. All rights reserved.
    </FooterContainer>
  );
}

export default Footer;