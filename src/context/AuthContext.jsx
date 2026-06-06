// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import { api, APP_NAME } from "../api/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // UBAH DI SINI: Gunakan sessionStorage
    const saved = sessionStorage.getItem(`${APP_NAME}_session`);
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        sessionStorage.removeItem(`${APP_NAME}_session`);
      }
    }
    setLoading(false);
  }, []);

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

  return (
    <AuthContext.Provider
      value={{ user, login: loginAction, logout: logoutAction, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
