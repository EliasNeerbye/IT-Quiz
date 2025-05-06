import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminUsers from '../components/admin/AdminUsers';
import AdminQuizzes from '../components/admin/AdminQuizzes';
import AdminCategories from '../components/admin/AdminCategories';
import AdminFAQ from '../components/admin/AdminFAQ';

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