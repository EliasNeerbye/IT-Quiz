import { useState, useContext } from 'react';
import { SocketContext } from '../../contexts/socketContext';
import { AuthContext } from '../../contexts/AuthContext';
import { joinGame } from '../../services/socket';
import Button from '../common/Button';
import Lobby from './Lobby';
import MultiplayerGame from './MultiplayerGame';
import { FaSignInAlt, FaSpinner } from 'react-icons/fa';

const JoinGame = () => {
  const [gameCode, setGameCode] = useState('');
  const [joiningGame, setJoiningGame] = useState(false);
  const [error, setError] = useState(null);
  
  const { user } = useContext(AuthContext);
  const { gameState, setUpGame } = useContext(SocketContext);
  
  
  const handleJoinGame = async (e) => {
    e.preventDefault();
    
    if (!gameCode) {
      setError('Please enter a game code');
      return;
    }
    
    try {
      setJoiningGame(true);
      setError(null);
      
      
      const gameData = await joinGame(gameCode, user.id);
      
      
      setUpGame(gameData);
    } catch (err) {
      console.error('Failed to join game:', err);
      setError(err.message || 'Failed to join game. Please check the code and try again.');
    } finally {
      setJoiningGame(false);
    }
  };
  
  
  if (gameState.inGame) {
    if (gameState.inProgress) {
      return <MultiplayerGame />;
    }
    
    return <Lobby isHost={false} />;
  }
  
  return (
    <div className="join-game-container">
      <h2>Join a Multiplayer Game</h2>
      
      {error && (
        <div className="alert alert-danger">{error}</div>
      )}
      
      <form onSubmit={handleJoinGame} className="join-form">
        <div className="form-group">
          <label htmlFor="game-code">Enter Game Code</label>
          <input
            type="text"
            id="game-code"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value)}
            placeholder="Enter 6-digit code"
            disabled={joiningGame}
            required
            minLength={6}
            maxLength={6}
            pattern="[0-9]{6}"
          />
        </div>
        
        <Button
          type="submit"
          variant="primary"
          disabled={joiningGame || !gameCode}
          fullWidth
        >
          {joiningGame ? (
            <>
              <FaSpinner className="fa-spin" /> Joining...
            </>
          ) : (
            <>
              <FaSignInAlt /> Join Game
            </>
          )}
        </Button>
      </form>
      
      <div className="join-instructions mt-lg">
        <h3>How to Join</h3>
        <ol>
          <li>Get a 6-digit game code from the host</li>
          <li>Enter the code in the field above</li>
          <li>Click "Join Game" to enter the game lobby</li>
          <li>Wait for the host to start the game</li>
        </ol>
      </div>
    </div>
  );
};

export default JoinGame;