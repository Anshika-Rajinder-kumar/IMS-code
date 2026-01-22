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
      
      // Demo mode for UI testing (no backend required)
      const demoUsers = {
        'admin@wissen.com': { password: 'admin123', name: 'Admin User', userType: 'ADMIN' },
        'hr@wissen.com': { password: 'hr123', name: 'HR Manager', userType: 'HR' },
        'college@wissen.com': { password: 'college123', name: 'ABC College', userType: 'COLLEGE' },
        'intern@wissen.com': { password: 'intern123', name: 'John Doe', userType: 'INTERN' }
      };
      
      const demoUser = demoUsers[formData.email.toLowerCase()];
      
      if (demoUser && demoUser.password === formData.password && demoUser.userType === formData.userType) {
        // Demo login successful
        localStorage.setItem('token', 'demo-token-' + Date.now());
        localStorage.setItem('user', JSON.stringify({
          email: formData.email,
          name: demoUser.name,
          userType: demoUser.userType
        }));
        
        console.log('✅ Login successful for:', demoUser.userType);
        
        // Small delay to show loading state, then navigate
        setTimeout(() => {
          // Route based on user type
          if (demoUser.userType === 'COLLEGE') {
            navigate('/students');
          } else if (demoUser.userType === 'INTERN') {
            navigate('/learning');
          } else {
            navigate('/dashboard');
          }
        }, 300);
      } else {
        setError('Invalid credentials. Please check your email, password, and make sure the user type matches.');
      }
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

          {/* Demo Credentials Info */}
          <div style={{ 
            background: '#f0f9ff', 
            border: '1px solid #bae6fd', 
            borderRadius: '8px', 
            padding: '12px', 
            marginBottom: '16px',
            fontSize: '12px'
          }}>
            <strong style={{ color: '#0369a1', display: 'block', marginBottom: '8px' }}>
              📋 Demo Credentials (Development Mode)
            </strong>
            <div style={{ color: '#0c4a6e', lineHeight: '1.8' }}>
              <div><strong>Admin:</strong> admin@wissen.com / admin123</div>
              <div><strong>HR:</strong> hr@wissen.com / hr123</div>
              <div><strong>College:</strong> college@wissen.com / college123</div>
              <div><strong>Intern:</strong> intern@wissen.com / intern123</div>
            </div>
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#0369a1' }}>
              * Select matching user type for each credential
            </div>
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
