// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import api from "../utils/api";
// import { useAuth } from "../context/AuthContext";

// function Login() {
//   const [formData, setFormData] = useState({ email: "", password: "" });
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();
//   const { login } = useAuth();

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     try {
//       const res = await api.post("/auth/login", formData);
//       login(res.data);
//       navigate("/");
//     } catch (err) {
//       setError(err.response?.data?.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
//         <h2 className="text-2xl font-bold mb-6 text-center">Welcome Back</h2>

//         {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <input
//             type="email"
//             name="email"
//             placeholder="Email"
//             value={formData.email}
//             onChange={handleChange}
//             className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             required
//           />
//           <input
//             type="password"
//             name="password"
//             placeholder="Password"
//             value={formData.password}
//             onChange={handleChange}
//             className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             required
//           />
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
//           >
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>

//         <p className="text-sm text-center mt-4">
//           Don't have an account?{" "}
//           <Link to="/register" className="text-blue-600">
//             Sign Up
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Login;


import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ArrowRight, Code2 } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', formData);
      login(res.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 flex items-center justify-center px-4">
      {/* Decorative blobs */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-300/40 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -left-10 w-80 h-80 bg-sky-300/40 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Code2 size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-slate-800">DevConnect</span>
        </div>

        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl shadow-blue-100 p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
              <Lock size={22} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
            <p className="text-sm text-slate-500 mt-1">Login to continue to DevConnect 👋</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-2 mb-4">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              />
            </div>

            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="text-sm text-center text-slate-500 mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-medium hover:underline">Sign Up</Link>
          </p>
        </div>

        <p className="text-center text-sm text-slate-400 mt-6">
          Build your <span className="text-blue-600 font-medium">network</span>. Grow your <span className="text-indigo-600 font-medium">career</span>.
        </p>
      </div>
    </div>
  );
}

export default Login;