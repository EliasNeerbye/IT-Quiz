import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import Button from '../common/Button';
import { FaTrash, FaSearch, FaUserAlt } from 'react-icons/fa';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/users');
        setUsers(response.data.users || []);
        setFilteredUsers(response.data.users || []);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError(err.response?.data?.error || 'Failed to load users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);
  
  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete the user "${username}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await api.delete(`/admin/users/${userId}`);
      
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      toast.success(`User "${username}" deleted successfully`);
    } catch (err) {
      console.error('Failed to delete user:', err);
      toast.error(err.response?.data?.error || 'Failed to delete user. Please try again.');
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }
  
  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }
  
  return (
    <div className="admin-users">
      <div className="admin-header">
        <h1>Manage Users</h1>
        
        <div className="search-container">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>
      
      <div className="data-table-container">
        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <FaUserAlt size={48} />
            <h3>No Users Found</h3>
            <p>
              {searchTerm ? 'No users match your search criteria.' : 'There are no users in the system yet.'}
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Quizzes</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.quizzes?.length || 0}</td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <div className="data-table-actions">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteUser(user._id, user.username)}
                        aria-label={`Delete user ${user.username}`}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;