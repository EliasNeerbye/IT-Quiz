import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>QuITz</h3>
            <p>
              Create, share, and take quizzes on various IT topics. Test your knowledge
              and challenge your friends in multiplayer mode.
            </p>
          </div>
          
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/faq">FAQ</Link>
              </li>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Contact</h3>
            <p>
              Have questions or feedback? Get in touch with us!
            </p>
            <p>
              Email: contact@it-quiz.com
            </p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {currentYear} QuITz. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;