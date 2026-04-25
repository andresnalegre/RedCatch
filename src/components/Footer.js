import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background-color: #ffffff;
  border-top: 1px solid #edeff1;
  padding: 0.6rem 2rem;
  text-align: center;
  color: #787c7e;
  font-size: 0.82rem;
  width: 100%;
  margin-top: 2rem;

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.72rem;
    margin-top: 1rem;
  }
`;

function Footer() {
  return (
    <FooterContainer>
      © {new Date().getFullYear()} RedCatch. All rights reserved.
    </FooterContainer>
  );
}

export default Footer;