import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { FaUsers, FaQuestionCircle, FaListAlt, FaFolder, FaTachometerAlt, FaBars } from 'react-icons/fa';

const AdminLayout = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const location = useLocation();
  
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const navLinks = [
    { path: '/admin', icon: <FaTachometerAlt />, label: 'Dashboard', exact: true },
    { path: '/admin/users', icon: <FaUsers />, label: 'Users', exact: false },
    { path: '/admin/quizzes', icon: <FaListAlt />, label: 'Quizzes', exact: false },
    { path: '/admin/categories', icon: <FaFolder />, label: 'Categories', exact: false },
    { path: '/admin/faq', icon: <FaQuestionCircle />, label: 'FAQ', exact: false },
  ];
  
  return (
    <div className="admin-container">
      <div className="admin-top-bar">
        <h2 className="admin-title">Admin Panel</h2>
        
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          <FaBars /> Menu
        </button>
        
        <nav className={`admin-top-nav ${showMobileMenu ? 'show' : ''}`}>
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.exact}
              className={({ isActive }) => 
                `admin-nav-link ${isActive ? 'active' : ''}`
              }
              onClick={() => setShowMobileMenu(false)}
            >
              {link.icon} <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;