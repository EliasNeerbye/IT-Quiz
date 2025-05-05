const Quiz = require('../models/Quiz');

const rooms = new Map();

module.exports = (io) => {
    io.on('connection', (socket) => {
        socket.on('join_quiz', async ({ quizId, userId, username }) => {
            try {
                const quiz = await Quiz.findById(quizId)
                    .populate('settings')
                    .populate('questions');
                
                if (!quiz) {
                    socket.emit('error', 'Quiz not found');
                    return;
                }

                if (!quiz.settings.multiplayer) {
                    socket.emit('error', 'This quiz is not multiplayer enabled');
                    return;
                }

                const room = rooms.get(quizId) || {
                    players: new Map(),
                    quiz,
                    started: false
                };

                if (room.started) {
                    socket.emit('error', 'Game already in progress');
                    return;
                }

                room.players.set(userId, { 
                    socket, 
                    username,
                    score: 0,
                    answers: []
                });

                socket.join(quizId);
                rooms.set(quizId, room);

                io.to(quizId).emit('player_joined', {
                    players: Array.from(room.players.values()).map(p => ({
                        username: p.username,
                        score: p.score
                    }))
                });
            } catch (error) {
                socket.emit('error', 'Server error');
            }
        });

        socket.on('start_quiz', ({ quizId }) => {
            const room = rooms.get(quizId);
            if (!room || room.started) return;

            room.started = true;
            room.currentQuestion = 0;
            
            io.to(quizId).emit('quiz_started', {
                question: room.quiz.questions[0],
                timeLimit: room.quiz.settings.default_time_limit
            });
        });

        socket.on('submit_answer', ({ quizId, userId, answer }) => {
            const room = rooms.get(quizId);
            if (!room || !room.started) return;

            const player = room.players.get(userId);
            if (!player) return;

            const question = room.quiz.questions[room.currentQuestion];
            let points = 0;

            switch (question.type) {
                case 'multiple-choice':
                case 'true-false':
                    if (question.answers.find(a => a.isCorrect)?.text === answer) {
                        points = question.max_points;
                    }
                    break;
                case 'correct-order':
                    if (JSON.stringify(answer) === JSON.stringify(question.answers.map(a => a.text))) {
                        points = question.max_points;
                    }
                    break;
            }

            player.score += points;
            player.answers.push({ answer, points });

            if (Array.from(room.players.values()).every(p => p.answers.length > room.currentQuestion)) {
                room.currentQuestion++;
                
                if (room.currentQuestion >= room.quiz.questions.length) {
                    io.to(quizId).emit('quiz_ended', {
                        final_scores: Array.from(room.players.values()).map(p => ({
                            username: p.username,
                            score: p.score
                        }))
                    });
                    rooms.delete(quizId);
                } else {
                    io.to(quizId).emit('next_question', {
                        question: room.quiz.questions[room.currentQuestion],
                        timeLimit: room.quiz.settings.default_time_limit,
                        scores: Array.from(room.players.values()).map(p => ({
                            username: p.username,
                            score: p.score
                        }))
                    });
                }
            }
        });

        socket.on('disconnect', () => {
            for (const [quizId, room] of rooms) {
                for (const [userId, player] of room.players) {
                    if (player.socket === socket) {
                        room.players.delete(userId);
                        io.to(quizId).emit('player_left', {
                            players: Array.from(room.players.values()).map(p => ({
                                username: p.username,
                                score: p.score
                            }))
                        });
                        if (room.players.size === 0) {
                            rooms.delete(quizId);
                        }
                        break;
                    }
                }
            }
        });
    });
};