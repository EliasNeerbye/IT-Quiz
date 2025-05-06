import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import AdminUsers from '../components/admin/AdminUsers';
import AdminQuizzes from '../components/admin/AdminQuizzes';
import AdminCategories from '../components/admin/AdminCategories';
import AdminFAQ from '../components/admin/AdminFAQ';
import { FaUsers, FaListAlt, FaFolder, FaQuestionCircle, FaTachometerAlt } from 'react-icons/fa';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FaUsers size={24} />
          </div>
          <div className="stat-title">Total Users</div>
          <div className="stat-value">--</div>
          <div className="stat-description">Registered users</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FaListAlt size={24} />
          </div>
          <div className="stat-title">Total Quizzes</div>
          <div className="stat-value">--</div>
          <div className="stat-description">Published quizzes</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FaFolder size={24} />
          </div>
          <div className="stat-title">Categories</div>
          <div className="stat-value">--</div>
          <div className="stat-description">Quiz categories</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FaQuestionCircle size={24} />
          </div>
          <div className="stat-title">FAQs</div>
          <div className="stat-value">--</div>
          <div className="stat-description">Frequently asked questions</div>
        </div>
      </div>
      
      <div className="quick-actions mt-xl">
        <h2>Quick Actions</h2>
        <div className="grid grid-cols-2 gap-md">
          <a href="/admin/users" className="card text-center py-md">
            <FaUsers size={32} className="mb-sm" />
            <h3>Manage Users</h3>
          </a>
          
          <a href="/admin/quizzes" className="card text-center py-md">
            <FaListAlt size={32} className="mb-sm" />
            <h3>Manage Quizzes</h3>
          </a>
          
          <a href="/admin/categories" className="card text-center py-md">
            <FaFolder size={32} className="mb-sm" />
            <h3>Manage Categories</h3>
          </a>
          
          <a href="/admin/faq" className="card text-center py-md">
            <FaQuestionCircle size={32} className="mb-sm" />
            <h3>Manage FAQs</h3>
          </a>
        </div>
      </div>
    </div>
  );
};

const Admin = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="quizzes" element={<AdminQuizzes />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="faq" element={<AdminFAQ />} />
      </Route>
    </Routes>
  );
};

export default Admin;