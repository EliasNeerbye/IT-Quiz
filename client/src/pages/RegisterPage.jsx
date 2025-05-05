import { useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { AuthContext } from '../context/AuthContext';
import RegisterForm from '../components/auth/RegisterForm';

const Container = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  color: #1e293b;
`;

const Footer = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  color: #64748b;
  
  a {
    color: #3b82f6;
    font-weight: 600;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const RegisterPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <Container>
      <Card>
        <Title>Create Your Account</Title>
        <RegisterForm />
        <Footer>
          Already have an account? <Link to="/login">Log In</Link>
        </Footer>
      </Card>
    </Container>
  );
};

export default RegisterPage;