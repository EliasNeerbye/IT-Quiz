import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createQuiz, getCategories } from '../services/quiz';
import Button from '../components/common/Button';
import { FaSave, FaImage, FaTimes } from 'react-icons/fa';

const QuizCreate = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryIds: [],
    image: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  
  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.categories || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError('Failed to load categories. Please try again later.');
      }
    };
    
    fetchCategories();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleCategoryChange = (e) => {
    const options = e.target.options;
    const selectedCategories = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedCategories.push(options[i].value);
      }
    }
    
    setFormData({
      ...formData,
      categoryIds: selectedCategories
    });
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Update form data with the file
      setFormData({
        ...formData,
        image: file
      });
      
      // Create a preview URL
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewImage(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };
  
  const removeImage = () => {
    setFormData({
      ...formData,
      image: null
    });
    setPreviewImage(null);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await createQuiz(formData);
      
      toast.success('Quiz created successfully!');
      navigate(`/quizzes/edit/${response.quiz._id}`);
    } catch (err) {
      console.error('Failed to create quiz:', err);
      setError(err.response?.data?.error || 'Failed to create quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container py-lg">
      <h1>Create New Quiz</h1>
      
      {error && (
        <div className="alert alert-danger">{error}</div>
      )}
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Quiz Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter quiz title"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter quiz description"
              rows="4"
              required
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="categoryIds">Categories</label>
            <select
              id="categoryIds"
              name="categoryIds"
              multiple
              value={formData.categoryIds}
              onChange={handleCategoryChange}
              className="form-control"
            >
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            <small className="text-muted">Hold Ctrl/Cmd to select multiple categories</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="image">Quiz Image (Optional)</label>
            <div className="image-upload-container">
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
                className="image-upload-input"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('image').click()}
              >
                <FaImage /> Choose Image
              </Button>
              
              {previewImage && (
                <div className="image-preview-container">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="image-preview"
                  />
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={removeImage}
                    className="remove-image-btn"
                  >
                    <FaTimes />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="form-actions">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : (
                <>
                  <FaSave /> Create Quiz
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuizCreate;