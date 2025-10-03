import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock storage for demonstration - replace with Supabase in production
const USERS_KEY = 'app_users';
const CURRENT_USER_KEY = 'current_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const currentUserData = localStorage.getItem(CURRENT_USER_KEY);
    if (currentUserData) {
      setUser(JSON.parse(currentUserData));
    }
    setLoading(false);
  }, []);

  // Get all users from localStorage
  const getUsers = (): User[] => {
    const usersData = localStorage.getItem(USERS_KEY);
    return usersData ? JSON.parse(usersData) : [];
  };

  // Save users to localStorage
  const saveUsers = (users: User[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  // Sign up - creates new user account with role selection
  const signUp = async (email: string, password: string, fullName: string, role: UserRole): Promise<void> => {
    const users = getUsers();

    // Check if user already exists
    if (users.some(u => u.email === email)) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      fullName,
      role,
      createdAt: new Date().toISOString(),
    };

    // Store password separately (in production, use proper authentication)
    const passwords = JSON.parse(localStorage.getItem('app_passwords') || '{}');
    passwords[email] = password;
    localStorage.setItem('app_passwords', JSON.stringify(passwords));

    // Save user
    users.push(newUser);
    saveUsers(users);

    // Auto sign in after signup
    setUser(newUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  };

  // Sign in - authenticates user and sets current session
  const signIn = async (email: string, password: string): Promise<void> => {
    const users = getUsers();
    const passwords = JSON.parse(localStorage.getItem('app_passwords') || '{}');

    // Find user
    const foundUser = users.find(u => u.email === email);

    if (!foundUser) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    if (passwords[email] !== password) {
      throw new Error('Invalid email or password');
    }

    // Set current user
    setUser(foundUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(foundUser));
  };

  // Sign out - clears current session
  const signOut = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  // Update user profile
  const updateProfile = async (fullName: string): Promise<void> => {
    if (!user) throw new Error('No user logged in');

    const users = getUsers();
    const updatedUsers = users.map(u =>
      u.id === user.id ? { ...u, fullName } : u
    );

    saveUsers(updatedUsers);

    const updatedUser = { ...user, fullName };
    setUser(updatedUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
