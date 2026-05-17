/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const TOKEN_KEY = 'token';

export const roleHomePath = {
  admin: '/admin/dashboard',
  teacher: '/faculty/subjects',
  student: '/student/dashboard',
};

export const roleLoginPath = {
  admin: '/login/admin',
  teacher: '/login/faculty',
  student: '/login/student',
};

const setAuthHeader = (token) => {
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common.Authorization;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          setAuthHeader(token);
          const res = await axios.get('/auth/me');
          setUser(res.data.data || res.data.user || null);
        } catch {
          localStorage.removeItem(TOKEN_KEY);
          setAuthHeader(null);
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (loginData) => {
    const res = await axios.post('/auth/login', loginData);
    localStorage.setItem(TOKEN_KEY, res.data.token);
    setAuthHeader(res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (userData) => {
    const res = await axios.post('/auth/register', userData);
    localStorage.setItem(TOKEN_KEY, res.data.token);
    setAuthHeader(res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setAuthHeader(null);
  };

  const getSecurityQuestion = async (email) => {
    const res = await axios.post('/auth/get-security-question', { email });
    return res.data;
  };

  const resetPassword = async (email, answer, newPassword) => {
    const res = await axios.post('/auth/reset-password', { email, answer, newPassword });
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, getSecurityQuestion, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
