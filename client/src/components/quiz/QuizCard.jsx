import { Link } from 'react-router-dom';
import { FaUser, FaQuestion, FaTrophy, FaCalendarAlt, FaEdit, FaTrash } from 'react-icons/fa';
import Button from '../common/Button';

const QuizCard = ({ quiz, onDelete, showActions = true }) => {
  // Default image if none is provided
  const imageUrl = quiz.image || '/assets/default-quiz.jpg';
  const fullImageUrl = imageUrl.startsWith('http') 
    ? imageUrl 
    : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${imageUrl}`;

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="quiz-card">
      <img src={fullImageUrl} alt={quiz.title} className="quiz-card-img" />
      
      <div className="quiz-card-body">
        <h3 className="quiz-card-title">{quiz.title}</h3>
        
        <div className="quiz-card-meta">
          <span>
            <FaUser /> {quiz.creator?.username || 'Anonymous'}
          </span>
          <span>
            <FaQuestion /> {quiz.questions?.length || 0} questions
          </span>
        </div>
        
        <p className="quiz-card-text">{quiz.description}</p>
        
        {quiz.category && (
          <div className="quiz-card-meta">
            <span>
              {quiz.category.map(cat => cat.name).join(', ')}
            </span>
            <span>
              <FaCalendarAlt /> {formatDate(quiz.createdAt)}
            </span>
          </div>
        )}
        
        {quiz.isDraft !== undefined && (
          <span className={`quiz-card-badge ${quiz.isDraft ? 'badge-draft' : 'badge-published'}`}>
            {quiz.isDraft ? 'Draft' : 'Published'}
          </span>
        )}
      </div>
      
      {showActions && (
        <div className="quiz-card-footer">
          {quiz.isDraft ? (
            <Link to={`/quizzes/edit/${quiz._id}`} className="btn btn-primary btn-sm">
              <FaEdit /> Edit
            </Link>
          ) : (
            <Link to={`/quizzes/play/${quiz._id}`} className="btn btn-primary btn-sm">
              Play
            </Link>
          )}
          
          {!quiz.isDraft && (
            <Link to={`/quizzes/${quiz._id}/leaderboard`} className="btn btn-secondary btn-sm">
              <FaTrophy /> Leaderboard
            </Link>
          )}
          
          {onDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(quiz._id)}
              aria-label="Delete quiz"
            >
              <FaTrash />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizCard;