import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUserApi, registerUserApi, loginAdminApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('arcsheild_auth');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Default authenticated session for instant prototype inspection: Rahul Sharma (Normal User)
    return {
      id: 'USR-101',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@arcsheild.com',
      role: 'USER',
      trade: 'Welding',
      workshop: 'Welding Bay 01',
      assignedHelmetId: 'ARC-001',
      certification: 'Level 2 Shielded Metal Arc Welding'
    };
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('arcsheild_auth', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('arcsheild_auth');
    }
  }, [currentUser]);

  const loginUser = async (email, password) => {
    const res = await loginUserApi(email, password);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      return { success: true, user: res.user };
    }
    return { success: false, error: res.error || 'Login failed' };
  };

  const registerUser = async (data) => {
    const res = await registerUserApi(data);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      return { success: true, user: res.user };
    }
    return { success: false, error: res.error || 'Registration failed' };
  };

  const loginAdmin = async (email, password) => {
    const res = await loginAdminApi(email, password);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      return { success: true, user: res.user };
    }
    return { success: false, error: res.error || 'Admin login failed' };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        currentUser,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.role === 'ADMIN',
        loginUser,
        registerUser,
        loginAdmin,
        logout,
        setCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
