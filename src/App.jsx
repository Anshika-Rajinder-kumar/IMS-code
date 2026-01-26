import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Colleges from './components/Colleges';
import Interns from './components/Interns';
import Documents from './components/Documents';
import Offers from './components/Offers';
import InternDocuments from './components/InternDocuments';
import InternOffer from './components/InternOffer';
import HiringRounds from './components/HiringRounds';
import StudentUpload from './components/StudentUpload';
import BulkUpload from './components/BulkUpload';
import HiringStatus from './components/HiringStatus';
import LearningProgress from './components/LearningProgress';
import Settings from './components/Settings';
import LearningAssignment from './components/LearningAssignment';
import CourseProjectPool from './components/CourseProjectPool';

function App() {
  const PrivateRoute = ({ children }) => {
    const user = localStorage.getItem('user');
    return user ? children : <Navigate to="/login" />;
  };

  const RoleBasedRoute = ({ component: Component, internComponent: InternComponent }) => {
    const user = localStorage.getItem('user');
    if (!user) return <Navigate to="/login" />;

    const userData = JSON.parse(user);
    const isIntern = userData.userType?.toUpperCase() === 'INTERN';

    return isIntern && InternComponent ? <InternComponent /> : <Component />;
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
          path="/hiring-rounds"
          element={
            <PrivateRoute>
              <HiringRounds />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/learning-assignment"
          element={
            <PrivateRoute>
              <LearningAssignment />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/course-project-pool"
          element={
            <PrivateRoute>
              <CourseProjectPool />
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
            <RoleBasedRoute
              component={Documents}
              internComponent={InternDocuments}
            />
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
        <Route
          path="/offer"
          element={
            <PrivateRoute>
              <InternOffer />
            </PrivateRoute>
          }
        />
        <Route
          path="/students"
          element={
            <PrivateRoute>
              <StudentUpload />
            </PrivateRoute>
          }
        />
        <Route
          path="/bulk-upload"
          element={
            <PrivateRoute>
              <BulkUpload />
            </PrivateRoute>
          }
        />
        <Route
          path="/hiring-status"
          element={
            <PrivateRoute>
              <HiringStatus />
            </PrivateRoute>
          }
        />
        <Route
          path="/learning"
          element={
            <PrivateRoute>
              <LearningProgress />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
