import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { FaPlus, FaTrash, FaFolder } from 'react-icons/fa';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await api.get('/quiz/categories');
        setCategories(response.data.categories || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError(err.response?.data?.error || 'Failed to load categories. Please try again later.');
      } finally {
        setLoading(false);
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
  
  const handleAddCategory = () => {
    setFormData({
      name: '',
      description: ''
    });
    setShowModal(true);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Category name is required');
      return;
    }
    
    try {
      const response = await api.post('/quiz/categories', formData);
      
      setCategories(prevCategories => [...prevCategories, response.data.category]);
      
      toast.success('Category added successfully');
      
      setShowModal(false);
      setFormData({
        name: '',
        description: ''
      });
    } catch (err) {
      console.error('Failed to add category:', err);
      toast.error(err.response?.data?.error || 'Failed to add category. Please try again.');
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
    <div className="admin-categories">
      <div className="admin-header">
        <h1>Manage Categories</h1>
        
        <Button variant="primary" onClick={handleAddCategory}>
          <FaPlus /> Add Category
        </Button>
      </div>
      
      {categories.length === 0 ? (
        <div className="empty-state">
          <FaFolder size={48} />
          <h3>No Categories Found</h3>
          <p>Start adding categories to organize your quizzes.</p>
          <Button variant="primary" onClick={handleAddCategory}>
            <FaPlus /> Add First Category
          </Button>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category._id}>
                  <td>{category.name}</td>
                  <td>{category.description || '-'}</td>
                  <td>
                    {formatDate(category.createdAt)}
                  </td>
                  <td>
                    <div className="data-table-actions">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => toast.info('Category deletion not implemented in this version')}
                        aria-label={`Delete category ${category.name}`}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {showModal && (
        <Modal
          title="Add Category"
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Category Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter category name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description (Optional)</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter category description"
                rows="3"
              ></textarea>
            </div>
            
            <div className="form-actions">
              <Button type="submit" variant="primary">
                Add Category
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

export default AdminCategories;