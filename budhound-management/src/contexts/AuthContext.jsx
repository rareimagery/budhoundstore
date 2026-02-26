import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import apiClient, {
  setAccessToken,
  setRefreshToken,
  clearAccessToken,
} from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Restore session on mount via refresh token cookie ──
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const tokenRes = await apiClient.post(
          ENDPOINTS.TOKEN,
          new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: import.meta.env.VITE_OAUTH_CLIENT_ID,
          })
        );
        if (cancelled) return;
        setAccessToken(tokenRes.data.access_token);
        if (tokenRes.data.refresh_token) {
          setRefreshToken(tokenRes.data.refresh_token);
        }

        const meRes = await apiClient.get(ENDPOINTS.ME);
        if (cancelled) return;
        setUser(meRes.data);
      } catch {
        // No valid session — user must log in.
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    restoreSession();
    return () => { cancelled = true; };
  }, []);

  // ── Listen for forced logout from API interceptor ──
  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null);
      clearAccessToken();
    };
    window.addEventListener('auth:forceLogout', handleForceLogout);
    return () => window.removeEventListener('auth:forceLogout', handleForceLogout);
  }, []);

  // ── Login ──
  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const tokenRes = await apiClient.post(
        ENDPOINTS.TOKEN,
        new URLSearchParams({
          grant_type: 'password',
          client_id: import.meta.env.VITE_OAUTH_CLIENT_ID,
          username: email,
          password,
        })
      );
      setAccessToken(tokenRes.data.access_token);
      if (tokenRes.data.refresh_token) {
        setRefreshToken(tokenRes.data.refresh_token);
      }

      const meRes = await apiClient.get(ENDPOINTS.ME);
      setUser(meRes.data);
      return meRes.data;
    } catch (err) {
      const message =
        err.response?.status === 401
          ? 'Invalid email or password.'
          : 'Login failed. Please try again.';
      setError(message);
      throw new Error(message);
    }
  }, []);

  // ── Logout ──
  const logout = useCallback(async () => {
    try {
      await apiClient.post(ENDPOINTS.REVOKE);
    } catch {
      // Best-effort revocation.
    }
    clearAccessToken();
    setUser(null);
  }, []);

  // ── Permission / Role helpers ──
  const hasPermission = useCallback(
    (permission) => user?.permissions?.includes(permission) ?? false,
    [user]
  );

  const hasRole = useCallback(
    (role) => user?.roles?.includes(role) ?? false,
    [user]
  );

  const hasAnyRole = useCallback(
    (roles) => roles.some((r) => user?.roles?.includes(r)),
    [user]
  );

  // ── Determine the user's primary (highest) role ──
  const primaryRole = useMemo(() => {
    if (!user?.roles) return null;
    const hierarchy = ['store_owner', 'store_manager', 'budtender'];
    return hierarchy.find((r) => user.roles.includes(r)) || user.roles[0];
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      login,
      logout,
      hasPermission,
      hasRole,
      hasAnyRole,
      primaryRole,
      isAuthenticated: !!user,
    }),
    [user, loading, error, login, logout, hasPermission, hasRole, hasAnyRole, primaryRole]
  );

  return (
    <AuthContext.Provider value={value}>
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
