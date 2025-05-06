import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../contexts/AuthContext';
import { getUserQuizzes } from '../services/quiz';
import { deleteAccount } from '../services/auth';
import QuizCard from '../components/quiz/QuizCard';
import Button from '../components/common/Button';
import { FaUserCircle, FaEnvelope, FaCalendarAlt, FaPlus, FaTrash } from 'react-icons/fa';

const ProfilePage = () => {
  const { user, logout } = useContext(AuthContext);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const navigate = useNavigate();
  
  
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const response = await getUserQuizzes();
        setQuizzes(response.quizzes || []);
      } catch (err) {
        console.error('Failed to fetch quizzes:', err);
        setError('Failed to load your quizzes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuizzes();
  }, []);
  
  
  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you ABSOLUTELY sure you want to delete your account? This action CANNOT be undone!')) {
      return;
    }
    
    try {
      await deleteAccount();
      await logout();
      toast.success('Your account has been deleted successfully');
      navigate('/');
    } catch (err) {
      console.error('Failed to delete account:', err);
      toast.error(err.response?.data?.error || 'Failed to delete your account. Please try again.');
    }
  };
  
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (!user) {
    return (
      <div className="container py-lg">
        <div className="alert alert-warning">
          You need to be logged in to view your profile.
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-lg">
      <div className="profile-container">
        <div className="profile-header">
          <h1>My Profile</h1>
          
          <Button
            variant="primary"
            onClick={() => navigate('/quizzes/create')}
          >
            <FaPlus /> Create Quiz
          </Button>
        </div>
        
        <div className="profile-info card">
          <div className="profile-detail">
            <span className="profile-detail-label">
              <FaUserCircle /> Username
            </span>
            <span>{user.username}</span>
          </div>
          
          <div className="profile-detail">
            <span className="profile-detail-label">
              <FaEnvelope /> Email
            </span>
            <span>{user.email}</span>
          </div>
          
          <div className="profile-detail">
            <span className="profile-detail-label">
              <FaCalendarAlt /> Joined
            </span>
            <span>{user.createdAt ? formatDate(user.createdAt) : 'N/A'}</span>
          </div>
          
          <div className="profile-actions">
            <Button
              variant="danger"
              onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
            >
              <FaTrash /> Delete Account
            </Button>
          </div>
          
          {showDeleteConfirm && (
            <div className="delete-account-confirm">
              <p>
                <strong>Warning:</strong> Deleting your account will permanently remove all your data, including quizzes you've created.
                This action cannot be undone.
              </p>
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
              >
                I understand, delete my account
              </Button>
            </div>
          )}
        </div>
        
        <div className="profile-quizzes">
          <h2>My Quizzes</h2>
          
          {loading ? (
            <div className="loader-container">
              <div className="loader"></div>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : quizzes.length === 0 ? (
            <div className="empty-state card text-center py-lg">
              <p>You haven't created any quizzes yet.</p>
              <Button
                variant="primary"
                onClick={() => navigate('/quizzes/create')}
              >
                <FaPlus /> Create Your First Quiz
              </Button>
            </div>
          ) : (
            <div className="quiz-grid">
              {quizzes.map((quiz) => (
                <QuizCard
                  key={quiz._id}
                  quiz={quiz}
                  onDelete={(quizId) => {
                    toast.success('Quiz deletion functionality will be added in a future update');
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;