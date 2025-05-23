import { useState, useEffect, useContext } from 'react';
import { initSocket, disconnectSocket } from '../../services/socket';
import { AuthContext } from '../AuthContext';
import SocketContext from './SocketContext';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState({
    inGame: false,
    gameCode: null,
    isHost: false,
    players: [],
    currentQuestion: null,
    questionResults: null,
    gameOver: false,
    results: null,
    inProgress: false,
    readyToStart: false,
    hostId: null,
    quiz: null
  });
  
  const { user } = useContext(AuthContext);
  
  useEffect(() => {
    if (user) {
      const socketInstance = initSocket();
      
      socketInstance.on('connect', () => {
        setConnected(true);
      });
      
      socketInstance.on('disconnect', () => {
        setConnected(false);
      });
      
      socketInstance.on('player_joined', (data) => {
        setGameState(prev => ({
          ...prev,
          players: data.players
        }));
      });
      
      socketInstance.on('player_left', (data) => {
        setGameState(prev => ({
          ...prev,
          players: data.players
        }));
      });
      
      socketInstance.on('ready_to_start', () => {
        setGameState(prev => ({
          ...prev,
          readyToStart: true
        }));
      });
      
      socketInstance.on('game_started', (data) => {
        setGameState(prev => ({
          ...prev,
          inProgress: true,
          gameOver: false, // Reset gameOver state explicitly
          currentQuestion: {
            ...data.question,
            number: data.questionNumber,
            total: data.totalQuestions
          },
          questionResults: null
        }));
      });
      
      socketInstance.on('answer_received', (data) => {
        setGameState(prev => ({
          ...prev,
          lastAnswer: {
            isCorrect: data.isCorrect,
            points: data.points,
            totalScore: data.totalScore
          }
        }));
      });
      
      socketInstance.on('question_results', (data) => {
        setGameState(prev => ({
          ...prev,
          questionResults: data.results,
          currentQuestion: null
        }));
      });
      
      socketInstance.on('next_question', (data) => {
        setGameState(prev => ({
          ...prev,
          currentQuestion: {
            ...data.question,
            number: data.questionNumber,
            total: data.totalQuestions
          },
          questionResults: null
        }));
      });
      
      socketInstance.on('game_over', (data) => {
        setGameState(prev => ({
          ...prev,
          gameOver: true,
          results: data.results,
          inProgress: true, // Keep this true to prevent switching to lobby
          currentQuestion: null,
          questionResults: null
        }));
      });
      
      socketInstance.on('game_canceled', () => {
        resetGame();
      });
      
      setSocket(socketInstance);
      
      return () => {
        disconnectSocket();
        setSocket(null);
        setConnected(false);
      };
    }
  }, [user]);
  
  const setUpGame = (gameData, isHost = false) => {
    setGameState({
      inGame: true,
      gameCode: gameData.gameCode,
      quiz: gameData.quiz,
      isHost,
      players: [],
      currentQuestion: null,
      questionResults: null,
      gameOver: false,
      results: null,
      inProgress: false,
      readyToStart: false,
      hostId: isHost ? user?.id : null
    });
  };
  
  const resetGame = () => {
    setGameState({
      inGame: false,
      gameCode: null,
      isHost: false,
      players: [],
      currentQuestion: null,
      questionResults: null,
      gameOver: false,
      results: null,
      inProgress: false,
      readyToStart: false,
      hostId: null,
      quiz: null
    });
  };
  
  const value = {
    socket,
    connected,
    gameState,
    setUpGame,
    resetGame
  };
  
  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;