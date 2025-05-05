import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FaUsers, 
  FaGamepad, 
  FaQuestionCircle, 
  FaUserShield, 
  FaTrash, 
  FaEye,
  FaEdit,
  FaUser,
  FaCalendarAlt,
  FaEnvelope
} from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { adminService, quizService } from '../services/api';
import Button from '../components/common/Button';
import { toast } from 'react-toastify';

const AdminContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const AdminHeader = styled.div`
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 2rem;
`;

const Tab = styled.button`
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: ${props => props.active ? '600' : '400'};
  color: ${props => props.active ? '#3b82f6' : '#64748b'};
  border-bottom: ${props => props.active ? '2px solid #3b82f6' : '2px solid transparent'};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    color: #3b82f6;
  }
`;

const ContentContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 1rem;
  color: #64748b;
  font-weight: 600;
  border-bottom: 1px solid #e5e7eb;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f8fafc;
  }
  
  &:hover {
    background-color: #f1f5f9;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const RoleBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${props => props.role === 'admin' ? '#bfdbfe' : '#e0f2fe'};
  color: ${props => props.role === 'admin' ? '#1e40af' : '#0369a1'};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UserAvatar = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-weight: 600;
`;

const AdminPage = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin) {
      toast.error('You do not have access to this page');
      navigate('/dashboard');
      return;
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (activeTab === 'users') {
          const res = await adminService.getUsers();
          setUsers(res.data.users);
        } else if (activeTab === 'quizzes') {
          const res = await quizService.getQuizzes();
          setQuizzes(res.data.quizzes);
        }
      } catch (error) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isAdmin, navigate, activeTab]);
  
  const handleRoleToggle = async (userId, currentRole) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await adminService.updateUserRole({ userId, role: newRole });
      
      // Update local state
      setUsers(users.map(u => 
        u._id === userId ? { ...u, role: newRole } : u
      ));
      
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };
  
  const handleDeleteUser = async (userId) => {
    if (userId === user.id) {
      toast.error('You cannot delete your own account');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await adminService.deleteUser(userId);
        
        // Update local state
        setUsers(users.filter(u => u._id !== userId));
        
        toast.success('User deleted successfully');
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };
  
  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      try {
        await quizService.deleteQuiz(quizId);
        
        // Update local state
        setQuizzes(quizzes.filter(q => q._id !== quizId));
        
        toast.success('Quiz deleted successfully');
      } catch (error) {
        toast.error('Failed to delete quiz');
      }
    }
  };
  
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  return (
    <AdminContainer>
      <AdminHeader>
        <PageTitle>Admin Dashboard</PageTitle>
      </AdminHeader>
      
      <TabsContainer>
        <Tab 
          active={activeTab === 'users'} 
          onClick={() => setActiveTab('users')}
        >
          <FaUsers /> Users
        </Tab>
        <Tab 
          active={activeTab === 'quizzes'} 
          onClick={() => setActiveTab('quizzes')}
        >
          <FaGamepad /> Quizzes
        </Tab>
      </TabsContainer>
      
      <ContentContainer>
        {loading ? (
          <p>Loading data...</p>
        ) : (
          <>
            {activeTab === 'users' && (
              <TableContainer>
                <Table>
                  <thead>
                    <tr>
                      <TableHeader>User</TableHeader>
                      <TableHeader>Email</TableHeader>
                      <TableHeader>Role</TableHeader>
                      <TableHeader>Created At</TableHeader>
                      <TableHeader>Actions</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(userData => (
                      <TableRow key={userData._id}>
                        <TableCell>
                          <UserInfo>
                            <UserAvatar>
                              {getInitials(userData.username)}
                            </UserAvatar>
                            {userData.username}
                          </UserInfo>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FaEnvelope className="text-gray-400" />
                            {userData.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <RoleBadge role={userData.role}>
                            {userData.role === 'admin' ? (
                              <>
                                <FaUserShield /> Admin
                              </>
                            ) : (
                              <>
                                <FaUser /> User
                              </>
                            )}
                          </RoleBadge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-gray-400" />
                            {formatDate(userData.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <ActionButtons>
                            <Button 
                              className="btn-secondary"
                              onClick={() => handleRoleToggle(userData._id, userData.role)}
                            >
                              {userData.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                            </Button>
                            <Button 
                              className="btn-danger"
                              onClick={() => handleDeleteUser(userData._id)}
                              disabled={userData._id === user.id}
                            >
                              <FaTrash />
                            </Button>
                          </ActionButtons>
                        </TableCell>
                      </TableRow>
                    ))}
                  </tbody>
                </Table>
              </TableContainer>
            )}
            
            {activeTab === 'quizzes' && (
              <TableContainer>
                <Table>
                  <thead>
                    <tr>
                      <TableHeader>Title</TableHeader>
                      <TableHeader>Creator</TableHeader>
                      <TableHeader>Created At</TableHeader>
                      <TableHeader>Questions</TableHeader>
                      <TableHeader>Actions</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {quizzes.map(quiz => (
                      <TableRow key={quiz._id}>
                        <TableCell>{quiz.title}</TableCell>
                        <TableCell>{quiz.creator?.username || 'Unknown'}</TableCell>
                        <TableCell>{formatDate(quiz.createdAt)}</TableCell>
                        <TableCell>{quiz.questions?.length || 0}</TableCell>
                        <TableCell>
                          <ActionButtons>
                            <Button 
                              className="btn-secondary"
                              onClick={() => navigate(`/quiz/${quiz._id}`)}
                            >
                              <FaEye />
                            </Button>
                            <Button 
                              className="btn-danger"
                              onClick={() => handleDeleteQuiz(quiz._id)}
                            >
                              <FaTrash />
                            </Button>
                          </ActionButtons>
                        </TableCell>
                      </TableRow>
                    ))}
                  </tbody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </ContentContainer>
    </AdminContainer>
  );
};

export default AdminPage;