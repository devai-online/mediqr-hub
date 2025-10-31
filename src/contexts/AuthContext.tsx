"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'doctor';
  name?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
  isDoctor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    // Admin login
    if (username === 'admin' && password === 'admin123') {
      const adminUser = { id: 'admin', username: 'admin', role: 'admin' as const };
      setUser(adminUser);
      localStorage.setItem('currentUser', JSON.stringify(adminUser));
      return true;
    }

    // Check doctor credentials
    const doctors = JSON.parse(localStorage.getItem('doctors') || '[]');
    const doctor = doctors.find((d: any) => d.username === username && d.password === password);
    
    if (doctor) {
      const doctorUser = { 
        id: doctor.id, 
        username: doctor.username, 
        role: 'doctor' as const,
        name: doctor.name 
      };
      setUser(doctorUser);
      localStorage.setItem('currentUser', JSON.stringify(doctorUser));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAdmin: user?.role === 'admin',
      isDoctor: user?.role === 'doctor'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};


