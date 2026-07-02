import { Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react'; 
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard'; 
import { useAuth } from './context/AuthContext';
import Ranking from './components/Ranking';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Cargando...</div>;
  return user ? <>{children}</> : <Navigate to="/" replace />;
};

function App() {
  const { user, loading } = useAuth();

  return (
    <Routes>
      <Route 
        path="/" 
        element={!loading && user ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            {/* Si está cargando, mostramos carga. Si no, decidimos la vista */}
            {loading ? (
              <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Cargando...</div>
            ) : (
              user?.is_admin ? <AdminDashboard /> : <Dashboard />
            )}
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/ranking" 
        element={
          <ProtectedRoute>
            <Ranking />
          </ProtectedRoute>
        } 
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ¡ESTA LÍNEA ES LA QUE TE FALTA!
export default App;