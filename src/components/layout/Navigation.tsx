import React from 'react';
import styled from 'styled-components';

const NavContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #FFFFFF;
`;

const SiteName = styled.div`
  font-family: Inter;
  font-weight: 500;
  font-size: 20px;
  line-height: 1.5em;
  color: #000000;
`;

const NavItems = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 48px;
`;

const NavLink = styled.a`
  font-family: Inter;
  font-weight: 500;
  font-size: 20px;
  line-height: 1.5em;
  color: #000000;
  text-decoration: none;
  
  &:hover {
    opacity: 0.8;
  }
`;

const Button = styled.button`
  font-family: Inter;
  font-weight: 500;
  font-size: 16px;
  line-height: 1.5em;
  color: #FFFFFF;
  background: #000000;
  border: none;
  border-radius: 8px;
  padding: 14px 24px;
  cursor: pointer;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);

  &:hover {
    opacity: 0.9;
  }
`;

interface NavigationProps {
  siteName: string;
}

const Navigation: React.FC<NavigationProps> = ({ siteName }) => {
  return (
    <NavContainer>
      <SiteName>{siteName}</SiteName>
      <NavItems>
        <NavLink href="/page1">Page</NavLink>
        <NavLink href="/page2">Page</NavLink>
        <NavLink href="/page3">Page</NavLink>
        <Button>Button</Button>
      </NavItems>
    </NavContainer>
  );
};

export default Navigation; 