import React from 'react';
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

  @media (max-width: 768px) {
    position: static;
    margin-top: 2rem;
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
  return (
    <FooterContainer>
      © {new Date().getFullYear()} RedCatch — content sourced from{' '}
      <FooterLink href="https://www.reddit.com" target="_blank" rel="noopener noreferrer">
        Reddit
      </FooterLink>
    </FooterContainer>
  );
}

export default Footer;