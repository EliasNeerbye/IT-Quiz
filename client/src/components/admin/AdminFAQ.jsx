import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const AdminFAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    order: 0
  });
  
  // Fetch all FAQs
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        const response = await api.get('/faq');
        setFaqs(response.data.faqs || []);
      } catch (err) {
        console.error('Failed to fetch FAQs:', err);
        setError(err.response?.data?.error || 'Failed to load FAQs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFaqs();
  }, []);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'order' ? parseInt(value, 10) || 0 : value
    });
  };
  
  // Open modal for adding new FAQ
  const handleAddFaq = () => {
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      order: faqs.length
    });
    setShowModal(true);
  };
  
  // Open modal for editing FAQ
  const handleEditFaq = (faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      order: faq.order
    });
    setShowModal(true);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.question || !formData.answer) {
      toast.error('Question and answer are required');
      return;
    }
    
    try {
      let response;
      
      if (editingFaq) {
        // Update existing FAQ
        response = await api.put(`/faq/${editingFaq._id}`, formData);
        
        // Update FAQs list
        setFaqs(prevFaqs => 
          prevFaqs.map(faq => 
            faq._id === editingFaq._id ? response.data.faq : faq
          )
        );
        
        toast.success('FAQ updated successfully');
      } else {
        // Add new FAQ
        response = await api.post('/faq', formData);
        
        // Update FAQs list
        setFaqs(prevFaqs => [...prevFaqs, response.data.faq]);
        
        toast.success('FAQ added successfully');
      }
      
      // Close modal and reset form
      setShowModal(false);
      setEditingFaq(null);
      setFormData({
        question: '',
        answer: '',
        order: 0
      });
    } catch (err) {
      console.error('Failed to save FAQ:', err);
      toast.error(err.response?.data?.error || 'Failed to save FAQ. Please try again.');
    }
  };
  
  // Handle FAQ deletion
  const handleDeleteFaq = async (faqId) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) {
      return;
    }
    
    try {
      await api.delete(`/faq/${faqId}`);
      
      // Update FAQs list
      setFaqs(prevFaqs => prevFaqs.filter(faq => faq._id !== faqId));
      
      toast.success('FAQ deleted successfully');
    } catch (err) {
      console.error('Failed to delete FAQ:', err);
      toast.error(err.response?.data?.error || 'Failed to delete FAQ. Please try again.');
    }
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
  
  return (
    <div className="admin-faq">
      <div className="admin-header">
        <h1>Manage FAQs</h1>
        
        <Button variant="primary" onClick={handleAddFaq}>
          <FaPlus /> Add FAQ
        </Button>
      </div>
      
      {faqs.length === 0 ? (
        <div className="empty-state card text-center py-lg">
          <h3>No FAQs Found</h3>
          <p>Start adding frequently asked questions to help your users.</p>
          <Button variant="primary" onClick={handleAddFaq}>
            <FaPlus /> Add First FAQ
          </Button>
        </div>
      ) : (
        <div className="faq-list">
          {faqs.map((faq) => (
            <div key={faq._id} className="faq-item">
              <div className="faq-header">
                <h3 className="faq-title">{faq.question}</h3>
                <div className="faq-actions">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEditFaq(faq)}
                    aria-label="Edit FAQ"
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteFaq(faq._id)}
                    aria-label="Delete FAQ"
                  >
                    <FaTrash />
                  </Button>
                </div>
              </div>
              <div className="faq-content">
                <p>{faq.answer}</p>
                <div className="faq-meta">
                  <small>Order: {faq.order}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* FAQ Form Modal */}
      {showModal && (
        <Modal
          title={editingFaq ? 'Edit FAQ' : 'Add FAQ'}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="question">Question</label>
              <input
                type="text"
                id="question"
                name="question"
                value={formData.question}
                onChange={handleChange}
                placeholder="Enter the question"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="answer">Answer</label>
              <textarea
                id="answer"
                name="answer"
                value={formData.answer}
                onChange={handleChange}
                placeholder="Enter the answer"
                rows="5"
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="order">Display Order</label>
              <input
                type="number"
                id="order"
                name="order"
                value={formData.order}
                onChange={handleChange}
                min="0"
              />
              <small className="text-muted">Lower numbers appear first</small>
            </div>
            
            <div className="form-actions">
              <Button type="submit" variant="primary">
                {editingFaq ? 'Update FAQ' : 'Add FAQ'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AdminFAQ;