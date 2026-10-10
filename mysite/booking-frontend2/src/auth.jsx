import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, getRefresh, getToken, setTokens } from './api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  const loadUser = useCallback(async () => {
    try {
      setUser(await api.profile());
    } catch (e) {
      if (e.status === 401) setTokens(null); // токен устарел
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (getToken()) loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    setTokens(data.access, data.refresh);
    await loadUser();
  };

  const register = async (form) => {
    await api.register(form);
    await login(form.email, form.password);
  };

  const logout = () => {
    const refresh = getRefresh();
    if (refresh) api.logout(refresh).catch(() => {});
    setTokens(null);
    setUser(null);
  };

  const updateProfile = async (formData) => {
    const updated = await api.updateProfile(formData);
    setUser(updated);
    return updated;
  };

  const deleteAccount = async () => {
    await api.deleteProfile();
    setTokens(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateProfile, deleteAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
}
