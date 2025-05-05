import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaHistory } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { quizService } from '../services/api';
import QuizCard from '../components/quiz/QuizCard';
import Button from '../components/common/Button';
import { toast } from 'react-toastify';

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: ${props => props.$active ? '600' : '400'};
  color: ${props => props.$active ? '#3b82f6' : '#64748b'};
  border-bottom: ${props => props.$active ? '2px solid #3b82f6' : '2px solid transparent'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    color: #3b82f6;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #1e293b;
`;

const EmptyStateText = styled.p`
  color: #64748b;
  margin-bottom: 1.5rem;
`;

const QuizGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const DashboardPage = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('myQuizzes');
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user's quizzes
        const quizzesRes = await quizService.getQuizzes({ creator: user.id });
        setQuizzes(quizzesRes.data.quizzes);
        
        // TODO: Fetch user's quiz attempts
        // const attemptsRes = await userService.getAttempts();
        // setAttempts(attemptsRes.data.attempts);
        
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, navigate, user]);
  
  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await quizService.deleteQuiz(quizId);
        setQuizzes(quizzes.filter(quiz => quiz._id !== quizId));
        toast.success('Quiz deleted successfully');
      } catch (error) {
        toast.error('Failed to delete quiz');
      }
    }
  };
  
  return (
    <DashboardContainer>
      <DashboardHeader>
        <h1>Dashboard</h1>
        <Button as={Link} to="/create-quiz" className="btn-primary">
          <FaPlus /> Create Quiz
        </Button>
      </DashboardHeader>
      
      <TabsContainer>
        <Tab 
          $active={activeTab === 'myQuizzes'} 
          onClick={() => setActiveTab('myQuizzes')}
        >
          My Quizzes
        </Tab>
        <Tab 
          $active={activeTab === 'attempts'} 
          onClick={() => setActiveTab('attempts')}
        >
          My Attempts
        </Tab>
      </TabsContainer>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {activeTab === 'myQuizzes' && (
            <>
              {quizzes.length === 0 ? (
                <EmptyState>
                  <EmptyStateTitle>No quizzes created yet</EmptyStateTitle>
                  <EmptyStateText>
                    Get started by creating your first quiz. It's easy!
                  </EmptyStateText>
                  <Button as={Link} to="/create-quiz" className="btn-primary">
                    <FaPlus /> Create Your First Quiz
                  </Button>
                </EmptyState>
              ) : (
                <QuizGrid>
                  {quizzes.map(quiz => (
                    <QuizCard key={quiz._id} quiz={quiz} />
                  ))}
                </QuizGrid>
              )}
            </>
          )}
          
          {activeTab === 'attempts' && (
            <>
              {attempts.length === 0 ? (
                <EmptyState>
                  <EmptyStateTitle>No quiz attempts yet</EmptyStateTitle>
                  <EmptyStateText>
                    Take some quizzes to see your attempts and scores here!
                  </EmptyStateText>
                  <Button as={Link} to="/quizzes" className="btn-primary">
                    <FaHistory /> Browse Quizzes
                  </Button>
                </EmptyState>
              ) : (
                <div className="attempts-list">
                  {/* TODO: Implement attempts list */}
                  <p>Your quiz attempts will be displayed here.</p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </DashboardContainer>
  );
};

export default DashboardPage;