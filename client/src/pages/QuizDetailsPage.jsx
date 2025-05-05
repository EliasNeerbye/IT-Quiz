import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaUser, FaCalendarAlt, FaClock, FaGamepad, FaTrophy } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { quizService } from '../services/api';
import Button from '../components/common/Button';
import { toast } from 'react-toastify';

const QuizContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const QuizHeader = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
`;

const QuizTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const QuizDescription = styled.p`
  color: #64748b;
  margin-bottom: 1.5rem;
`;

const QuizMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.875rem;
`;

const CategoryTag = styled.span`
  background-color: #e0f2fe;
  color: #0369a1;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const QuestionsContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
`;

const QuestionsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const TakingQuizContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
`;

const QuestionCard = styled.div`
  margin-bottom: 2rem;
`;

const QuestionTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 1rem;
`;

const QuestionText = styled.p`
  font-size: 1.125rem;
  margin-bottom: 1.5rem;
`;

const AnswersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const AnswerOption = styled.div`
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #f9fafb;
  }
  
  ${props => props.selected && `
    background-color: #dbeafe;
    border-color: #3b82f6;
  `}
`;

const Timer = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 1.5rem;
`;

const ResultsContainer = styled.div`
  text-align: center;
`;

const ScoreDisplay = styled.div`
  font-size: 2rem;
  font-weight: 700;
  margin: 1.5rem 0;
  color: #3b82f6;
`;

const ResultsMessage = styled.p`
  font-size: 1.25rem;
  margin-bottom: 2rem;
