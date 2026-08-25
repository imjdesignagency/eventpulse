import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';
import { UserProfile, UserRole } from '../types';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
  firestoreDatabaseId: firebaseConfigJson.firestoreDatabaseId || undefined,
};

// Initialize Firebase App singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const USERS_COLLECTION = 'users';

/**
 * Fetch user profile from Firestore or local fallback
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  } catch (err) {
    console.warn('Firestore profile fetch warning (using local fallback if available):', err);
  }

  const stored = localStorage.getItem(`ep_user_profile_${uid}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Save or update user profile in Firestore & localStorage
 */
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  // Always update local cache
  localStorage.setItem(`ep_user_profile_${profile.uid}`, JSON.stringify(profile));
  localStorage.setItem('ep_current_user_profile', JSON.stringify(profile));

  try {
    const userDocRef = doc(db, USERS_COLLECTION, profile.uid);
    await setDoc(userDocRef, {
      ...profile,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore profile save warning (cached locally):', err);
  }
}

/**
 * Create a new account with email & password + profile
 */
export async function createAccount(params: {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  company?: string;
}): Promise<UserProfile> {
  const { email, password, displayName, role, phone, company } = params;
  
  // 1. Create auth user
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // 2. Update Firebase display name
  try {
    await updateProfile(user, { displayName });
  } catch (e) {
    console.warn('Display name update error:', e);
  }

  // 3. Build luxury profile
  const profile: UserProfile = {
    uid: user.uid,
    email: user.email || email,
    displayName: displayName || user.email?.split('@')[0] || 'VIP Member',
    role: role || 'organizer',
    phone: phone || '',
    company: company || '',
    avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    notificationPreferences: {
      emailUpdates: true,
      whatsappAlerts: true,
      smsReceipts: false,
    },
  };

  await saveUserProfile(profile);
  return profile;
}

/**
 * Sign in with email & password
 */
export async function loginUser(email: string, password: string): Promise<UserProfile> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  let profile = await getUserProfile(user.uid);
  if (!profile) {
    profile = {
      uid: user.uid,
      email: user.email || email,
      displayName: user.displayName || user.email?.split('@')[0] || 'Member',
      role: 'organizer',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      notificationPreferences: {
        emailUpdates: true,
        whatsappAlerts: true,
        smsReceipts: false,
      },
    };
  } else {
    profile = {
      ...profile,
      lastLoginAt: new Date().toISOString(),
    };
  }

  await saveUserProfile(profile);
  return profile;
}

/**
 * Sign in with Google Popup
 */
export async function loginWithGoogle(): Promise<UserProfile> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  let profile = await getUserProfile(user.uid);
  if (!profile) {
    profile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'VIP Host',
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
  } else {
    profile = {
      ...profile,
      lastLoginAt: new Date().toISOString(),
      avatarUrl: user.photoURL || profile.avatarUrl,
    };
  }

  await saveUserProfile(profile);
  return profile;
}

/**
 * Instant Demo Login helper
 */
export async function loginDemoAccount(role: UserRole): Promise<UserProfile> {
  const isOrganizer = role === 'organizer';
  const demoEmail = isOrganizer ? 'organizer@eventpulse.vip' : 'vip.guest@eventpulse.vip';
  const demoPass = 'EventPulse2026!';
  const demoName = isOrganizer ? 'Alexander Sterling' : 'Victoria Vance';
  const demoCompany = isOrganizer ? 'Apex Global Luxury Events' : 'Vance Horizons Group';
  const demoAvatar = isOrganizer 
    ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';

  try {
    return await loginUser(demoEmail, demoPass);
  } catch (err: any) {
    // If not created yet, create it!
    if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential' || err?.code === 'auth/invalid-login-credentials') {
      try {
        return await createAccount({
          email: demoEmail,
          password: demoPass,
          displayName: demoName,
          role,
          phone: '+14155550199',
          company: demoCompany,
        });
      } catch {
        // Fallback demo profile if Firebase auth is rate limited
      }
    }
  }

  // Local fallback demo session
  const fallbackProfile: UserProfile = {
    uid: `demo_${role}_${Date.now()}`,
    email: demoEmail,
    displayName: demoName,
    role,
    phone: '+14155550199',
    company: demoCompany,
    avatarUrl: demoAvatar,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    notificationPreferences: {
      emailUpdates: true,
      whatsappAlerts: true,
      smsReceipts: true,
    },
  };
  localStorage.setItem('ep_current_user_profile', JSON.stringify(fallbackProfile));
  return fallbackProfile;
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Sign out
 */
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Signout error:', e);
  }
  localStorage.removeItem('ep_current_user_profile');
}
