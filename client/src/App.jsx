import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';

// Layout components
import Navbar from './components/common/Navbar';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import QuizzesPage from './pages/QuizzesPage';
import QuizDetailsPage from './pages/QuizDetailsPage';
import CreateQuizPage from './pages/CreateQuizPage';
import FAQPage from './pages/FAQPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

// Styles
import GlobalStyle from './styles/GlobalStyle';

function App() {
  return (
    <Router>
      <AuthProvider>
        <GlobalStyle />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        
        <div className="app">
          <Navbar />
          
          <main className="content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/quizzes" element={<QuizzesPage />} />
              <Route path="/quiz/:id" element={<QuizDetailsPage />} />
              <Route path="/create-quiz" element={<CreateQuizPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;