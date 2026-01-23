import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Colleges from './components/Colleges';
import Interns from './components/Interns';
import Documents from './components/Documents';
import Offers from './components/Offers';

function App() {
  const PrivateRoute = ({ children }) => {
    const user = localStorage.getItem('user');
    return user ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/colleges"
          element={
            <PrivateRoute>
              <Colleges />
            </PrivateRoute>
          }
        />
        <Route
          path="/interns"
          element={
            <PrivateRoute>
              <Interns />
            </PrivateRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <PrivateRoute>
              <Documents />
            </PrivateRoute>
          }
        />
        <Route
          path="/offers"
          element={
            <PrivateRoute>
              <Offers />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