`;

const QuizDetailsPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('details'); // details, taking, results
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [results, setResults] = useState(null);
  
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const res = await quizService.getQuiz(id);
        setQuiz(res.data.quiz);
      } catch (error) {
        toast.error('Failed to load quiz');
        navigate('/quizzes');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuiz();
  }, [id, navigate]);
  
  useEffect(() => {
    // Timer logic
    if (activeView === 'taking' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (activeView === 'taking' && timeLeft === 0) {
      // Auto-submit when time runs out
      handleSubmitAnswer();
    }
  }, [activeView, timeLeft]);
  
  const handleStartQuiz = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to take the quiz');
      navigate('/login');
      return;
    }
    
    setActiveView('taking');
    setCurrentQuestion(0);
    setSelectedAnswers(Array(quiz.questions.length).fill(null));
    
    // Set timer for first question
    const questionTimeLimit = quiz.questions[0].time_limit || quiz.settings.default_time_limit;
    setTimeLeft(questionTimeLimit);
  };
  
  const handleSelectAnswer = (answerIndex) => {
    const newSelectedAnswers = [...selectedAnswers];
    
    // If true/false or multiple choice, just select the answer
    if (['multiple-choice', 'true-false'].includes(quiz.questions[currentQuestion].type)) {
      newSelectedAnswers[currentQuestion] = quiz.questions[currentQuestion].answers[answerIndex].text;
    }
    
    setSelectedAnswers(newSelectedAnswers);
  };
  
  const handleSubmitAnswer = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      // Move to next question
      setCurrentQuestion(currentQuestion + 1);
      
      // Set timer for next question
      const nextQuestionTimeLimit = 
        quiz.questions[currentQuestion + 1].time_limit || 
        quiz.settings.default_time_limit;
      
      setTimeLeft(nextQuestionTimeLimit);
    } else {
      // End of quiz
      handleFinishQuiz();
    }
  };
  
  const handleFinishQuiz = async () => {
    try {
      const res = await quizService.submitQuizAttempt(quiz._id, {
        answers: selectedAnswers,
        isMultiplayer: false,
      });
      
      setResults(res.data.attempt);
      setActiveView('results');
    } catch (error) {
      toast.error('Failed to submit quiz');
    }
  };
  
  if (loading) {
    return <div>Loading quiz...</div>;
  }
  
  if (!quiz) {
    return <div>Quiz not found</div>;
  }
  
  // Format date
  const formattedDate = new Date(quiz.createdAt).toLocaleDateString();
  
  return (
    <QuizContainer>
      {activeView === 'details' && (
        <>
          <QuizHeader>
            <QuizTitle>{quiz.title}</QuizTitle>
            <QuizDescription>{quiz.description}</QuizDescription>
            
            <QuizMeta>
              <MetaItem>
                <FaUser />
                {quiz.creator?.username || 'Unknown'}
              </MetaItem>
              
              <MetaItem>
                <FaCalendarAlt />
                {formattedDate}
              </MetaItem>
              
              <MetaItem>
                <FaClock />
                {quiz.settings.default_time_limit} seconds per question
              </MetaItem>
              
              {quiz.settings.multiplayer && (
                <MetaItem>
                  <FaGamepad />
                  Multiplayer Enabled
                </MetaItem>
              )}
              
              {quiz.category?.map(cat => (
                <CategoryTag key={cat._id}>
                  {cat.name}
                </CategoryTag>
              ))}
            </QuizMeta>
            
            <ButtonGroup>
              <Button 
                className="btn-primary" 
                onClick={handleStartQuiz}
              >
                Start Quiz
              </Button>
              
              {quiz.settings.multiplayer && (
                <Button className="btn-secondary">
                  <FaGamepad /> Play Multiplayer
                </Button>
              )}
            </ButtonGroup>
          </QuizHeader>
          
          <QuestionsContainer>
            <QuestionsHeader>
              <h2>Questions</h2>
              <span>{quiz.questions.length} questions</span>
            </QuestionsHeader>
            
            <p>Start the quiz to see the questions and test your knowledge!</p>
          </QuestionsContainer>
        </>
      )}
      
      {activeView === 'taking' && (
        <TakingQuizContainer>
          <Timer>
            <FaClock /> {timeLeft} seconds remaining
          </Timer>
          
          <QuestionCard>
            <QuestionTitle>Question {currentQuestion + 1} of {quiz.questions.length}</QuestionTitle>
            <QuestionText>{quiz.questions[currentQuestion].text}</QuestionText>
            
            <AnswersContainer>
              {quiz.questions[currentQuestion].answers.map((answer, index) => (
                <AnswerOption
                  key={index}
                  selected={selectedAnswers[currentQuestion] === answer.text}
                  onClick={() => handleSelectAnswer(index)}
                >
                  {answer.text}
                </AnswerOption>
              ))}
            </AnswersContainer>
          </QuestionCard>
          
          <ButtonGroup>
            <Button
              className="btn-primary"
              onClick={handleSubmitAnswer}
              disabled={selectedAnswers[currentQuestion] === null}
            >
              {currentQuestion < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </Button>
          </ButtonGroup>
        </TakingQuizContainer>
      )}
      
      {activeView === 'results' && results && (
        <TakingQuizContainer>
          <h2>Quiz Results</h2>
          
          <ResultsContainer>
            <FaTrophy size={64} color="#fbbf24" />
            
            <ScoreDisplay>
              {results.score.correctAnswers} / {results.score.totalQuestions}
            </ScoreDisplay>
            
            <ResultsMessage>
              {results.score.correctAnswers === results.score.totalQuestions
                ? 'Perfect score! Amazing job!'
                : results.score.correctAnswers > results.score.totalQuestions / 2
                ? 'Good job! You passed the quiz.'
                : 'Keep practicing! You can try again.'}
            </ResultsMessage>
            
            <ButtonGroup>
              <Button className="btn-primary" onClick={() => navigate('/quizzes')}>
                Browse More Quizzes
              </Button>
              <Button className="btn-secondary" onClick={() => handleStartQuiz()}>
                Try Again
              </Button>
            </ButtonGroup>
          </ResultsContainer>
        </TakingQuizContainer>
      )}
    </QuizContainer>
  );
};

export default QuizDetailsPage;