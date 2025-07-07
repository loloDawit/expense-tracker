import { auth, firestore } from '@/config/firebase';
import { resetPassword as resetPasswordService } from '@/services/userService';
import { AuthContextType, UserType } from '@/types';
import { getFirebaseAuthErrorMessage } from '@/utils/firebaseError';
import logger from '@/utils/logger';
import { useRouter } from 'expo-router';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  // Initialize Firebase auth state and redirect accordingly
  useEffect(() => {
    logger.info('🔐 AuthProvider mounted');
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMounted) return;

      if (firebaseUser) {
        await firebaseUser.reload();
        const { uid, email, displayName, emailVerified, photoURL } =
          firebaseUser;

        const loggedInUser: UserType = {
          uid,
          email: email ?? '',
          displayName: displayName ?? '',
          emailVerified,
          photoURL: photoURL ? { uri: photoURL } : undefined,
        };

        setUser(loggedInUser);
        updateUserData(loggedInUser);

        if (emailVerified) {
          router.replace('/(tabs)/home');
        } else {
          router.replace('/(modals)/verifyEmail');
        }
      } else {
        logger.info('🚪 User signed out or session expired');
        setUser(null);
        router.replace('/(auth)/welcome');
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      logger.info('👋 AuthProvider unmounted');
      unsubscribe();
    };
  }, [router]);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; msg?: string }> => {
    setIsLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      await res.user.reload(); // Reload user to get latest emailVerified status
      console.log('🔐 User logged in:', res.user);
      
      const { uid, email: userEmail, displayName, photoURL, emailVerified } = res.user;
      setUser({
        uid,
        email: userEmail ?? '',
        displayName: displayName ?? '',
        emailVerified,
        photoURL: photoURL ? { uri: photoURL } : undefined,
      });
      if (emailVerified) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/(modals)/verifyEmail');
      }
      return { success: true };
    } catch (error: any) {
      logger.error('Login error:', error);
      return { success: false, msg: getFirebaseAuthErrorMessage(error) };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
  ): Promise<{ success: boolean; msg?: string }> => {
    setIsLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = res.user;

      try {
        await sendEmailVerification(res.user, {
          url: 'https://expense-tracker-app-68fed.web.app/verify',
        });
        logger.info('✅ Custom verification email sent to:', email);
      } catch (err) {
        logger.warn('❌ Custom verification failed, trying fallback', err);

        try {
          await sendEmailVerification(res.user);
          logger.info('✅ Fallback verification email sent');
        } catch (fallbackErr) {
          logger.error('❌ Fallback verification also failed', fallbackErr);
        }
      }

      const newUser: UserType = {
        uid,
        email,
        displayName: name,
      };

      await setDoc(doc(firestore, 'users', uid), newUser);
      setUser(newUser);

      return { success: true };
    } catch (error: any) {
      logger.error('Signup error:', error);
      return { success: false, msg: getFirebaseAuthErrorMessage(error) };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
    setUser(null);
  };

  const updateUserData = async (user: Partial<UserType>): Promise<void> => {
    if (!user?.uid) return;

    const userRef = doc(firestore, 'users', user.uid);
    const docSnapshot = await getDoc(userRef);

    try {
      if (!docSnapshot.exists()) {
        logger.warn('User document does not exist, creating a new one');
        await setDoc(
          userRef,
          {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL ? { uri: user.photoURL } : null,
          },
          { merge: true },
        );
        return;
      }
      const data = docSnapshot.data() ?? {};

      const userData: UserType = {
        uid: data.uid ?? '',
        email: data.email ?? '',
        displayName: data.displayName ?? '',
        photoURL: data.photoURL ?? null,
      };

      setUser((prev) => ({ ...prev!, ...userData }));
    } catch (error) {
      logger.error('updateUserData error:', error);
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; msg?: string }> => {
    setIsLoading(true);
    try {
      await resetPasswordService(email);
      console.log('🔄 Password reset email sent to:', email);
      
      return { success: true };
    } catch (error: any) {
      logger.error('Password reset error:', error);
      return { success: false, msg: getFirebaseAuthErrorMessage(error) };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, signup, logout, updateUserData, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
