import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaQuestionCircle, FaTrophy } from 'react-icons/fa';

const Header = () => {
  const { user, isAuthenticated, isAdmin, logout } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="header">
      <div className="container header-container">
        <div className="logo">
          <Link to="/">
            <h1>IT Quiz</h1>
          </Link>
        </div>

        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <nav>
          <ul className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
            <li>
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/faq" onClick={() => setMobileMenuOpen(false)}>
                FAQ
              </Link>
            </li>
            
            {isAuthenticated ? (
              <>
                <li>
                  <Link to="/quizzes/create" onClick={() => setMobileMenuOpen(false)}>
                    Create Quiz
                  </Link>
                </li>
                <li>
                  <Link to="/multiplayer" onClick={() => setMobileMenuOpen(false)}>
                    Multiplayer
                  </Link>
                </li>
                <li>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <FaUser /> {user?.username}
                  </Link>
                </li>
                {isAdmin && (
                  <li>
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                      Admin
                    </Link>
                  </li>
                )}
                <li>
                  <button 
                    onClick={handleLogout} 
                    className="btn btn-sm btn-outline"
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;