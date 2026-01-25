import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'ADMIN'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Call API for authentication
      const response = await api.login(formData.email, formData.password, formData.userType);
      
      console.log('✅ Login successful for:', response.userType);
      
      // Store token and user data in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        email: response.email,
        name: response.name,
        userType: response.userType,
        collegeId: response.collegeId,      // For COLLEGE users
        collegeName: response.collegeName,  // For COLLEGE users
        internId: response.internId         // For INTERN users
      }));
      
      // Small delay to show loading state, then navigate
      setTimeout(() => {
        // Route based on user type
        if (response.userType === 'COLLEGE') {
          navigate('/hiring-status'); // College view for student hiring status
        } else if (response.userType === 'INTERN') {
          navigate('/documents'); // Intern view for document management
        } else {
          navigate('/dashboard'); // Admin/HR dashboard
        }
      }, 300);
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Invalid credentials. Please try again.');
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>
      
      <div className="login-card fade-in">
        <div className="login-header">
          <div className="company-logo">
            <div className="logo-circle">W</div>
          </div>
          <h1 className="login-title">Wissen</h1>
          <p className="login-subtitle">Intern Management System</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">User Type</label>
            <select
              name="userType"
              className="form-input"
              value={formData.userType}
              onChange={handleChange}
            >
              <option value="ADMIN">🔑 Admin</option>
              <option value="HR">👔 HR</option>
              <option value="COLLEGE">🏫 College</option>
              <option value="INTERN">👨‍🎓 Intern</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="you@wissen.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-link">Forgot password?</a>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>Register</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
