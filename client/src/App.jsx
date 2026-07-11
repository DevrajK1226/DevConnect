import { Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function Home() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user?.name} 👋</h1>
      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;