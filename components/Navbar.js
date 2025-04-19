import Link from 'next/link';
import styled from 'styled-components';

const Nav = styled.nav`
   align-items: center;
    background-color: rgba(12, 13, 15, 0.7);
    backdrop-filter: blur(5px);
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    height: 4.5rem;
    left: 0px;
    top: 0px;
    padding: 10px;
    position: fixed;
    width: 100%;    
    font-size: 1.2rem;
    box-shadow: 0px 0px 5px 0px rgb(2, 2, 3);
    z-index: 5; // Fixes elements appearing over navbar
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const Logo = styled.h2`
  font-weight: bold;
  color:rgb(0, 188, 212);
`;

const NavLink = styled(Link)`
  color:rgb(192, 192, 192);
  font-size: 0.95rem;
  &:hover {
    color: white;
  }
`;

const SignUpButton = styled.a`
  background: rgb(0, 188, 212);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  display: inline-block;

  &:hover {
    background: rgb(0, 135, 153);
  }
`;

export default function Navbar() {
  return (
    <Nav>
      <Left>
        <Link href="/">
          <Logo>Blockpoll</Logo>
        </Link>
        <NavLink href="/">Explore</NavLink>
        <NavLink href="/create">Create Poll</NavLink>
        <NavLink href="/dashboard">Dashboard</NavLink>
      </Left>
      <Right>
        <NavLink href="/login">Log In</NavLink>
        <SignUpButton href="/signup">Sign Up</SignUpButton>
      </Right>
    </Nav>
  );
}
