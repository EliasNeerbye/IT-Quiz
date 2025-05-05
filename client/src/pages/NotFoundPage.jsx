import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaHome, FaQuestionCircle } from 'react-icons/fa';
import Button from '../components/common/Button';

const NotFoundContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
  padding: 4rem 1rem;
`;

const ErrorCode = styled.div`
  font-size: 6rem;
  font-weight: 700;
  color: #3b82f6;
  line-height: 1;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #1e293b;
  margin-bottom: 1rem;
`;

const Description = styled.p`
  color: #64748b;
  margin-bottom: 2rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const NotFoundPage = () => {
  return (
    <NotFoundContainer>
      <ErrorCode>404</ErrorCode>
      <Title>Page Not Found</Title>
      <Description>
        The page you are looking for might have been removed, had its name changed,
        or is temporarily unavailable.
      </Description>
      
      <ButtonGroup>
        <Button as={Link} to="/" className="btn-primary">
          <FaHome /> Go to Home
        </Button>
        <Button as={Link} to="/faq" className="btn-secondary">
          <FaQuestionCircle /> Visit FAQ
        </Button>
      </ButtonGroup>
    </NotFoundContainer>
  );
};

export default NotFoundPage;