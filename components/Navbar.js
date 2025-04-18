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
  gap: 1.5rem;
`;

const Logo = styled.h2`
  font-weight: bold;
  color: #00bcd4;
`;

const NavLink = styled(Link)`
  color: #ccc;
  font-size: 0.95rem;
  &:hover {
    color: white;
  }
`;

const Button = styled.button`
  background: #1e88e5;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  cursor: pointer;
`;

export default function Navbar() {
  return (
    <Nav>
      <Left>
        <Link href="/" passHref>
          <Logo>Blockpoll</Logo>
        </Link>
        <NavLink href="/">Explore</NavLink>
        <NavLink href="/create">Create Poll</NavLink>
        <NavLink href="/dashboard">Dashboard</NavLink>
      </Left>
      <Right>
        <NavLink href="/login">Log In</NavLink>
        <Button>Sign Up</Button>
      </Right>
    </Nav>
  );
}
