import { useState, useEffect, useContext } from 'react';
import { SocketContext } from '../../contexts/SocketContext';
import { AuthContext } from '../../contexts/AuthContext';
import { getUserQuizzes } from '../../services/quiz';
import { createGame, startGame } from '../../services/socket';
import Button from '../common/Button';
import Lobby from './Lobby';
import MultiplayerGame from './MultiplayerGame';
import { FaPlay, FaUsers, FaSpinner } from 'react-icons/fa';

const HostGame = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creatingGame, setCreatingGame] = useState(false);
  
  const { user } = useContext(AuthContext);
  const { gameState, setUpGame } = useContext(SocketContext);
  
  // Fetch user's published quizzes
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const response = await getUserQuizzes();
        
        // Filter out draft quizzes
        const publishedQuizzes = response.quizzes.filter(quiz => !quiz.isDraft);
        setQuizzes(publishedQuizzes);
        
        if (publishedQuizzes.length > 0) {
          setSelectedQuiz(publishedQuizzes[0]._id);
        }
      } catch (err) {
        console.error('Failed to fetch quizzes:', err);
        setError('Failed to load your quizzes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuizzes();
  }, []);
  
  // Handle hosting a game
  const handleHostGame = async () => {
    if (!selectedQuiz) {
      setError('Please select a quiz to host');
      return;
    }
    
    try {
      setCreatingGame(true);
      
      // Create a new game
      const gameData = await createGame(selectedQuiz, user.id);
      
      // Set up game state
      setUpGame(gameData, true);
    } catch (err) {
      console.error('Failed to create game:', err);
      setError('Failed to create a new game. Please try again.');
    } finally {
      setCreatingGame(false);
    }
  };
  
  // Handle starting the game
  const handleStartGame = () => {
    if (gameState.gameCode) {
      startGame(gameState.gameCode);
    }
  };
  
  // If in a game, show game component
  if (gameState.inGame) {
    if (gameState.inProgress) {
      return <MultiplayerGame />;
    }
    
    return (
      <Lobby 
        isHost={true} 
        onStartGame={handleStartGame} 
        readyToStart={gameState.readyToStart}
      />
    );
  }
  
  // If no published quizzes, show message
  if (!loading && quizzes.length === 0) {
    return (
      <div className="empty-quizzes-container">
        <div className="alert alert-info">
          You don't have any published quizzes yet. Please publish a quiz first to host a multiplayer game.
        </div>
      </div>
    );
  }
  
  return (
    <div className="host-game-container">
      <h2>Host a Multiplayer Game</h2>
      
      {error && (
        <div className="alert alert-danger">{error}</div>
      )}
      
      {loading ? (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      ) : (
        <div className="host-form">
          <div className="form-group">
            <label htmlFor="quiz-select">Select a Quiz to Host</label>
            <select
              id="quiz-select"
              value={selectedQuiz}
              onChange={(e) => setSelectedQuiz(e.target.value)}
              disabled={creatingGame}
            >
              {quizzes.map((quiz) => (
                <option key={quiz._id} value={quiz._id}>
                  {quiz.title} ({quiz.questions.length} questions)
                </option>
              ))}
            </select>
          </div>
          
          <Button
            variant="primary"
            onClick={handleHostGame}
            disabled={creatingGame || !selectedQuiz}
            fullWidth
          >
            {creatingGame ? (
              <>
                <FaSpinner className="fa-spin" /> Creating Game...
              </>
            ) : (
              <>
                <FaUsers /> Host Game
              </>
            )}
          </Button>
        </div>
      )}
      
      <div className="host-instructions mt-lg">
        <h3>How to Host</h3>
        <ol>
          <li>Select one of your published quizzes from the dropdown</li>
          <li>Click "Host Game" to create a new game session</li>
          <li>Share the game code with participants</li>
          <li>Start the game when everyone has joined</li>
        </ol>
      </div>
    </div>
  );
};

export default HostGame;