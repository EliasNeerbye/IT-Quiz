import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FaUsers, FaListAlt, FaFolder, FaQuestionCircle, FaTachometerAlt } from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: '--',
    quizzes: '--',
    categories: '--',
    faqs: '--'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Get users count
        const usersResponse = await api.get('/admin/users');
        const users = usersResponse.data.users?.length || 0;
        
        // Get quizzes count
        const quizzesResponse = await api.get('/admin/quizzes');
        const quizzes = quizzesResponse.data.quizzes?.length || 0;
        
        // Get categories count
        const categoriesResponse = await api.get('/quiz/categories');
        const categories = categoriesResponse.data.categories?.length || 0;
        
        // Get FAQ count
        const faqResponse = await api.get('/faq');
        const faqs = faqResponse.data.faqs?.length || 0;
        
        setStats({
          users,
          quizzes,
          categories,
          faqs
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Dashboard</h1>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FaUsers size={24} />
          </div>
          <div className="stat-title">Total Users</div>
          <div className="stat-value">{stats.users}</div>
          <div className="stat-description">Registered users</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FaListAlt size={24} />
          </div>
          <div className="stat-title">Total Quizzes</div>
          <div className="stat-value">{stats.quizzes}</div>
          <div className="stat-description">Created quizzes</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FaFolder size={24} />
          </div>
          <div className="stat-title">Categories</div>
          <div className="stat-value">{stats.categories}</div>
          <div className="stat-description">Quiz categories</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FaQuestionCircle size={24} />
          </div>
          <div className="stat-title">FAQs</div>
          <div className="stat-value">{stats.faqs}</div>
          <div className="stat-description">Frequently asked questions</div>
        </div>
      </div>
      
      <div className="admin-section">
        <h2>Quick Actions</h2>
        <div className="quick-links">
          <Link to="/admin/users" className="quick-link-card">
            <FaUsers size={32} />
            <h3>Manage Users</h3>
            <p>View, edit, and delete user accounts</p>
          </Link>
          
          <Link to="/admin/quizzes" className="quick-link-card">
            <FaListAlt size={32} />
            <h3>Manage Quizzes</h3>
            <p>Review, edit, and delete quizzes</p>
          </Link>
          
          <Link to="/admin/categories" className="quick-link-card">
            <FaFolder size={32} />
            <h3>Manage Categories</h3>
            <p>Create and organize quiz categories</p>
          </Link>
          
          <Link to="/admin/faq" className="quick-link-card">
            <FaQuestionCircle size={32} />
            <h3>Manage FAQs</h3>
            <p>Edit frequently asked questions</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;