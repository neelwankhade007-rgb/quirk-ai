import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, getAuthToken, setAuthToken as storeAuthToken, removeAuthToken as storeRemoveAuthToken } from '../services/api';

interface AuthContextType {
  user: any;
  loading: boolean;
  signIn: (token: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await getAuthToken();
        if (token) {
          const userData = await getCurrentUser();
          setUser(userData);
        }
      } catch (e) {
        // Token is invalid or expired
        await storeRemoveAuthToken();
      } finally {
        setLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const signIn = async (token: string, userData: any) => {
    await storeAuthToken(token);
    setUser(userData);
  };

  const signOut = async () => {
    await storeRemoveAuthToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
