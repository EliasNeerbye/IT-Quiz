import { useContext, useState, useEffect } from 'react';
import { SocketContext } from '../../contexts/SocketContext';
import { submitAnswer, leaveGame } from '../../services/socket';
import Button from '../common/Button';
import { FaCheck, FaTimes, FaUsers, FaTrophy, FaSignOutAlt } from 'react-icons/fa';

const MultiplayerGame = () => {
  const { gameState, resetGame } = useContext(SocketContext);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timer, setTimer] = useState(null);
  const [answered, setAnswered] = useState(false);
  
  
  useEffect(() => {
    if (gameState.currentQuestion) {
      
      setSelectedAnswer(null);
      setAnswered(false);
      
      
      const timeLimit = gameState.currentQuestion.time_limit || 60;
      setTimeLeft(timeLimit);
      
      
      if (timer) {
        clearInterval(timer);
      }
      
      
      const newTimer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(newTimer);
            
            if (!answered) {
              handleSubmitAnswer(null);
            }
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      setTimer(newTimer);
      
      
      return () => {
        if (timer) {
          clearInterval(timer);
        }
      };
    }
  }, [gameState.currentQuestion]);
  
  
  useEffect(() => {
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, []);
  
  
  const handleSelectAnswer = (answerId) => {
    setSelectedAnswer(answerId);
  };
  
  
  const handleSubmitAnswer = (answerId) => {
    
    const finalAnswerId = answerId !== null ? answerId : selectedAnswer;
    
    
    if (timer) {
      clearInterval(timer);
    }
    
    
    setAnswered(true);
    
    
    if (gameState.gameCode && gameState.currentQuestion) {
      submitAnswer(
        gameState.gameCode,
        gameState.currentQuestion.id,
        finalAnswerId
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
  
  
  if (gameState.gameOver) {
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
                    {player.correctAnswers}/{player.totalAnswers} correct
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="game-actions mt-lg">
          <Button variant="primary" onClick={resetGame}>
            Play Another Game
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
            Time: {formatTime(timeLeft)}
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
                className={`answer-option ${selectedAnswer === answer.id ? 'selected' : ''} ${answered ? 'disabled' : ''}`}
                onClick={() => !answered && handleSelectAnswer(answer.id)}
                disabled={answered}
              >
                {answer.text}
              </button>
            ))}
          </div>
          
          <div className="question-actions">
            <Button
              variant="primary"
              onClick={() => handleSubmitAnswer(selectedAnswer)}
              disabled={!selectedAnswer || answered}
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