import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getQuizById, submitQuizAttempt } from '../services/quiz';
import { AuthContext } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import { FaArrowLeft, FaArrowRight, FaCheck, FaTimes, FaTrophy } from 'react-icons/fa';

const QuizPlay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timer, setTimer] = useState(null);
  const [score, setScore] = useState({
    points: 0,
    correctAnswers: 0,
    totalQuestions: 0
  });
  const [answers, setAnswers] = useState([]);
  
  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await getQuizById(id);
        setQuiz(response.quiz);
        setScore(prev => ({ ...prev, totalQuestions: response.quiz.questions.length }));
      } catch (err) {
        console.error('Failed to fetch quiz:', err);
        setError(err.response?.data?.error || 'Failed to load quiz. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuiz();
    
    // Cleanup timer on unmount
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [id]);
  
  // Start the quiz
  const startQuiz = () => {
    setQuizStarted(true);
    startTimer(quiz.questions[0].time_limit || 60);
  };
  
  // Start timer for current question
  const startTimer = (seconds) => {
    setTimeLeft(seconds);
    
    // Clear any existing timer
    if (timer) {
      clearInterval(timer);
    }
    
    // Set new timer
    const newTimer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(newTimer);
          handleTimeUp();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    setTimer(newTimer);
  };
  
  // Handle when time runs out for a question
  const handleTimeUp = () => {
    // Record the answer as timeout
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const answerResult = {
      questionId: currentQuestion._id,
      answerId: null,
      isCorrect: false,
      points: 0,
      isTimeout: true
    };
    
    setAnswers([...answers, answerResult]);
    
    // Move to next question or finish quiz
    if (currentQuestionIndex + 1 < quiz.questions.length) {
      moveToNextQuestion();
    } else {
      finishQuiz();
    }
  };
  
  // Handle selecting an answer
  const handleSelectAnswer = (answerId) => {
    setSelectedAnswer(answerId);
  };
  
  // Submit current answer and move to next question
  const submitAnswer = () => {
    if (selectedAnswer === null) {
      toast.error('Please select an answer');
      return;
    }
    
    // Clear timer
    if (timer) {
      clearInterval(timer);
    }
    
    // Calculate score
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const selectedAnswerObj = currentQuestion.answers.find(a => a._id === selectedAnswer);
    const isCorrect = selectedAnswerObj?.isCorrect || false;
    
    // Calculate points based on time left and max points
    const maxPoints = currentQuestion.max_points || 1000;
    const timeLimit = currentQuestion.time_limit || 60;
    const timeBonus = timeLeft / timeLimit; // 0-1 based on time left
    const earnedPoints = isCorrect ? Math.round(maxPoints * (0.5 + (timeBonus * 0.5))) : 0;
    
    // Update total score
    setScore(prev => ({
      ...prev,
      points: prev.points + earnedPoints,
      correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers
    }));
    
    // Record the answer
    const answerResult = {
      questionId: currentQuestion._id,
      answerId: selectedAnswer,
      isCorrect,
      points: earnedPoints,
      isTimeout: false
    };
    
    setAnswers([...answers, answerResult]);
    
    // Move to next question or finish quiz
    if (currentQuestionIndex + 1 < quiz.questions.length) {
      moveToNextQuestion();
    } else {
      finishQuiz();
    }
  };
  
  // Move to next question
  const moveToNextQuestion = () => {
    setSelectedAnswer(null);
    setCurrentQuestionIndex(prev => prev + 1);
    
    // Start timer for next question
    const nextQuestion = quiz.questions[currentQuestionIndex + 1];
    startTimer(nextQuestion.time_limit || 60);
  };
  
  // Finish the quiz
  const finishQuiz = async () => {
    setQuizFinished(true);
    
    try {
      // Submit quiz attempt to server
      await submitQuizAttempt(id, score);
      toast.success('Quiz completed! Your score has been recorded.');
    } catch (err) {
      console.error('Failed to submit quiz attempt:', err);
      toast.error('Failed to save your score. Please try again.');
    }
  };
  
  // View leaderboard
  const viewLeaderboard = () => {
    navigate(`/quizzes/${id}/leaderboard`);
  };
  
  // Retry the quiz
  const retryQuiz = () => {
    setQuizStarted(false);
    setQuizFinished(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore({
      points: 0,
      correctAnswers: 0,
      totalQuestions: quiz.questions.length
    });
    setAnswers([]);
  };
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  if (loading) {
    return (
      <div className="container py-lg">
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container py-lg">
        <div className="alert alert-danger">{error}</div>
        <Button variant="secondary" onClick={() => navigate('/')}>
          <FaArrowLeft /> Back to Home
        </Button>
      </div>
    );
  }
  
  if (!quiz) {
    return (
      <div className="container py-lg">
        <div className="alert alert-warning">Quiz not found or you don't have permission to view it.</div>
        <Button variant="secondary" onClick={() => navigate('/')}>
          <FaArrowLeft /> Back to Home
        </Button>
      </div>
    );
  }
  
  // Quiz start screen
  if (!quizStarted) {
    return (
      <div className="container py-lg">
        <div className="quiz-start-container card">
          <h1>{quiz.title}</h1>
          
          <div className="quiz-info">
            <p>{quiz.description}</p>
            
            <div className="quiz-details mt-lg">
              <p><strong>Questions:</strong> {quiz.questions.length}</p>
              <p><strong>Created by:</strong> {quiz.creator.username}</p>
              {quiz.category && quiz.category.length > 0 && (
                <p><strong>Categories:</strong> {quiz.category.map(cat => cat.name).join(', ')}</p>
              )}
            </div>
            
            <div className="quiz-rules mt-lg">
              <h3>Rules:</h3>
              <ul>
                <li>Each question has a time limit</li>
                <li>Points are awarded based on correct answers and how quickly you respond</li>
                <li>You'll see your results at the end of the quiz</li>
              </ul>
            </div>
          </div>
          
          <div className="quiz-start-actions mt-lg">
            <Button variant="primary" size="lg" onClick={startQuiz}>
              Start Quiz
            </Button>
            <Button variant="secondary" onClick={() => navigate('/')}>
              <FaArrowLeft /> Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Quiz results screen
  if (quizFinished) {
    const percentage = Math.round((score.correctAnswers / score.totalQuestions) * 100);
    
    return (
      <div className="container py-lg">
        <div className="quiz-results-container card">
          <h1>Quiz Results</h1>
          
          <div className="results-summary">
            <div className="result-score">
              <h2>Your Score: {score.points}</h2>
              <div className="score-details">
                <p>
                  <FaCheck className="text-success" /> Correct Answers: {score.correctAnswers} / {score.totalQuestions}
                  {' '}({percentage}%)
                </p>
              </div>
            </div>
            
            <div className="result-grade mt-md">
              {percentage >= 90 ? (
                <div className="grade-excellent">
                  <h3>Excellent!</h3>
                  <p>Outstanding performance! You're an expert!</p>
                </div>
              ) : percentage >= 70 ? (
                <div className="grade-good">
                  <h3>Good Job!</h3>
                  <p>You have a solid understanding of the topic.</p>
                </div>
              ) : percentage >= 50 ? (
                <div className="grade-average">
                  <h3>Not Bad</h3>
                  <p>You've got the basics down, but there's room for improvement.</p>
                </div>
              ) : (
                <div className="grade-needs-improvement">
                  <h3>Needs Improvement</h3>
                  <p>Keep studying! You'll get better with practice.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="results-details mt-lg">
            <h3>Question Summary</h3>
            <div className="answers-summary">
              {answers.map((answer, index) => {
                const question = quiz.questions[index];
                const correctAnswer = question.answers.find(a => a.isCorrect);
                
                return (
                  <div key={index} className={`answer-item ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                    <div className="question-text">
                      <span>Q{index + 1}: {question.title}</span>
                      {answer.isCorrect ? (
                        <FaCheck className="text-success" />
                      ) : (
                        <FaTimes className="text-danger" />
                      )}
                    </div>
                    
                    <div className="answer-details">
                      {answer.isTimeout ? (
                        <p>Time's up! You didn't answer.</p>
                      ) : (
                        <>
                          <p>
                            Your answer: {question.answers.find(a => a._id === answer.answerId)?.text}
                          </p>
                        </>
                      )}
                      
                      {!answer.isCorrect && (
                        <p className="correct-answer">
                          Correct answer: {correctAnswer?.text}
                        </p>
                      )}
                      
                      <p className="answer-points">
                        Points earned: {answer.points}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="results-actions mt-lg">
            <Button variant="primary" onClick={viewLeaderboard}>
              <FaTrophy /> View Leaderboard
            </Button>
            <Button variant="secondary" onClick={retryQuiz}>
              Try Again
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              <FaArrowLeft /> Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Playing the quiz
  const currentQuestion = quiz.questions[currentQuestionIndex];
  
  return (
    <div className="container py-lg">
      <div className="quiz-play-container">
        <div className="quiz-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentQuestionIndex) / quiz.questions.length) * 100}%` }}
            ></div>
          </div>
          <div className="progress-text">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </div>
        </div>
        
        <div className="quiz-question card">
          <div className="question-header">
            <h2>{currentQuestion.title}</h2>
            <div className="question-timer">
              Time: {formatTime(timeLeft)}
            </div>
          </div>
          
          <div className="question-body">
            <p>{currentQuestion.text}</p>
            
            {currentQuestion.image && (
              <div className="question-image">
                <img src={currentQuestion.image} alt={currentQuestion.title} />
              </div>
            )}
            
            <div className="question-answers">
              {currentQuestion.answers.map((answer) => (
                <div 
                  key={answer._id} 
                  className={`answer-option ${selectedAnswer === answer._id ? 'selected' : ''}`}
                  onClick={() => handleSelectAnswer(answer._id)}
                >
                  {answer.text}
                </div>
              ))}
            </div>
          </div>
          
          <div className="question-actions">
            <Button 
              variant="primary" 
              onClick={submitAnswer} 
              disabled={selectedAnswer === null}
            >
              {currentQuestionIndex + 1 < quiz.questions.length ? (
                <>Next <FaArrowRight /></>
              ) : (
                'Finish Quiz'
              )}
            </Button>
          </div>
        </div>
        
        <div className="current-score">
          Score: {score.points}
        </div>
      </div>
    </div>
  );
};

export default QuizPlay;