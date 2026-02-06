import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Employe from './pages/Employe';
import PrivateRoute from './components/PrivateRoute';
import { authService } from './services/api';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Admin />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/employe"
          element={
            <PrivateRoute allowedRoles={['employe']}>
              <Employe />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/"
          element={
            authService.isAuthenticated() ? (
              authService.getCurrentUser()?.role === 'admin' ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/employe" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
