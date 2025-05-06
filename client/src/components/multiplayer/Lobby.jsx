import { useContext } from 'react';
import { SocketContext } from '../../contexts/SocketContext';
import { leaveGame } from '../../services/socket';
import Button from '../common/Button';
import { FaPlay, FaUsers, FaCopy, FaSignOutAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Lobby = ({ isHost, onStartGame, readyToStart }) => {
  const { gameState, resetGame } = useContext(SocketContext);
  
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(gameState.gameCode);
    toast.info('Game code copied to clipboard!');
  };
  
  
  const handleLeaveGame = () => {
    if (window.confirm('Are you sure you want to leave this game?')) {
      leaveGame(gameState.gameCode);
      resetGame();
    }
  };
  
  return (
    <div className="game-lobby">
      <div className="lobby-header">
        <h2>{gameState.quiz?.title} - Game Lobby</h2>
        
        <div className="game-code-container">
          <div className="game-code">
            Game Code: <span className="code">{gameState.gameCode}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCopyCode}
            aria-label="Copy game code"
          >
            <FaCopy />
          </Button>
        </div>
      </div>
      
      <div className="lobby-content">
        <div className="players-list card">
          <h3><FaUsers /> Players ({gameState.players?.length || 0})</h3>
          
          {gameState.players?.length > 0 ? (
            <ul className="players">
              {gameState.players.map((player, index) => (
                <li key={player.id} className="player-item">
                  <span className="player-number">{index + 1}</span>
                  <span className="player-name">{player.username}</span>
                  {isHost && player.id === gameState.hostId && (
                    <span className="host-badge">Host</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-players">No players have joined yet...</p>
          )}
        </div>
        
        <div className="lobby-info card">
          <h3>Game Info</h3>
          <p>Quiz: {gameState.quiz?.title}</p>
          <p>Questions: {gameState.quiz?.questionCount}</p>
          
          {isHost ? (
            <div className="host-instructions">
              <h4>Host Instructions:</h4>
              <ol>
                <li>Share the game code with participants</li>
                <li>Wait for players to join (minimum 2 players)</li>
                <li>Start the game when everyone is ready</li>
              </ol>
            </div>
          ) : (
            <div className="player-instructions">
              <h4>Player Instructions:</h4>
              <ol>
                <li>Wait for the host to start the game</li>
                <li>You'll see questions appear on your screen</li>
                <li>Answer as quickly as possible to earn more points</li>
              </ol>
            </div>
          )}
        </div>
      </div>
      
      <div className="lobby-actions">
        {isHost && (
          <Button
            variant="primary"
            onClick={onStartGame}
            disabled={!readyToStart || gameState.players?.length < 2}
          >
            <FaPlay /> Start Game
          </Button>
        )}
        
        <Button variant="danger" onClick={handleLeaveGame}>
          <FaSignOutAlt /> Leave Game
        </Button>
      </div>
      
      {isHost && !readyToStart && gameState.players?.length < 2 && (
        <div className="alert alert-info mt-md">
          You need at least 2 players to start the game.
        </div>
      )}
    </div>
  );
};

export default Lobby;