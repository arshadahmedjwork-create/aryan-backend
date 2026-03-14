import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, mockUser } from './mock-data';
import { apiLogin, apiGetMe } from './api';

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  setUserFromRegister: (user: any) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  loginWithCredentials: async () => {},
  setUserFromRegister: () => {},
  logout: () => {},
  loading: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for saved token on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      apiGetMe()
        .then((u) => setUser(u as User))
        .catch(() => {
          localStorage.removeItem('access_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Mock login (kept for demo quick-login)
  const login = (role: UserRole) => {
    setUser(mockUser[role]);
    localStorage.setItem('mock_role', role);
  };

  // Real API login
  const loginWithCredentials = async (email: string, password: string) => {
    const result = await apiLogin(email, password);
    localStorage.setItem('access_token', result.access_token);
    setUser(result.user as User);
  };

  // Set user after registration
  const setUserFromRegister = (userData: any) => {
    setUser(userData as User);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('mock_role');
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithCredentials, setUserFromRegister, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
