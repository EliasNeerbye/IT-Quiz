import { io } from 'socket.io-client';

// Create a Socket.IO instance
let socket = null;

// Initialize socket connection
export const initSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL, {
      withCredentials: true,
    });
    
    socket.on('connect', () => {
      console.log('Socket connected');
    });
    
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
    
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }
  
  return socket;
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Host a game
export const createGame = (quizId, userId) => {
  return new Promise((resolve, reject) => {
    if (!socket) {
      initSocket();
    }
    
    socket.emit('create_game', { quizId, userId });
    
    socket.once('game_created', (data) => {
      resolve(data);
    });
    
    socket.once('error', (error) => {
      reject(error);
    });
  });
};

// Join a game
export const joinGame = (gameCode, userId) => {
  return new Promise((resolve, reject) => {
    if (!socket) {
      initSocket();
    }
    
    socket.emit('join_game', { gameCode, userId });
    
    socket.once('game_joined', (data) => {
      resolve(data);
    });
    
    socket.once('error', (error) => {
      reject(error);
    });
  });
};

// Start a game
export const startGame = (gameCode) => {
  if (!socket) {
    initSocket();
  }
  
  socket.emit('start_game', { gameCode });
};

// Submit an answer
export const submitAnswer = (gameCode, questionId, answerId) => {
  if (!socket) {
    initSocket();
  }
  
  socket.emit('submit_answer', { gameCode, questionId, answerId });
};

// Leave a game
export const leaveGame = (gameCode) => {
  if (!socket) {
    return;
  }
  
  socket.emit('leave_game', { gameCode });
};