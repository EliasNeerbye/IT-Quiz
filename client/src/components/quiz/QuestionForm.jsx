import { useState } from 'react';
import Button from '../common/Button';
import { FaSave, FaTrash, FaPlus, FaImage, FaTimes } from 'react-icons/fa';

const QuestionForm = ({ onSubmit, onCancel, initialData = {} }) => {
  const defaultAnswers = initialData.type === 'true-false' 
    ? [
        { text: 'True', isCorrect: false },
        { text: 'False', isCorrect: false }
      ]
    : [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ];

  const [formData, setFormData] = useState({
    title: initialData.title || '',
    text: initialData.text || '',
    type: initialData.type || 'multiple-choice',
    answers: initialData.answers || defaultAnswers,
    time_limit: initialData.time_limit || 60,
    max_points: initialData.max_points || 1000,
    image: null
  });

  const [previewImage, setPreviewImage] = useState(initialData.image || null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    let newAnswers;

    if (newType === 'true-false') {
      newAnswers = [
        { text: 'True', isCorrect: false },
        { text: 'False', isCorrect: false }
      ];
    } else if (formData.type === 'true-false') {
      // If changing from true-false to multiple-choice, create 4 empty answers
      newAnswers = [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ];
    } else {
      // Keep existing answers if not changing from/to true-false
      newAnswers = formData.answers;
    }

    setFormData({
      ...formData,
      type: newType,
      answers: newAnswers
    });
  };

  const handleAnswerChange = (index, field, value) => {
    const updatedAnswers = [...formData.answers];
    
    if (field === 'isCorrect') {
      // If selecting this answer as correct, unselect all others
      updatedAnswers.forEach((answer, i) => {
        if (i === index) {
          answer.isCorrect = true;
        } else {
          answer.isCorrect = false;
        }
      });
    } else {
      updatedAnswers[index] = {
        ...updatedAnswers[index],
        [field]: value
      };
    }

    setFormData({
      ...formData,
      answers: updatedAnswers
    });
  };

  const addAnswer = () => {
    if (formData.type === 'true-false') return;
    
    setFormData({
      ...formData,
      answers: [...formData.answers, { text: '', isCorrect: false }]
    });
  };

  const removeAnswer = (index) => {
    if (formData.type === 'true-false' || formData.answers.length <= 2) {
      return;
    }

    const updatedAnswers = formData.answers.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      answers: updatedAnswers
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      setFormData({
        ...formData,
        image: file
      });
      
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

  const validateForm = () => {
    if (!formData.title.trim() || !formData.text.trim()) {
      setError('Question title and text are required');
      return false;
    }

    // Check if at least one answer is marked as correct
    const hasCorrectAnswer = formData.answers.some(answer => answer.isCorrect);
    if (!hasCorrectAnswer) {
      setError('At least one answer must be marked as correct');
      return false;
    }

    // For multiple-choice, check that all answers have text
    if (formData.type === 'multiple-choice') {
      const emptyAnswers = formData.answers.some(answer => !answer.text.trim());
      if (emptyAnswers) {
        setError('All answers must have text');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="question-form">
      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Question Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter question title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="text">Question Text</label>
          <textarea
            id="text"
            name="text"
            value={formData.text}
            onChange={handleChange}
            placeholder="Enter question text"
            rows="3"
            required
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="type">Question Type</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleTypeChange}
          >
            <option value="multiple-choice">Multiple Choice</option>
            <option value="true-false">True/False</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="time_limit">Time Limit (Seconds)</label>
          <input
            type="number"
            id="time_limit"
            name="time_limit"
            value={formData.time_limit}
            onChange={handleChange}
            min="5"
            max="300"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="max_points">Maximum Points</label>
          <input
            type="number"
            id="max_points"
            name="max_points"
            value={formData.max_points}
            onChange={handleChange}
            min="100"
            max="10000"
            step="100"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Question Image (Optional)</label>
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

        <div className="form-group">
          <label>Answers</label>
          <div className="answers-container">
            {formData.answers.map((answer, index) => (
              <div key={index} className="answer-item">
                <div className="answer-input-group">
                  <input
                    type="text"
                    value={answer.text}
                    onChange={(e) => handleAnswerChange(index, 'text', e.target.value)}
                    placeholder={`Answer ${index + 1}`}
                    disabled={formData.type === 'true-false'}
                    required
                  />
                  
                  <div className="answer-actions">
                    <label className="correct-answer-label">
                      <input
                        type="radio"
                        name="correct-answer"
                        checked={answer.isCorrect}
                        onChange={() => handleAnswerChange(index, 'isCorrect', true)}
                      />
                      Correct
                    </label>
                    
                    {formData.type !== 'true-false' && formData.answers.length > 2 && (
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => removeAnswer(index)}
                        aria-label="Remove answer"
                      >
                        <FaTrash />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {formData.type !== 'true-false' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAnswer}
                className="add-answer-btn"
              >
                <FaPlus /> Add Answer
              </Button>
            )}
          </div>
        </div>

        <div className="form-actions">
          <Button
            type="submit"
            variant="primary"
          >
            <FaSave /> Save Question
          </Button>
          
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QuestionForm;