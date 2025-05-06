import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getQuizById, updateQuiz, publishQuiz, addQuestion, removeQuestion, getCategories } from '../services/quiz';
import Button from '../components/common/Button';
import QuestionForm from '../components/quiz/QuestionForm';
import CategorySelector from '../components/common/CategorySelector';
import Modal from '../components/common/Modal';
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaArrowLeft, FaImage, FaTimes, FaCog } from 'react-icons/fa';

const QuizEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    private: false,
    multiplayer: true,
    default_time_limit: 60
  });
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Helper function to get full image URL
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return imagePath.startsWith('http') 
      ? imagePath 
      : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${imagePath}`;
  };

  // Fetch quiz data and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch quiz and categories in parallel
        const [quizResponse, categoriesResponse] = await Promise.all([
          getQuizById(id),
          getCategories()
        ]);
        
        const quiz = quizResponse.quiz;
        setQuiz(quiz);
        
        // Initialize settings form if quiz has settings
        if (quiz.settings) {
          setSettingsForm({
            private: quiz.settings.private || false,
            multiplayer: quiz.settings.multiplayer || true,
            default_time_limit: quiz.settings.default_time_limit || 60
          });
        }
        
        // Set available categories
        setCategories(categoriesResponse.categories || []);
        
        // Set initially selected categories
        if (quiz.category && quiz.category.length > 0) {
          // Extract just the IDs
          const categoryIds = quiz.category.map(cat => cat._id);
          setSelectedCategories(categoryIds);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError(err.response?.data?.error || 'Failed to load quiz data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // Handle submitting a new question
  const handleQuestionSubmit = async (questionData) => {
    try {
      const response = await addQuestion(id, questionData);
      
      // Update quiz with new question
      setQuiz({
        ...quiz,
        questions: [...quiz.questions, response.question]
      });
      
      setShowQuestionForm(false);
      toast.success('Question added successfully!');
    } catch (err) {
      console.error('Failed to add question:', err);
      toast.error(err.response?.data?.error || 'Failed to add question. Please try again.');
    }
  };
  
  // Handle removing a question
  const handleRemoveQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to remove this question?')) {
      return;
    }
    
    try {
      await removeQuestion(id, questionId);
      
      // Update quiz by filtering out the removed question
      setQuiz({
        ...quiz,
        questions: quiz.questions.filter(q => q._id !== questionId)
      });
      
      toast.success('Question removed successfully!');
    } catch (err) {
      console.error('Failed to remove question:', err);
      toast.error(err.response?.data?.error || 'Failed to remove question. Please try again.');
    }
  };
  
  // Handle publishing the quiz
  const handlePublishQuiz = async () => {
    if (quiz.questions.length === 0) {
      toast.error('You need to add at least one question before publishing.');
      return;
    }
    
    if (!window.confirm('Are you sure you want to publish this quiz? You won\'t be able to edit it after publishing.')) {
      return;
    }
    
    try {
      await publishQuiz(id);
      
      // Update quiz to reflect published status
      setQuiz({
        ...quiz,
        isDraft: false
      });
      
      toast.success('Quiz published successfully!');
      navigate(`/quizzes/play/${id}`);
    } catch (err) {
      console.error('Failed to publish quiz:', err);
      toast.error(err.response?.data?.error || 'Failed to publish quiz. Please try again.');
    }
  };
  
  // Handle settings changes
  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setSettingsForm({
      ...settingsForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Save settings
  const handleSaveSettings = async () => {
    try {
      // Update quiz with new settings and categories
      const updateData = {
        settings: settingsForm,
        categoryIds: selectedCategories
      };
      
      await updateQuiz(id, updateData);
      
      // Update quiz object in state
      const updatedQuiz = {
        ...quiz,
        settings: {
          ...quiz.settings,
          ...settingsForm
        }
      };
      
      // Also update the categories if they were changed
      if (categories.length > 0) {
        // Convert category IDs to full category objects
        const fullCategories = selectedCategories.map(id => 
          categories.find(cat => cat._id === id)
        ).filter(Boolean);
        
        updatedQuiz.category = fullCategories;
      }
      
      setQuiz(updatedQuiz);
      
      setShowSettingsModal(false);
      toast.success('Quiz updated successfully!');
    } catch (err) {
      console.error('Failed to update quiz:', err);
      toast.error(err.response?.data?.error || 'Failed to update quiz. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <div className="container py-lg">
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container py-lg">
        <div className="alert alert-danger">{error}</div>
        <Button variant="secondary" onClick={() => navigate('/profile')}>
          <FaArrowLeft /> Back to Profile
        </Button>
      </div>
    );
  }
  
  if (!quiz) {
    return (
      <div className="container py-lg">
        <div className="alert alert-warning">Quiz not found or you don't have permission to edit it.</div>
        <Button variant="secondary" onClick={() => navigate('/profile')}>
          <FaArrowLeft /> Back to Profile
        </Button>
      </div>
    );
  }
  
  // If quiz is not a draft, redirect to play page
  if (!quiz.isDraft) {
    return (
      <div className="container py-lg">
        <div className="alert alert-info">This quiz has already been published and cannot be edited.</div>
        <div className="flex gap-md">
          <Button variant="primary" onClick={() => navigate(`/quizzes/play/${id}`)}>
            Play Quiz
          </Button>
          <Button variant="secondary" onClick={() => navigate('/profile')}>
            <FaArrowLeft /> Back to Profile
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-lg">
      <div className="flex justify-between items-center mb-md">
        <h1>Edit Quiz: {quiz.title}</h1>
        <div className="flex gap-md">
          <Button variant="secondary" onClick={() => setShowSettingsModal(true)}>
            <FaCog /> Settings
          </Button>
          <Button variant="success" onClick={handlePublishQuiz} disabled={quiz.questions.length === 0}>
            <FaCheckCircle /> Publish Quiz
          </Button>
        </div>
      </div>
      
      <div className="quiz-info card mb-lg">
        <div className="flex gap-lg">
          {quiz.image && (
            <div className="quiz-image">
              <img src={getFullImageUrl(quiz.image)} alt={quiz.title} />
            </div>
          )}
          
          <div className="quiz-details">
            <h2>{quiz.title}</h2>
            <p>{quiz.description}</p>
            
            {quiz.category && quiz.category.length > 0 && (
              <div className="quiz-categories">
                <strong>Categories:</strong> {quiz.category.map(cat => cat.name).join(', ')}
              </div>
            )}
            
            <div className="quiz-status">
              <span className="quiz-card-badge badge-draft">Draft</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="questions-section">
        <div className="flex justify-between items-center mb-md">
          <h2>Questions ({quiz.questions.length})</h2>
          <Button variant="primary" onClick={() => setShowQuestionForm(true)}>
            <FaPlus /> Add Question
          </Button>
        </div>
        
        {quiz.questions.length === 0 ? (
          <div className="empty-state card text-center py-lg">
            <p>No questions yet. Add your first question to get started!</p>
            <Button variant="primary" onClick={() => setShowQuestionForm(true)}>
              <FaPlus /> Add Question
            </Button>
          </div>
        ) : (
          <div className="questions-list">
            {quiz.questions.map((question, index) => (
              <div key={question._id} className="question-item card mb-md">
                <div className="question-header flex justify-between items-center">
                  <h3>Question {index + 1}: {question.title}</h3>
                  <div className="question-actions flex gap-sm">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveQuestion(question._id)}
                      aria-label="Remove question"
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </div>
                
                <div className="question-content">
                  <p>{question.text}</p>
                  
                  {question.image && (
                    <div className="question-image mt-sm">
                      <img src={getFullImageUrl(question.image)} alt={question.title} />
                    </div>
                  )}
                  
                  <div className="question-meta flex justify-between mt-sm">
                    <span>Type: {question.type === 'multiple-choice' ? 'Multiple Choice' : 'True/False'}</span>
                    <span>Time: {question.time_limit} seconds</span>
                    <span>Points: {question.max_points}</span>
                  </div>
                  
                  <div className="question-answers mt-md">
                    <h4>Answers:</h4>
                    <ul className="answers-list">
                      {question.answers.map((answer, idx) => (
                        <li key={idx} className={`answer-item ${answer.isCorrect ? 'correct-answer' : ''}`}>
                          {answer.text} {answer.isCorrect && <span className="correct-badge">✓</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Question Form Modal */}
      {showQuestionForm && (
        <Modal
          title="Add Question"
          onClose={() => setShowQuestionForm(false)}
        >
          <QuestionForm
            onSubmit={handleQuestionSubmit}
            onCancel={() => setShowQuestionForm(false)}
          />
        </Modal>
      )}
      
      {/* Settings Modal */}
      {showSettingsModal && (
        <Modal
          title="Quiz Settings"
          onClose={() => setShowSettingsModal(false)}
        >
          <div className="settings-form">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="private"
                  checked={settingsForm.private}
                  onChange={handleSettingsChange}
                />
                Private Quiz (only you can see it)
              </label>
            </div>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="multiplayer"
                  checked={settingsForm.multiplayer}
                  onChange={handleSettingsChange}
                />
                Enable Multiplayer Mode
              </label>
            </div>
            
            <div className="form-group">
              <label htmlFor="default_time_limit">Default Time Limit (seconds)</label>
              <input
                type="number"
                id="default_time_limit"
                name="default_time_limit"
                value={settingsForm.default_time_limit}
                onChange={handleSettingsChange}
                min="10"
                max="300"
              />
            </div>

            <div className="form-group">
              <label>Categories</label>
              <CategorySelector 
                categories={categories} 
                selectedIds={selectedCategories} 
                onChange={(selectedIds) => setSelectedCategories(selectedIds)} 
              />
            </div>
            
            <div className="form-actions">
              <Button variant="primary" onClick={handleSaveSettings}>
                Save Settings
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default QuizEdit;