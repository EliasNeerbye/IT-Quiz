import { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { FaChevronDown, FaChevronUp, FaPlus, FaEdit, FaTrash, FaQuestionCircle } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { faqService } from '../services/api';
import Button from '../components/common/Button';
import { toast } from 'react-toastify';

const FAQContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const FAQHeader = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #64748b;
`;

const CategoryTabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
`;

const CategoryTab = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${props => props.$active ? '#3b82f6' : '#f8fafc'};
  color: ${props => props.$active ? 'white' : '#64748b'};
  border: 1px solid ${props => props.$active ? '#3b82f6' : '#e5e7eb'};
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.$active ? '#2563eb' : '#f1f5f9'};
  }
`;

const FAQList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FAQItem = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const FAQQuestion = styled.div`
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  
  h3 {
    font-size: 1.125rem;
    color: #1e293b;
    margin: 0;
  }
`;

const FAQAnswer = styled.div`
  padding: 0 1.5rem 1.5rem 1.5rem;
  color: #64748b;
  line-height: 1.6;
`;

const AdminControls = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const EmptyStateIcon = styled.div`
  font-size: 3rem;
  color: #cbd5e1;
  margin-bottom: 1rem;
`;

const EmptyStateText = styled.p`
  color: #64748b;
  margin-bottom: 1.5rem;
`;

// Modal components for FAQ management
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  color: #1e293b;
  margin: 0;
`;

const ModalCloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
  
  &:hover {
    color: #1e293b;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #1e293b;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  }
`;

const Checkbox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  input {
    width: auto;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const FAQPage = () => {
  const { isAdmin } = useContext(AuthContext);
  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState(['General', 'Account', 'Quizzes', 'Technical']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    isForAdmin: false,
  });
  
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true);
        const res = await faqService.getFAQs(isAdmin);
        setFaqs(res.data.faqs);
        
        // Extract unique categories
        if (res.data.faqs.length > 0) {
          const uniqueCategories = [...new Set(res.data.faqs.map(faq => faq.category))];
          setCategories(['All', ...uniqueCategories]);
        }
      } catch (error) {
        toast.error('Failed to load FAQs');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFAQs();
  }, [isAdmin]);
  
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };
  
  const filteredFaqs = activeCategory === 'All'
    ? faqs
    : faqs.filter(faq => faq.category === activeCategory);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  const openCreateModal = () => {
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      category: 'General',
      isForAdmin: false,
    });
    setShowModal(true);
  };
  
  const openEditModal = (faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      isForAdmin: faq.isForAdmin,
    });
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setEditingFaq(null);
  };
  
  const handleSubmitFaq = async (e) => {
    e.preventDefault();
    
    try {
      if (editingFaq) {
        // Update existing FAQ
        await faqService.updateFAQ(editingFaq._id, formData);
        
        // Update local state
        setFaqs(faqs.map(faq => 
          faq._id === editingFaq._id ? { ...faq, ...formData } : faq
        ));
        
        toast.success('FAQ updated successfully');
      } else {
        // Create new FAQ
        const res = await faqService.createFAQ(formData);
        
        // Update local state
        setFaqs([...faqs, res.data.faq]);
        
        toast.success('FAQ created successfully');
      }
      
      closeModal();
    } catch (error) {
      toast.error(editingFaq ? 'Failed to update FAQ' : 'Failed to create FAQ');
    }
  };
  
  const handleDeleteFaq = async (id) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        await faqService.deleteFAQ(id);
        
        // Update local state
        setFaqs(faqs.filter(faq => faq._id !== id));
        
        toast.success('FAQ deleted successfully');
      } catch (error) {
        toast.error('Failed to delete FAQ');
      }
    }
  };
  
  return (
    <FAQContainer>
      <FAQHeader>
        <Title>Frequently Asked Questions</Title>
        <Subtitle>Find answers to common questions about IT Quiz</Subtitle>
      </FAQHeader>
      
      <div className="faq-controls">
        <CategoryTabs>
          {categories.map(category => (
            <CategoryTab
              key={category}
              active={activeCategory === category}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </CategoryTab>
          ))}
        </CategoryTabs>
        
        {isAdmin && (
          <Button className="btn-primary" onClick={openCreateModal}>
            <FaPlus /> Add FAQ
          </Button>
        )}
      </div>
      
      {loading ? (
        <p>Loading FAQs...</p>
      ) : (
        <>
          {filteredFaqs.length === 0 ? (
            <EmptyState>
              <EmptyStateIcon>
                <FaQuestionCircle />
              </EmptyStateIcon>
              <EmptyStateText>
                No FAQs found in this category.
              </EmptyStateText>
            </EmptyState>
          ) : (
            <FAQList>
              {filteredFaqs.map(faq => (
                <FAQItem key={faq._id}>
                  <FAQQuestion onClick={() => toggleExpand(faq._id)}>
                    <h3>{faq.question}</h3>
                    {expandedId === faq._id ? <FaChevronUp /> : <FaChevronDown />}
                  </FAQQuestion>
                  
                  {expandedId === faq._id && (
                    <FAQAnswer>
                      <p>{faq.answer}</p>
                      
                      {isAdmin && (
                        <AdminControls>
                          <Button className="btn-secondary" onClick={() => openEditModal(faq)}>
                            <FaEdit /> Edit
                          </Button>
                          <Button className="btn-danger" onClick={() => handleDeleteFaq(faq._id)}>
                            <FaTrash /> Delete
                          </Button>
                        </AdminControls>
                      )}
                    </FAQAnswer>
                  )}
                </FAQItem>
              ))}
            </FAQList>
          )}
        </>
      )}
      
      {/* FAQ Modal */}
      {showModal && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {editingFaq ? 'Edit FAQ' : 'Create FAQ'}
              </ModalTitle>
              <ModalCloseButton onClick={closeModal}>
                &times;
              </ModalCloseButton>
            </ModalHeader>
            
            <form onSubmit={handleSubmitFaq}>
              <FormGroup>
                <Label htmlFor="question">Question</Label>
                <Input
                  type="text"
                  id="question"
                  name="question"
                  value={formData.question}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="answer">Answer</Label>
                <TextArea
                  id="answer"
                  name="answer"
                  value={formData.answer}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="category">Category</Label>
                <Select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  {categories.filter(cat => cat !== 'All').map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Checkbox>
                  <input
                    type="checkbox"
                    id="isForAdmin"
                    name="isForAdmin"
                    checked={formData.isForAdmin}
                    onChange={handleInputChange}
                  />
                  <Label htmlFor="isForAdmin">Admin-only FAQ</Label>
                </Checkbox>
              </FormGroup>
              
              <ModalFooter>
                <Button
                  type="button"
                  className="btn-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="btn-primary"
                >
                  {editingFaq ? 'Update' : 'Create'}
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}
    </FAQContainer>
  );
};

export default FAQPage;