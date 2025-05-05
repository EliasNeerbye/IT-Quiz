import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { AuthContext } from '../context/AuthContext';
import QuizForm from '../components/quiz/QuizForm';

const CreateQuizContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #64748b;
`;

const CreateQuizPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <CreateQuizContainer>
      <PageHeader>
        <Title>Create a New Quiz</Title>
        <Subtitle>Design your quiz, add questions, and share with others</Subtitle>
      </PageHeader>
      
      <QuizForm />
    </CreateQuizContainer>
  );
};

export default CreateQuizPage;