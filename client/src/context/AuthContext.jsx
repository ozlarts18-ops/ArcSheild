import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUserApi, registerUserApi, loginAdminApi, logoutApi } from '../services/api';

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
    return null;
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
      const authUser = { ...res.user, token: res.token, refreshToken: res.refreshToken };
      setCurrentUser(authUser);
      return { success: true, user: authUser };
    }
    return { success: false, error: res.message || res.error || 'Unable to authenticate with the provided credentials.' };
  };

  const registerUser = async (data) => {
    const res = await registerUserApi(data);
    if (res.success && res.user) {
      const authUser = { ...res.user, token: res.token, refreshToken: res.refreshToken };
      setCurrentUser(authUser);
      return { success: true, user: authUser };
    }
    return { success: false, error: res.message || res.error || 'Registration failed' };
  };

  const loginAdmin = async (email, password) => {
    const res = await loginAdminApi(email, password);
    if (res.success && res.user) {
      const authUser = { ...res.user, token: res.token, refreshToken: res.refreshToken };
      setCurrentUser(authUser);
      return { success: true, user: authUser };
    }
    return { success: false, error: res.message || res.error || 'Unable to authenticate with the provided credentials.' };
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (e) {
      // Ignore network errors on logout
    }
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
