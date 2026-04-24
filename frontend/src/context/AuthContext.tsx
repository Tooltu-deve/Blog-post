import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  getCurrentUser,
  fetchUserAttributes,
  signOut as amplifySignOut,
} from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadUser(): Promise<User | null> {
  try {
    const current = await getCurrentUser();
    const attrs = await fetchUserAttributes();
    return {
      id: current.userId,
      email: attrs.email ?? current.username,
      firstName: attrs.given_name ?? '',
      lastName: attrs.family_name ?? '',
      role: 'USER', // Role is enforced server-side; UI only needs a coarse value
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setUser(await loadUser());
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));

    // Hub emits on signedIn / signedOut / tokenRefresh etc.
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signedIn' || payload.event === 'tokenRefresh') {
        refresh();
      } else if (payload.event === 'signedOut') {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [refresh]);

  const logout = async () => {
    await amplifySignOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, logout, refresh, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
