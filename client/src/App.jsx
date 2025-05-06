import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

// Common Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';

// Page Components
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import QuizCreate from './pages/QuizCreate';
import QuizEdit from './pages/QuizEdit';
import QuizPlay from './pages/QuizPlay';
import MultiplayerPage from './pages/MultiplayerPage';
import FAQPage from './pages/FAQPage';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

// Auth Components
import PrivateRoute from './components/auth/PrivateRoute';

// Import global styles
import './styles/global.css';
import './styles/components.css';
import './styles/auth.css';
import './styles/quiz.css';
import './styles/admin.css';
import './styles/multiplayer.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="app">
            <Header />
            <main className="main-content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/faq" element={<FAQPage />} />
                
                {/* Protected Routes */}
                <Route path="/profile" element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                } />
                <Route path="/quizzes/create" element={
                  <PrivateRoute>
                    <QuizCreate />
                  </PrivateRoute>
                } />
                <Route path="/quizzes/edit/:id" element={
                  <PrivateRoute>
                    <QuizEdit />
                  </PrivateRoute>
                } />
                <Route path="/quizzes/play/:id" element={
                  <PrivateRoute>
                    <QuizPlay />
                  </PrivateRoute>
                } />
                <Route path="/multiplayer" element={
                  <PrivateRoute>
                    <MultiplayerPage />
                  </PrivateRoute>
                } />
                
                {/* Admin Routes */}
                <Route path="/admin/*" element={
                  <PrivateRoute adminOnly>
                    <Admin />
                  </PrivateRoute>
                } />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            
            {/* Toast notifications */}
            <ToastContainer
              position="bottom-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;