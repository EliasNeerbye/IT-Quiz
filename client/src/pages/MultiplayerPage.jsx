import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { getUserQuizzes } from '../services/quiz';
import HostGame from '../components/multiplayer/HostGame';
import JoinGame from '../components/multiplayer/JoinGame';
import Button from '../components/common/Button';
import { FaGamepad, FaUsers, FaPlusCircle } from 'react-icons/fa';

const MultiplayerPage = () => {
  const [activeTab, setActiveTab] = useState('join');
  const { user } = useContext(AuthContext);

  return (
    <div className="container py-lg">
      <h1 className="text-center mb-lg">IT Quiz Multiplayer</h1>
      
      <div className="multiplayer-options">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'join' ? 'active' : ''}`}
            onClick={() => setActiveTab('join')}
          >
            <FaGamepad /> Join a Game
          </button>
          <button 
            className={`tab ${activeTab === 'host' ? 'active' : ''}`}
            onClick={() => setActiveTab('host')}
          >
            <FaUsers /> Host a Game
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'join' ? (
            <JoinGame />
          ) : (
            <HostGame />
          )}
        </div>
      </div>
      
      <div className="multiplayer-info mt-xl">
        <div className="card">
          <h2>How to Play Multiplayer</h2>
          <div className="multiplayer-instructions">
            <div className="instruction-section">
              <h3>Joining a Game</h3>
              <ol>
                <li>Ask the host for their game code</li>
                <li>Enter the code in the "Join a Game" tab</li>
                <li>Wait for the host to start the game</li>
                <li>Answer questions as quickly as possible to earn more points</li>
              </ol>
            </div>
            
            <div className="instruction-section">
              <h3>Hosting a Game</h3>
              <ol>
                <li>Select one of your published quizzes</li>
                <li>Share the generated game code with friends</li>
                <li>Wait for players to join</li>
                <li>Start the game when everyone is ready</li>
                <li>See real-time results as players answer questions</li>
              </ol>
            </div>
          </div>
          
          <div className="text-center mt-lg">
            <Link to="/quizzes/create" className="btn btn-primary">
              <FaPlusCircle /> Create a Quiz for Multiplayer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerPage;