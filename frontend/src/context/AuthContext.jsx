import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = '';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const res = await axios.get(`${API_URL}/auth/me`);
          setUser(res.data.data);
        } catch (err) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (userData) => {
    const res = await axios.post(`${API_URL}/auth/register`, userData);
    localStorage.setItem('token', res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const getSecurityQuestion = async (email) => {
    const res = await axios.post(`${API_URL}/auth/get-security-question`, { email });
    return res.data;
  };

  const resetPassword = async (email, answer, newPassword) => {
    const res = await axios.post(`${API_URL}/auth/reset-password`, { email, answer, newPassword });
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, getSecurityQuestion, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);