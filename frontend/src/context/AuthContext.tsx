import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/api';

export interface User {
  id: string; name: string; email: string;
  avatar: string; bio: string; college: string; course: string; year: string;
  skills: string[]; learningGoals: string[]; preferredStudyTime: string;
  xp: number; level: number; streak: number;
  totalStudyHours: number; aiChats: number; pdfsUploaded: number;
  quizzesCompleted: number; roadmapsCreated: number; notesCreated: number;
  flashcardsGenerated: number; badges: string[];
  achievements?: { id: string; label: string; icon: string }[];
}

interface AuthCtx {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const { data } = await api.get('/user/profile');
    setUser({ ...data, id: data._id || data.id });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser().catch(() => localStorage.removeItem('token')).finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser({ ...data.user, id: data.user._id || data.user.id });
    await fetchUser();
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('token', data.token);
    setUser({ ...data.user, id: data.user._id || data.user.id });
  };

  const logout = () => { localStorage.removeItem('token'); setUser(null); };

  const refreshUser = async () => { await fetchUser(); };

  return <AuthContext.Provider value={{ user, login, register, logout, refreshUser, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
