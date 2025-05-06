const Quiz = require('./models/Quiz');
const QuizAttempt = require('./models/Quiz_Attempt');
const User = require('./models/User');

// Generate a random 6-digit code
const generateGameCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store active game sessions
const activeGames = new Map();
// Structure: { 
//   gameCode: {
//     quiz: quizObject,
//     host: userId,
//     players: [{ id: socketId, userId, username, score: 0, answers: [] }],
//     status: 'waiting'|'active'|'finished',
//     currentQuestion: 0,
//     startTime: Date,
//     results: []
//   }
// }

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        
        // Host creates a new game
        socket.on('create_game', async ({ quizId, userId }) => {
            try {
                // Fetch the quiz
                const quiz = await Quiz.findById(quizId)
                    .populate('questions')
                    .populate('settings');
                
                if (!quiz) {
                    return socket.emit('error', { message: 'Quiz not found' });
                }
                
                // Get the host user
                const user = await User.findById(userId);
                if (!user) {
                    return socket.emit('error', { message: 'User not found' });
                }
                
                // Check if multiplayer is enabled for this quiz
                if (quiz.settings && !quiz.settings.multiplayer) {
                    return socket.emit('error', { message: 'Multiplayer is not enabled for this quiz' });
                }
                
                // Generate a unique game code
                let gameCode;
                do {
                    gameCode = generateGameCode();
                } while (activeGames.has(gameCode));
                
                // Create a new game session
                const gameSession = {
                    quiz,
                    host: userId,
                    players: [{
                        id: socket.id,
                        userId,
                        username: user.username,
                        score: 0,
                        answers: []
                    }],
                    status: 'waiting',
                    currentQuestion: 0,
                    startTime: null,
                    results: []
                };
                
                // Add the game to active games
                activeGames.set(gameCode, gameSession);
                
                // Join the socket to the game room
                socket.join(gameCode);
                
                // Send game created confirmation
                socket.emit('game_created', {
                    gameCode,
                    quiz: {
                        id: quiz._id,
                        title: quiz.title,
                        description: quiz.description,
                        questionCount: quiz.questions.length
                    }
                });
                
                // Broadcast to the room that a new player joined
                io.to(gameCode).emit('player_joined', {
                    players: gameSession.players.map(p => ({
                        id: p.id,
                        username: p.username
                    }))
                });
            } catch (err) {
                console.error('Create game error:', err);
                socket.emit('error', { message: 'Failed to create game' });
            }
        });
        
        // Player joins a game with code
        socket.on('join_game', async ({ gameCode, userId }) => {
            try {
                // Check if the game exists
                if (!activeGames.has(gameCode)) {
                    return socket.emit('error', { message: 'Game not found' });
                }
                
                const gameSession = activeGames.get(gameCode);
                
                // Check if the game is still accepting players
                if (gameSession.status !== 'waiting') {
                    return socket.emit('error', { message: 'Game has already started' });
                }
                
                // Check if the player limit is reached
                if (gameSession.players.length >= 20) {
                    return socket.emit('error', { message: 'Game is full' });
                }
                
                // Get the user
                const user = await User.findById(userId);
                if (!user) {
                    return socket.emit('error', { message: 'User not found' });
                }
                
                // Add player to the game
                gameSession.players.push({
                    id: socket.id,
                    userId,
                    username: user.username,
                    score: 0,
                    answers: []
                });
                
                // Join the socket to the game room
                socket.join(gameCode);
                
                // Send game joined confirmation
                socket.emit('game_joined', {
                    gameCode,
                    quiz: {
                        id: gameSession.quiz._id,
                        title: gameSession.quiz.title,
                        description: gameSession.quiz.description,
                        questionCount: gameSession.quiz.questions.length
                    }
                });
                
                // Broadcast to the room that a new player joined
                io.to(gameCode).emit('player_joined', {
                    players: gameSession.players.map(p => ({
                        id: p.id,
                        username: p.username
                    }))
                });
                
                // Check if we can start (at least 2 players)
                if (gameSession.players.length >= 2) {
                    io.to(gameCode).emit('ready_to_start');
                }
            } catch (err) {
                console.error('Join game error:', err);
                socket.emit('error', { message: 'Failed to join game' });
            }
        });
        
        // Host starts the game
        socket.on('start_game', ({ gameCode }) => {
            try {
                // Check if the game exists
                if (!activeGames.has(gameCode)) {
                    return socket.emit('error', { message: 'Game not found' });
                }
                
                const gameSession = activeGames.get(gameCode);
                
                // Check if user is the host
                const player = gameSession.players.find(p => p.id === socket.id);
                if (!player || player.userId.toString() !== gameSession.host.toString()) {
                    return socket.emit('error', { message: 'Only the host can start the game' });
                }
                
                // Check if we have enough players
                if (gameSession.players.length < 2) {
                    return socket.emit('error', { message: 'Need at least 2 players to start' });
                }
                
                // Start the game
                gameSession.status = 'active';
                gameSession.startTime = new Date();
                
                // Send first question
                const currentQuestion = gameSession.quiz.questions[0];
                const sanitizedQuestion = {
                    id: currentQuestion._id,
                    title: currentQuestion.title,
                    text: currentQuestion.text,
                    type: currentQuestion.type,
                    image: currentQuestion.image,
                    time_limit: currentQuestion.time_limit,
                    max_points: currentQuestion.max_points
                };

                
                // If it's a multiple choice, send the answers without marking which is correct
                if (currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false') {
                    sanitizedQuestion.answers = currentQuestion.answers.map(a => ({
                        id: a._id,
                        text: a.text
                    }));
                }
                
                // Broadcast game started with first question
                io.to(gameCode).emit('game_started', {
                    question: sanitizedQuestion,
                    questionNumber: 1,
                    totalQuestions: gameSession.quiz.questions.length
                });
            } catch (err) {
                console.error('Start game error:', err);
                socket.emit('error', { message: 'Failed to start game' });
            }
        });
        
        // Player submits an answer
        socket.on('submit_answer', ({ gameCode, questionId, answerId }) => {
            try {
                // Check if the game exists
                if (!activeGames.has(gameCode)) {
                    return socket.emit('error', { message: 'Game not found' });
                }
                
                const gameSession = activeGames.get(gameCode);
                
                // Check if game is active
                if (gameSession.status !== 'active') {
                    return socket.emit('error', { message: 'Game is not active' });
                }
                
                // Find the player
                const playerIndex = gameSession.players.findIndex(p => p.id === socket.id);
                if (playerIndex === -1) {
                    return socket.emit('error', { message: 'Player not found in game' });
                }
                
                // Get the current question
                const currentQuestion = gameSession.quiz.questions[gameSession.currentQuestion];
                
                // Validate question ID
                if (currentQuestion._id.toString() !== questionId) {
                    return socket.emit('error', { message: 'Invalid question' });
                }
                
                // Check if player already answered
                if (gameSession.players[playerIndex].answers.some(a => a.questionId === questionId)) {
                    return socket.emit('error', { message: 'Already answered this question' });
                }
                
                // Calculate score based on correct answer and time
                let isCorrect = false;
                let points = 0;
                
                if (currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false') {
                    // Find if answer is correct
                    const correctAnswer = currentQuestion.answers.find(a => a.isCorrect);
                    isCorrect = correctAnswer && correctAnswer._id.toString() === answerId;
                    
                    if (isCorrect) {
                        // Determine how quickly they answered
                        const maxPoints = currentQuestion.max_points;
                        points = maxPoints; // Full points for now (could add time factor later)
                    }
                }
                
                // Record the answer
                gameSession.players[playerIndex].answers.push({
                    questionId,
                    answerId,
                    isCorrect,
                    points
                });
                
                // Update player's score
                gameSession.players[playerIndex].score += points;
                
                // Acknowledge the answer was received
                socket.emit('answer_received', {
                    isCorrect,
                    points,
                    totalScore: gameSession.players[playerIndex].score
                });
                
                // Check if all players have answered
                const allAnswered = gameSession.players.every(p => 
                    p.answers.some(a => a.questionId === questionId)
                );
                
                if (allAnswered) {
                    // Send results for this question
                    const questionResults = gameSession.players.map(p => ({
                        username: p.username,
                        score: p.score,
                        isCorrect: p.answers.find(a => a.questionId === questionId)?.isCorrect || false
                    }));
                    
                    // Sort by score (highest first)
                    questionResults.sort((a, b) => b.score - a.score);
                    
                    io.to(gameCode).emit('question_results', {
                        results: questionResults
                    });
                    
                    // Check if this was the last question
                    if (gameSession.currentQuestion >= gameSession.quiz.questions.length - 1) {
                        // Game is over
                        gameSession.status = 'finished';
                        
                        // Calculate final results
                        const finalResults = gameSession.players.map(p => ({
                            userId: p.userId,
                            username: p.username,
                            score: p.score,
                            correctAnswers: p.answers.filter(a => a.isCorrect).length
                        }));
                        
                        // Sort by score (highest first)
                        finalResults.sort((a, b) => b.score - a.score);
                        
                        // Store the results
                        gameSession.results = finalResults;
                        
                        // Save quiz attempts to the database
                        finalResults.forEach(async (result) => {
                            try {
                                const quizAttempt = new QuizAttempt({
                                    user: result.userId,
                                    quiz: gameSession.quiz._id,
                                    isMultiplayer: true,
                                    score: {
                                        points: result.score,
                                        correctAnswers: result.correctAnswers,
                                        totalQuestions: gameSession.quiz.questions.length
                                    }
                                });
                                
                                await quizAttempt.save();
                                
                                // Add attempt to quiz
                                await Quiz.findByIdAndUpdate(
                                    gameSession.quiz._id,
                                    { $push: { quiz_attempts: quizAttempt._id } }
                                );
                            } catch (err) {
                                console.error('Save quiz attempt error:', err);
                            }
                        });
                        
                        // Send game over event
                        io.to(gameCode).emit('game_over', {
                            results: finalResults
                        });
                        
                        // Clean up after a delay
                        setTimeout(() => {
                            activeGames.delete(gameCode);
                        }, 30 * 60 * 1000); // Keep results for 30 minutes
                    } else {
                        // Move to the next question
                        gameSession.currentQuestion++;
                        const nextQuestion = gameSession.quiz.questions[gameSession.currentQuestion];
                        
                        // Prepare the next question
                        const sanitizedQuestion = {
                            id: nextQuestion._id,
                            title: nextQuestion.title,
                            text: nextQuestion.text,
                            type: nextQuestion.type,
                            image: nextQuestion.image,
                            time_limit: nextQuestion.time_limit,
                            max_points: nextQuestion.max_points
                        };
                        
                        // If it's a multiple choice, send the answers without marking which is correct
                        if (nextQuestion.type === 'multiple-choice' || nextQuestion.type === 'true-false') {
                            sanitizedQuestion.answers = nextQuestion.answers.map(a => ({
                                id: a._id,
                                text: a.text
                            }));
                        }
                        
                        // Send next question after a delay
                        setTimeout(() => {
                            io.to(gameCode).emit('next_question', {
                                question: sanitizedQuestion,
                                questionNumber: gameSession.currentQuestion + 1,
                                totalQuestions: gameSession.quiz.questions.length
                            });
                        }, 5000); // 5 second delay between questions
                    }
                }
            } catch (err) {
                console.error('Submit answer error:', err);
                socket.emit('error', { message: 'Failed to submit answer' });
            }
        });
        
        // Player leaves the game
        socket.on('leave_game', ({ gameCode }) => {
            try {
                // Check if the game exists
                if (!activeGames.has(gameCode)) {
                    return;
                }
                
                const gameSession = activeGames.get(gameCode);
                
                // Remove player from the game
                const playerIndex = gameSession.players.findIndex(p => p.id === socket.id);
                if (playerIndex !== -1) {
                    const player = gameSession.players[playerIndex];
                    gameSession.players.splice(playerIndex, 1);
                    
                    // Broadcast that a player left
                    io.to(gameCode).emit('player_left', {
                        players: gameSession.players.map(p => ({
                            id: p.id,
                            username: p.username
                        })),
                        leftPlayer: {
                            username: player.username
                        }
                    });
                    
                    // If the host left, end the game
                    if (player.userId.toString() === gameSession.host.toString() && gameSession.status !== 'finished') {
                        gameSession.status = 'finished';
                        io.to(gameCode).emit('game_canceled', {
                            message: 'Host left the game'
                        });
                        
                        // Clean up after a delay
                        setTimeout(() => {
                            activeGames.delete(gameCode);
                        }, 5 * 60 * 1000); // Keep for 5 minutes
                    }
                    
                    // If no players left, remove the game
                    if (gameSession.players.length === 0) {
                        activeGames.delete(gameCode);
                    }
                }
                
                // Leave the socket room
                socket.leave(gameCode);
            } catch (err) {
                console.error('Leave game error:', err);
            }
        });
        
        // Handle disconnections
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            
            // Find any games this socket is in
            for (const [gameCode, gameSession] of activeGames.entries()) {
                const playerIndex = gameSession.players.findIndex(p => p.id === socket.id);
                if (playerIndex !== -1) {
                    // Handle as if the player left the game
                    const player = gameSession.players[playerIndex];
                    gameSession.players.splice(playerIndex, 1);
                    
                    // Broadcast that a player left
                    io.to(gameCode).emit('player_left', {
                        players: gameSession.players.map(p => ({
                            id: p.id,
                            username: p.username
                        })),
                        leftPlayer: {
                            username: player.username
                        }
                    });
                    
                    // If the host left, end the game
                    if (player.userId.toString() === gameSession.host.toString() && gameSession.status !== 'finished') {
                        gameSession.status = 'finished';
                        io.to(gameCode).emit('game_canceled', {
                            message: 'Host left the game'
                        });
                        
                        // Clean up after a delay
                        setTimeout(() => {
                            activeGames.delete(gameCode);
                        }, 5 * 60 * 1000); // Keep for 5 minutes
                    }
                    
                    // If no players left, remove the game
                    if (gameSession.players.length === 0) {
                        activeGames.delete(gameCode);
                    }
                }
            }
        });
    });
};