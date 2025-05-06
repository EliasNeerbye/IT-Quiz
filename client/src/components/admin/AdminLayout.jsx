import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FaUsers, FaQuestionCircle, FaListAlt, FaFolder, FaTachometerAlt, FaBars } from 'react-icons/fa';

const AdminLayout = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };
  
  return (
    <div className="admin-container">
      {/* Mobile navigation (only visible on small screens) */}
      <div className="admin-mobile-nav d-block d-lg-none">
        <button className="admin-mobile-menu" onClick={toggleMobileMenu}>
          <FaBars /> Admin Menu
        </button>
        
        {showMobileMenu && (
          <nav className="admin-nav mobile">
            <NavLink 
              to="/admin" 
              end
              className={({ isActive }) => 
                `admin-nav-link ${isActive ? 'active' : ''}`
              }
              onClick={() => setShowMobileMenu(false)}
            >
              <FaTachometerAlt /> Dashboard
            </NavLink>
            
            <NavLink 
              to="/admin/users" 
              className={({ isActive }) => 
                `admin-nav-link ${isActive ? 'active' : ''}`
              }
              onClick={() => setShowMobileMenu(false)}
            >
              <FaUsers /> Users
            </NavLink>
            
            <NavLink 
              to="/admin/quizzes" 
              className={({ isActive }) => 
                `admin-nav-link ${isActive ? 'active' : ''}`
              }
              onClick={() => setShowMobileMenu(false)}
            >
              <FaListAlt /> Quizzes
            </NavLink>
            
            <NavLink 
              to="/admin/categories" 
              className={({ isActive }) => 
                `admin-nav-link ${isActive ? 'active' : ''}`
              }
              onClick={() => setShowMobileMenu(false)}
            >
              <FaFolder /> Categories
            </NavLink>
            
            <NavLink 
              to="/admin/faq" 
              className={({ isActive }) => 
                `admin-nav-link ${isActive ? 'active' : ''}`
              }
              onClick={() => setShowMobileMenu(false)}
            >
              <FaQuestionCircle /> FAQ
            </NavLink>
          </nav>
        )}
      </div>
      
      {/* Desktop sidebar */}
      <aside className="admin-sidebar d-none d-lg-block">
        <div className="admin-sidebar-header">
          <h2 className="admin-sidebar-title">Admin Panel</h2>
        </div>
        
        <ul className="admin-nav">
          <li className="admin-nav-item">
            <NavLink 
              to="/admin" 
              end
              className={({ isActive }) => 
                `admin-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <FaTachometerAlt /> Dashboard
            </NavLink>
          </li>
          
          <li className="admin-nav-item">
            <NavLink 
              to="/admin/users" 
              className={({ isActive }) => 
                `admin-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <FaUsers /> Users
            </NavLink>
          </li>
          
          <li className="admin-nav-item">
            <NavLink 
              to="/admin/quizzes" 
              className={({ isActive }) => 
                `admin-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <FaListAlt /> Quizzes
            </NavLink>
          </li>
          
          <li className="admin-nav-item">
            <NavLink 
              to="/admin/categories" 
              className={({ isActive }) => 
                `admin-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <FaFolder /> Categories
            </NavLink>
          </li>
          
          <li className="admin-nav-item">
            <NavLink 
              to="/admin/faq" 
              className={({ isActive }) => 
                `admin-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <FaQuestionCircle /> FAQ
            </NavLink>
          </li>
        </ul>
      </aside>
      
      {/* Main content area */}
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;