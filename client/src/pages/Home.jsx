import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { getPublicQuizzes } from '../services/quiz';
import QuizCard from '../components/quiz/QuizCard';
import Button from '../components/common/Button';
import { FaPlus, FaPlay, FaUsers } from 'react-icons/fa';

import '../styles/home.css';

const Home = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const response = await getPublicQuizzes();
        setQuizzes(response.quizzes || []);
      } catch (err) {
        console.error('Failed to fetch quizzes:', err);
        setError('Failed to load quizzes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Test Your IT Knowledge</h1>
            <p>
              Challenge yourself with quizzes on programming, networking, cybersecurity, and more.
              Create your own quizzes and compete with friends!
            </p>
            
            <div className="hero-buttons">
              {isAuthenticated ? (
                <>
                  <Link to="/quizzes/create" className="btn btn-primary btn-lg">
                    <FaPlus /> Create Quiz
                  </Link>
                  <Link to="/multiplayer" className="btn btn-secondary btn-lg">
                    <FaUsers /> Play Multiplayer
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-primary btn-lg">
                    <FaPlay /> Start Quizzing
                  </Link>
                  <Link to="/register" className="btn btn-outline btn-lg">
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      
      <section className="featured-quizzes">
        <div className="container">
          <h2>Featured Quizzes</h2>
          
          {loading ? (
            <div className="loader-container">
              <div className="loader"></div>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : quizzes.length === 0 ? (
            <div className="text-center">
              <p>No quizzes available yet. Be the first to create one!</p>
              {isAuthenticated && (
                <Link to="/quizzes/create" className="btn btn-primary">
                  <FaPlus /> Create Quiz
                </Link>
              )}
            </div>
          ) : (
            <div className="quiz-grid">
              {quizzes.slice(0, 6).map((quiz) => (
                <QuizCard key={quiz._id} quiz={quiz} />
              ))}
            </div>
          )}
          
          {quizzes.length > 6 && (
            <div className="text-center mt-lg">
              <Link to="/quizzes" className="btn btn-outline">
                View All Quizzes
              </Link>
            </div>
          )}
        </div>
      </section>
      
      <section className="features">
        <div className="container">
          <h2>Why Choose QuITz?</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>Learn IT Concepts</h3>
              <p>
                Improve your knowledge in various IT fields through interactive quizzes
                designed to test and enhance your skills.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Compete with Friends</h3>
              <p>
                Challenge your friends in real-time multiplayer mode and see who has
                the best IT knowledge.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">✏️</div>
              <h3>Create Your Own</h3>
              <p>
                Design your own quizzes on any IT topic. Add multiple-choice questions,
                true/false questions, and more.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;