import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Button from '../common/Button';
import { FaTrash, FaEye, FaSearch, FaListAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AdminQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/quizzes');
        setQuizzes(response.data.quizzes || []);
        setFilteredQuizzes(response.data.quizzes || []);
      } catch (err) {
        console.error('Failed to fetch quizzes:', err);
        setError(err.response?.data?.error || 'Failed to load quizzes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuizzes();
  }, []);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredQuizzes(quizzes);
    } else {
      const filtered = quizzes.filter(quiz => 
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.creator?.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredQuizzes(filtered);
    }
  }, [searchTerm, quizzes]);
  
  const handleDeleteQuiz = async (quizId, title) => {
    if (!window.confirm(`Are you sure you want to delete the quiz "${title}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await api.delete(`/admin/quizzes/${quizId}`);
      
      setQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz._id !== quizId));
      toast.success(`Quiz "${title}" deleted successfully`);
    } catch (err) {
      console.error('Failed to delete quiz:', err);
      toast.error(err.response?.data?.error || 'Failed to delete quiz. Please try again.');
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
    return <div className="alert alert-danger">{error}</div>;
  }
  
  return (
    <div className="admin-quizzes">
      <div className="admin-header">
        <h1>Manage Quizzes</h1>
        
        <div className="search-container">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>
      
      <div className="data-table-container">
        {filteredQuizzes.length === 0 ? (
          <div className="empty-state">
            <FaListAlt size={48} />
            <h3>No Quizzes Found</h3>
            <p>
              {searchTerm ? 'No quizzes match your search criteria.' : 'There are no quizzes in the system yet.'}
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Creator</th>
                <th>Status</th>
                <th>Questions</th>
                <th>Category</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuizzes.map((quiz) => (
                <tr key={quiz._id}>
                  <td>{quiz.title}</td>
                  <td>{quiz.creator?.username || 'Anonymous'}</td>
                  <td>
                    <span className={`quiz-card-badge ${quiz.isDraft ? 'badge-draft' : 'badge-published'}`}>
                      {quiz.isDraft ? 'Draft' : 'Published'}
                    </span>
                  </td>
                  <td>{quiz.questions?.length || 0}</td>
                  <td>
                    {quiz.category && quiz.category.length > 0
                      ? quiz.category.map(cat => cat.name).join(', ')
                      : 'None'
                    }
                  </td>
                  <td>{formatDate(quiz.createdAt)}</td>
                  <td>
                    <div className="data-table-actions">
                      <Link 
                        to={`/quizzes/${quiz.isDraft ? 'edit' : 'play'}/${quiz._id}`} 
                        className="btn btn-sm btn-primary"
                        title={quiz.isDraft ? 'Edit Quiz' : 'Play Quiz'}
                      >
                        <FaEye />
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteQuiz(quiz._id, quiz.title)}
                        aria-label={`Delete quiz ${quiz.title}`}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminQuizzes;