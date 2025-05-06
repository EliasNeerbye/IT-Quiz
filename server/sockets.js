const Quiz = require('./models/Quiz');
const QuizAttempt = require('./models/Quiz_Attempt');
const User = require('./models/User');


const generateGameCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};


const activeGames = new Map();












module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        
        
        socket.on('create_game', async ({ quizId, userId }) => {
            try {
                
                const quiz = await Quiz.findById(quizId)
                    .populate('questions')
                    .populate('settings');
                
                if (!quiz) {
                    return socket.emit('error', { message: 'Quiz not found' });
                }
                
                
                const user = await User.findById(userId);
                if (!user) {
                    return socket.emit('error', { message: 'User not found' });
                }
                
                
                if (quiz.settings && !quiz.settings.multiplayer) {
                    return socket.emit('error', { message: 'Multiplayer is not enabled for this quiz' });
                }
                
                
                let gameCode;
                do {
                    gameCode = generateGameCode();
                } while (activeGames.has(gameCode));
                
                
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
                
                
                activeGames.set(gameCode, gameSession);
                
                
                socket.join(gameCode);
                
                
                socket.emit('game_created', {
                    gameCode,
                    quiz: {
                        id: quiz._id,
                        title: quiz.title,
                        description: quiz.description,
                        questionCount: quiz.questions.length
                    }
                });
                
                
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
        
        
        socket.on('join_game', async ({ gameCode, userId }) => {
            try {
                
                if (!activeGames.has(gameCode)) {
                    return socket.emit('error', { message: 'Game not found' });
                }
                
                const gameSession = activeGames.get(gameCode);
                
                
                if (gameSession.status !== 'waiting') {
                    return socket.emit('error', { message: 'Game has already started' });
                }
                
                
                if (gameSession.players.length >= 20) {
                    return socket.emit('error', { message: 'Game is full' });
                }
                
                
                const user = await User.findById(userId);
                if (!user) {
                    return socket.emit('error', { message: 'User not found' });
                }
                
                
                gameSession.players.push({
                    id: socket.id,
                    userId,
                    username: user.username,
                    score: 0,
                    answers: []
                });
                
                
                socket.join(gameCode);
                
                
                socket.emit('game_joined', {
                    gameCode,
                    quiz: {
                        id: gameSession.quiz._id,
                        title: gameSession.quiz.title,
                        description: gameSession.quiz.description,
                        questionCount: gameSession.quiz.questions.length
                    }
                });
                
                
                io.to(gameCode).emit('player_joined', {
                    players: gameSession.players.map(p => ({
                        id: p.id,
                        username: p.username
                    }))
                });
                
                
                if (gameSession.players.length >= 2) {
                    io.to(gameCode).emit('ready_to_start');
                }
            } catch (err) {
                console.error('Join game error:', err);
                socket.emit('error', { message: 'Failed to join game' });
            }
        });
        
        
        socket.on('start_game', ({ gameCode }) => {
            try {
                
                if (!activeGames.has(gameCode)) {
                    return socket.emit('error', { message: 'Game not found' });
                }
                
                const gameSession = activeGames.get(gameCode);
                
                
                const player = gameSession.players.find(p => p.id === socket.id);
                if (!player || player.userId.toString() !== gameSession.host.toString()) {
                    return socket.emit('error', { message: 'Only the host can start the game' });
                }
                
                
                if (gameSession.players.length < 2) {
                    return socket.emit('error', { message: 'Need at least 2 players to start' });
                }
                
                
                gameSession.status = 'active';
                gameSession.startTime = new Date();
                
                
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

                
                
                if (currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false') {
                    sanitizedQuestion.answers = currentQuestion.answers.map(a => ({
                        id: a._id,
                        text: a.text
                    }));
                }
                
                
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
        
        
        socket.on('submit_answer', ({ gameCode, questionId, answerId }) => {
            try {
                
                if (!activeGames.has(gameCode)) {
                    return socket.emit('error', { message: 'Game not found' });
                }
                
                const gameSession = activeGames.get(gameCode);
                
                
                if (gameSession.status !== 'active') {
                    return socket.emit('error', { message: 'Game is not active' });
                }
                
                
                const playerIndex = gameSession.players.findIndex(p => p.id === socket.id);
                if (playerIndex === -1) {
                    return socket.emit('error', { message: 'Player not found in game' });
                }
                
                
                const currentQuestion = gameSession.quiz.questions[gameSession.currentQuestion];
                
                
                if (currentQuestion._id.toString() !== questionId) {
                    return socket.emit('error', { message: 'Invalid question' });
                }
                
                
                if (gameSession.players[playerIndex].answers.some(a => a.questionId === questionId)) {
                    return socket.emit('error', { message: 'Already answered this question' });
                }
                
                
                let isCorrect = false;
                let points = 0;
                
                if (currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false') {
                    
                    const correctAnswer = currentQuestion.answers.find(a => a.isCorrect);
                    isCorrect = correctAnswer && correctAnswer._id.toString() === answerId;
                    
                    if (isCorrect) {
                        
                        const maxPoints = currentQuestion.max_points;
                        const timeElapsed = (new Date() - gameSession.startTime) / 1000; 
                        const timeLimit = currentQuestion.time_limit || 30; 
                        const timeBonus = Math.max(0, 1 - (timeElapsed / timeLimit)); 
                        points = Math.round(maxPoints * timeBonus); 
                    }
                }
                
                
                gameSession.players[playerIndex].answers.push({
                    questionId,
                    answerId,
                    isCorrect,
                    points
                });
                
                
                gameSession.players[playerIndex].score += points;
                
                
                socket.emit('answer_received', {
                    isCorrect,
                    points,
                    totalScore: gameSession.players[playerIndex].score
                });
                
                
                const allAnswered = gameSession.players.every(p => 
                    p.answers.some(a => a.questionId === questionId)
                );
                
                if (allAnswered) {
                    
                    const questionResults = gameSession.players.map(p => ({
                        username: p.username,
                        score: p.score,
                        isCorrect: p.answers.find(a => a.questionId === questionId)?.isCorrect || false
                    }));
                    
                    
                    questionResults.sort((a, b) => b.score - a.score);
                    
                    io.to(gameCode).emit('question_results', {
                        results: questionResults
                    });
                    
                    
                    if (gameSession.currentQuestion >= gameSession.quiz.questions.length - 1) {
                        
                        gameSession.status = 'finished';
                        
                        
                        const finalResults = gameSession.players.map(p => ({
                            userId: p.userId,
                            username: p.username,
                            score: p.score,
                            correctAnswers: p.answers.filter(a => a.isCorrect).length
                        }));
                        
                        
                        finalResults.sort((a, b) => b.score - a.score);
                        
                        
                        gameSession.results = finalResults;
                        
                        
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
                                
                                
                                await Quiz.findByIdAndUpdate(
                                    gameSession.quiz._id,
                                    { $push: { quiz_attempts: quizAttempt._id } }
                                );
                            } catch (err) {
                                console.error('Save quiz attempt error:', err);
                            }
                        });
                        
                        
                        io.to(gameCode).emit('game_over', {
                            results: finalResults
                        });
                        
                        
                        setTimeout(() => {
                            activeGames.delete(gameCode);
                        }, 30 * 60 * 1000); 
                    } else {
                        
                        gameSession.currentQuestion++;
                        const nextQuestion = gameSession.quiz.questions[gameSession.currentQuestion];
                        
                        
                        const sanitizedQuestion = {
                            id: nextQuestion._id,
                            title: nextQuestion.title,
                            text: nextQuestion.text,
                            type: nextQuestion.type,
                            image: nextQuestion.image,
                            time_limit: nextQuestion.time_limit,
                            max_points: nextQuestion.max_points
                        };
                        
                        
                        if (nextQuestion.type === 'multiple-choice' || nextQuestion.type === 'true-false') {
                            sanitizedQuestion.answers = nextQuestion.answers.map(a => ({
                                id: a._id,
                                text: a.text
                            }));
                        }
                        
                        
                        setTimeout(() => {
                            io.to(gameCode).emit('next_question', {
                                question: sanitizedQuestion,
                                questionNumber: gameSession.currentQuestion + 1,
                                totalQuestions: gameSession.quiz.questions.length
                            });
                        }, 5000); 
                    }
                }
            } catch (err) {
                console.error('Submit answer error:', err);
                socket.emit('error', { message: 'Failed to submit answer' });
            }
        });
        
        
        socket.on('leave_game', ({ gameCode }) => {
            try {
                
                if (!activeGames.has(gameCode)) {
                    return;
                }
                
                const gameSession = activeGames.get(gameCode);
                
                
                const playerIndex = gameSession.players.findIndex(p => p.id === socket.id);
                if (playerIndex !== -1) {
                    const player = gameSession.players[playerIndex];
                    gameSession.players.splice(playerIndex, 1);
                    
                    
                    io.to(gameCode).emit('player_left', {
                        players: gameSession.players.map(p => ({
                            id: p.id,
                            username: p.username
                        })),
                        leftPlayer: {
                            username: player.username
                        }
                    });
                    
                    
                    if (player.userId.toString() === gameSession.host.toString() && gameSession.status !== 'finished') {
                        gameSession.status = 'finished';
                        io.to(gameCode).emit('game_canceled', {
                            message: 'Host left the game'
                        });
                        
                        
                        setTimeout(() => {
                            activeGames.delete(gameCode);
                        }, 5 * 60 * 1000); 
                    }
                    
                    
                    if (gameSession.players.length === 0) {
                        activeGames.delete(gameCode);
                    }
                }
                
                
                socket.leave(gameCode);
            } catch (err) {
                console.error('Leave game error:', err);
            }
        });
        
        
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            
            
            for (const [gameCode, gameSession] of activeGames.entries()) {
                const playerIndex = gameSession.players.findIndex(p => p.id === socket.id);
                if (playerIndex !== -1) {
                    
                    const player = gameSession.players[playerIndex];
                    gameSession.players.splice(playerIndex, 1);
                    
                    
                    io.to(gameCode).emit('player_left', {
                        players: gameSession.players.map(p => ({
                            id: p.id,
                            username: p.username
                        })),
                        leftPlayer: {
                            username: player.username
                        }
                    });
                    
                    
                    if (player.userId.toString() === gameSession.host.toString() && gameSession.status !== 'finished') {
                        gameSession.status = 'finished';
                        io.to(gameCode).emit('game_canceled', {
                            message: 'Host left the game'
                        });
                        
                        
                        setTimeout(() => {
                            activeGames.delete(gameCode);
                        }, 5 * 60 * 1000); 
                    }
                    
                    
                    if (gameSession.players.length === 0) {
                        activeGames.delete(gameCode);
                    }
                }
            }
        });
    });
};