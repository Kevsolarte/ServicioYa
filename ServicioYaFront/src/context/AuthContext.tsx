import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { me } from '../api/auth';
import { clearToken, getToken, getUser, setUser as setUserStorage } from '../lib/auth';

type AuthUser = { id?: string; email?: string; fullName?: string; role?: string } | null;

type AuthContextType = {
  user: AuthUser;
  loading: boolean;
  isAuth: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuth: false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(getUser<AuthUser>());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }

    me()
      .then((data) => {
        // tu /auth/me devuelve { sub, role }
        const merged = { ...(user ?? {}), id: (user as any)?.id ?? data.sub, role: data.role };
        setUser(merged);
        setUserStorage(merged);
      })
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    isAuth: !!user && !!getToken(),
    logout: () => {
      clearToken();
      setUser(null);
    }
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
