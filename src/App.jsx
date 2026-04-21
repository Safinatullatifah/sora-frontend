import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import SiswaDashboard from './pages/SiswaDashboard';

export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <Routes>
        {/* Halaman Login */}
        <Route 
          path="/login" 
          element={!user ? <LoginPage onLogin={handleLogin} /> : <Navigate to={user.role === 'admin' ? '/admin' : '/siswa'} />} 
        />

        {/* Route Khusus Admin */}
        <Route 
          path="/admin/*" 
          element={user?.role === 'admin' ? <AdminDashboard onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />

        {/* Route Khusus Siswa */}
        <Route 
          path="/siswa/*" 
          element={user?.role === 'siswa' ? <SiswaDashboard onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />

        {/* Redirect awal */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}