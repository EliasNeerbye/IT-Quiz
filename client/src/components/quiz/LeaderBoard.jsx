import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizLeaderboard, getQuizById } from '../../services/quiz';
import Button from '../common/Button';
import { FaArrowLeft, FaTrophy, FaMedal, FaUser } from 'react-icons/fa';

const LeaderBoard = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        
        const [quizResponse, leaderboardResponse] = await Promise.all([
          getQuizById(quizId),
          getQuizLeaderboard(quizId)
        ]);
        
        setQuiz(quizResponse.quiz);
        setLeaderboard(leaderboardResponse.leaderboard || []);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
        setError(err.response?.data?.error || 'Failed to load leaderboard. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [quizId]);
  
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="alert alert-danger">{error}</div>
    );
  }
  
  if (!quiz) {
    return (
      <div className="alert alert-warning">Quiz not found or you don't have permission to view it.</div>
    );
  }
  
  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h2><FaTrophy /> Leaderboard: {quiz.title}</h2>
        <Button variant="secondary" size="sm" onClick={() => navigate(`/quizzes/play/${quizId}`)}>
          <FaArrowLeft /> Back to Quiz
        </Button>
      </div>
      
      {leaderboard.length === 0 ? (
        <div className="empty-leaderboard card text-center py-lg">
          <p>No quiz attempts yet. Be the first to play this quiz!</p>
        </div>
      ) : (
        <div className="leaderboard-table-container">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Score</th>
                <th>Correct</th>
                <th>Completion Date</th>
                <th>Multiplayer</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr key={entry._id} className={index < 3 ? `top-${index + 1}` : ''}>
                  <td className="rank-column">
                    {index === 0 ? (
                      <FaMedal className="gold-medal" />
                    ) : index === 1 ? (
                      <FaMedal className="silver-medal" />
                    ) : index === 2 ? (
                      <FaMedal className="bronze-medal" />
                    ) : (
                      index + 1
                    )}
                  </td>
                  <td className="player-column">
                    <FaUser /> {entry.user?.username || 'Anonymous'}
                  </td>
                  <td className="score-column">{entry.score.points}</td>
                  <td className="correct-column">
                    {entry.score.correctAnswers} / {entry.score.totalQuestions}
                  </td>
                  <td className="date-column">{formatDate(entry.createdAt)}</td>
                  <td className="multiplayer-column">
                    {entry.isMultiplayer ? 'Yes' : 'No'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LeaderBoard;