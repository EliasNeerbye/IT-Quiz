import { useContext, useEffect, useReducer, useRef } from 'react';
import { SocketContext } from '../../contexts/socketContext';
import { submitAnswer, leaveGame } from '../../services/socket';
import Button from '../common/Button';
import { FaCheck, FaTimes, FaUsers, FaTrophy, FaSignOutAlt, FaPlay } from 'react-icons/fa';

// Define reducer function
const gameStateReducer = (state, action) => {
  switch (action.type) {
    case 'QUESTION_LOADED':
      return {
        ...state,
        selectedAnswer: null,
        answered: false,
        timeLeft: action.payload.timeLimit
      };
    case 'TICK':
      return {
        ...state,
        timeLeft: state.timeLeft - 1
      };
    case 'SELECT_ANSWER':
      return {
        ...state,
        selectedAnswer: action.payload
      };
    case 'SUBMIT_ANSWER':
      return {
        ...state,
        answered: true
      };
    default:
      return state;
  }
};

const MultiplayerGame = () => {
  const { gameState, resetGame } = useContext(SocketContext);
  const [state, dispatch] = useReducer(gameStateReducer, {
    selectedAnswer: null,
    timeLeft: 0,
    answered: false
  });
  
  const timerRef = useRef(null);
  const stateRef = useRef(state);
  
  // Update the ref whenever state changes
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  
  // Handle the timer effect
  useEffect(() => {
    if (gameState.currentQuestion) {
      const timeLimit = gameState.currentQuestion.time_limit || 60;
      
      // Reset state for new question
      dispatch({ 
        type: 'QUESTION_LOADED',
        payload: { timeLimit }
      });
      
      // Clear any existing timers
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Start new timer
      timerRef.current = setInterval(() => {
        dispatch({ type: 'TICK' });
        
        // Access state via ref to avoid dependency issues
        const currentState = stateRef.current;
        
        // Check if time is up
        if (currentState.timeLeft <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          
          if (!currentState.answered) {
            dispatch({ type: 'SUBMIT_ANSWER' });
            if (gameState.gameCode && gameState.currentQuestion) {
              submitAnswer(
                gameState.gameCode,
                gameState.currentQuestion.id,
                null
              );
            }
          }
        }
      }, 1000);
      
      // Cleanup function
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [gameState.currentQuestion, gameState.gameCode]);
  
  // Cleanup effect on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);
  
  const handleSelectAnswer = (answerId) => {
    dispatch({ 
      type: 'SELECT_ANSWER',
      payload: answerId
    });
  };
  
  const handleSubmitAnswer = () => {
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Mark as answered
    dispatch({ type: 'SUBMIT_ANSWER' });
    
    // Submit to server
    if (gameState.gameCode && gameState.currentQuestion) {
      submitAnswer(
        gameState.gameCode,
        gameState.currentQuestion.id,
        state.selectedAnswer
      );
    }
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleLeaveGame = () => {
    if (window.confirm('Are you sure you want to leave this game?')) {
      leaveGame(gameState.gameCode);
      resetGame();
    }
  };
  
  const handlePlayAgain = () => {
    // Do full reset to ensure clean state
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    resetGame();
  };
  
  // Check gameOver first before other conditions
  if (gameState.gameOver && gameState.results) {
    return (
      <div className="game-results">
        <h2>Game Over</h2>
        
        <div className="results-container">
          <div className="final-standings card">
            <h3><FaTrophy /> Final Standings</h3>
            <div className="standings-list">
              {gameState.results.map((player, index) => (
                <div key={index} className={`player-result ${index === 0 ? 'winner' : ''}`}>
                  <div className="player-rank">{index + 1}</div>
                  <div className="player-name">{player.username}</div>
                  <div className="player-score">{player.score} pts</div>
                  <div className="player-accuracy">
                    {player.correctAnswers}/{player.totalAnswers || gameState.quiz?.questionCount || '?'} correct
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="game-actions mt-lg">
          <Button variant="primary" onClick={handlePlayAgain}>
            <FaPlay /> Play Another Game
          </Button>
        </div>
      </div>
    );
  }
  
  if (gameState.questionResults) {
    return (
      <div className="question-results">
        <h2>Question Results</h2>
        
        <div className="results-container">
          <div className="standings card">
            <h3>Current Standings</h3>
            <div className="standings-list">
              {gameState.questionResults.map((player, index) => (
                <div key={index} className="player-result">
                  <div className="player-rank">{index + 1}</div>
                  <div className="player-name">{player.username}</div>
                  <div className="player-score">{player.score} pts</div>
                  <div className="player-answer-result">
                    {player.isCorrect ? (
                      <FaCheck className="text-success" />
                    ) : (
                      <FaTimes className="text-danger" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <p className="text-center mt-md">
          Next question will appear soon...
        </p>
      </div>
    );
  }
  
  if (gameState.currentQuestion) {
    return (
      <div className="multiplayer-question">
        <div className="question-header">
          <div className="question-progress">
            Question {gameState.currentQuestion.number} of {gameState.currentQuestion.total}
          </div>
          <div className="question-timer">
            Time: {formatTime(state.timeLeft)}
          </div>
        </div>
        
        <div className="question-container card">
          <h2>{gameState.currentQuestion.title}</h2>
          <p>{gameState.currentQuestion.text}</p>
          
          {gameState.currentQuestion.image && (
            <div className="question-image">
              <img 
                src={gameState.currentQuestion.image} 
                alt={gameState.currentQuestion.title}
              />
            </div>
          )}
          
          <div className="answer-options">
            {gameState.currentQuestion.answers.map((answer) => (
              <button
                key={answer.id}
                className={`answer-option ${state.selectedAnswer === answer.id ? 'selected' : ''} ${state.answered ? 'disabled' : ''}`}
                onClick={() => !state.answered && handleSelectAnswer(answer.id)}
                disabled={state.answered}
              >
                {answer.text}
              </button>
            ))}
          </div>
          
          <div className="question-actions">
            <Button
              variant="primary"
              onClick={handleSubmitAnswer}
              disabled={!state.selectedAnswer || state.answered}
            >
              Submit Answer
            </Button>
          </div>
        </div>
        
        {gameState.lastAnswer && (
          <div className={`answer-feedback ${gameState.lastAnswer.isCorrect ? 'correct' : 'incorrect'}`}>
            {gameState.lastAnswer.isCorrect ? (
              <div className="correct-answer">
                <FaCheck /> Correct! +{gameState.lastAnswer.points} points
              </div>
            ) : (
              <div className="incorrect-answer">
                <FaTimes /> Incorrect
              </div>
            )}
          </div>
        )}
        
        <div className="game-footer">
          <div className="players-info">
            <FaUsers /> {gameState.players?.length || 0} players
          </div>
          
          <Button variant="danger" size="sm" onClick={handleLeaveGame}>
            <FaSignOutAlt /> Leave Game
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="game-loading">
      <div className="loader-container">
        <div className="loader"></div>
      </div>
      <p>Waiting for the next question...</p>
    </div>
  );
};

export default MultiplayerGame;