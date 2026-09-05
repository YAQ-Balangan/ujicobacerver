// src/context/AuthContext.jsx
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState } from "react";
import { api, APP_NAME } from "../api/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem(`${APP_NAME}_session`);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      sessionStorage.removeItem(`${APP_NAME}_session`);
      return null;
    }
  });
  const loading = false;

  const loginAction = async (u, p) => {
    const userData = await api.login(u, p);
    setUser(userData);
    // UBAH DI SINI: Gunakan sessionStorage
    sessionStorage.setItem(`${APP_NAME}_session`, JSON.stringify(userData));
  };

  const logoutAction = () => {
    setUser(null);
    // UBAH DI SINI: Gunakan sessionStorage
    sessionStorage.removeItem(`${APP_NAME}_session`);
  };

  const updateUserAction = (nextUser) => {
    setUser(nextUser);
    sessionStorage.setItem(`${APP_NAME}_session`, JSON.stringify(nextUser));
  };

  return (
    <AuthContext.Provider
      value={{ user, login: loginAction, logout: logoutAction, updateUser: updateUserAction, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
