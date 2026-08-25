import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { 
  auth, 
  getUserProfile, 
  saveUserProfile, 
  createAccount, 
  loginUser, 
  loginWithGoogle, 
  loginDemoAccount, 
  logoutUser, 
  sendPasswordReset 
} from '../services/firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  signup: (params: {
    email: string;
    password: string;
    displayName: string;
    role: UserRole;
    phone?: string;
    company?: string;
  }) => Promise<UserProfile>;
  login: (email: string, password: string) => Promise<UserProfile>;
  loginGoogle: () => Promise<UserProfile>;
  loginDemo: (role: UserRole) => Promise<UserProfile>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updatedData: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const cached = localStorage.getItem('ep_current_user_profile');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setUserProfile(profile);
            localStorage.setItem('ep_current_user_profile', JSON.stringify(profile));
          } else {
            // Build fallback profile from user auth
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || user.email?.split('@')[0] || 'VIP Member',
              role: 'organizer',
              avatarUrl: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
              notificationPreferences: {
                emailUpdates: true,
                whatsappAlerts: true,
                smsReceipts: false,
              },
            };
            setUserProfile(newProfile);
            await saveUserProfile(newProfile);
          }
        } catch (e) {
          console.warn('Auth state profile fetch error:', e);
        }
      } else {
        // If not logged in via Firebase Auth, check if demo session active
        const cached = localStorage.getItem('ep_current_user_profile');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.uid) {
              setUserProfile(parsed);
            } else {
              setUserProfile(null);
            }
          } catch {
            setUserProfile(null);
          }
        } else {
          setUserProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signup = async (params: {
    email: string;
    password: string;
    displayName: string;
    role: UserRole;
    phone?: string;
    company?: string;
  }) => {
    setLoading(true);
    try {
      const profile = await createAccount(params);
      setUserProfile(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const profile = await loginUser(email, password);
      setUserProfile(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const loginGoogle = async () => {
    setLoading(true);
    try {
      const profile = await loginWithGoogle();
      setUserProfile(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const loginDemo = async (role: UserRole) => {
    setLoading(true);
    try {
      const profile = await loginDemoAccount(role);
      setUserProfile(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setCurrentUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordReset(email);
  };

  const updateProfile = async (updatedData: Partial<UserProfile>) => {
    if (!userProfile) return;
    const merged: UserProfile = {
      ...userProfile,
      ...updatedData,
    };
    setUserProfile(merged);
    await saveUserProfile(merged);
  };

  const isAuthenticated = Boolean(currentUser || userProfile);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isAuthenticated,
        signup,
        login,
        loginGoogle,
        loginDemo,
        logout,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
