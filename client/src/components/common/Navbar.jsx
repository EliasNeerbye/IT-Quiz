import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaSignOutAlt, FaUser, FaQuestionCircle, FaCog } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import Button from './Button';

const NavbarContainer = styled.nav`
  background-color: #1e293b;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  
  span {
    color: #3b82f6;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const NavLink = styled(Link)`
  color: #e2e8f0;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    color: #3b82f6;
  }
  
  &.active {
    color: #3b82f6;
    font-weight: 600;
  }
  
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
`;

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  
  return (
    <NavbarContainer>
      <Logo to="/">
        IT<span>Quiz</span>
      </Logo>
      
      <NavLinks>
        <NavLink to="/quizzes">Quizzes</NavLink>
        <NavLink to="/faq">
          <FaQuestionCircle /> FAQ
        </NavLink>
        
        {isAuthenticated && (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            {isAdmin && (
              <NavLink to="/admin">
                <FaCog /> Admin
              </NavLink>
            )}
          </>
        )}
      </NavLinks>
      
      <UserSection>
        {isAuthenticated ? (
          <>
            <UserInfo>
              <FaUser />
              {user?.username}
            </UserInfo>
            <Button className="btn-outline" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </Button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <Button as={Link} to="/register" className="btn-primary">
              Register
            </Button>
          </>
        )}
      </UserSection>
    </NavbarContainer>
  );
};

export default Navbar;