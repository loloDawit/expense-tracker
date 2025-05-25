import { auth, firestore } from '@/config/firebase';
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

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!isMounted) return;

      if (firebaseUser) {
        logger.info('✅ Signed in:', firebaseUser);
        if (firebaseUser.emailVerified) {
          logger.info('✅ Email verified:', firebaseUser.email);

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email ?? '',
            displayName: firebaseUser.displayName ?? '',
            photoURL: firebaseUser.photoURL
              ? { uri: firebaseUser.photoURL }
              : undefined,
          });
          updateUserData({
            uid: firebaseUser.uid,
            email: firebaseUser.email ?? '',
            displayName: firebaseUser.displayName ?? '',
            photoURL: firebaseUser.photoURL
              ? { uri: firebaseUser.photoURL }
              : undefined,
          });
          router.replace('/(tabs)/home');
        } else {
          logger.warn('❗ Email not verified');
          setUser(null);
          router.replace('/(auth)/verify-email');
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
  }, []);

  /**
   * Logs in a user using their email and password.
   *
   * @param email - The user's email address.
   * @param password - The user's password.
   * @returns An object containing:
   *   - `success`: `true` if login succeeds, `false` otherwise.
   *   - `msg`: A user-friendly error message if login fails.
   *
   * @example
   * const { success, msg } = await login('user@example.com', 'password123');
   * if (!success) alert(msg);
   */
  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; msg?: string }> => {
    setIsLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const { uid, email: userEmail, displayName, photoURL } = res.user;
      setUser({
        uid,
        email: userEmail ?? '',
        displayName: displayName ?? '',
        photoURL: photoURL ? { uri: photoURL } : undefined,
      });
      return { success: true };
    } catch (error: any) {
      logger.error('Login error:', error);
      return { success: false, msg: getFirebaseAuthErrorMessage(error) };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Registers a new user and stores their profile in Firestore.
   *
   * @param name - Display name for the new user.
   * @param email - Email address for the new user.
   * @param password - Password for the new user.
   * @returns An object containing:
   *   - `success`: `true` if signup succeeds, `false` otherwise.
   *   - `msg`: A user-friendly error message if signup fails.
   *
   * @example
   * const { success, msg } = await signup('Jane Doe', 'jane@example.com', 'securePassword123');
   * if (!success) logger.error(msg);
   */
  const signup = async (
    name: string,
    email: string,
    password: string,
  ): Promise<{ success: boolean; msg?: string }> => {
    setIsLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = res.user;

      // send email verification
      await sendEmailVerification(res.user, {
        url: 'https://expense-tracker-app-68fed.web.app/verify',
      });
      logger.info('Email verification sent to:', email);

      const newUser: UserType = {
        uid,
        email,
        displayName: name,
        photoURL: undefined,
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

  /**
   * Signs out the currently authenticated user.
   *
   * @returns A promise that resolves when logout is complete.
   *
   * @example
   * await logout();
   */
  const logout = async (): Promise<void> => {
    await signOut(auth);
    setUser(null);
  };

  /**
   * Updates the current user's data in Firestore and local state.
   *
   * @param data - A partial object of `UserType` fields to update.
   * @returns A promise that resolves once the update is complete.
   *
   * @example
   * await updateUserData({ displayName: 'Updated Name' });
   */
  const updateUserData = async (user: Partial<UserType>): Promise<void> => {
    if (!user?.uid) return;

    const userRef = doc(firestore, 'users', user.uid);
    const docSnapshot = await getDoc(userRef);

    try {
      if (!docSnapshot.exists()) {
        logger.warn('User document does not exist, creating a new one');
        console.log('Creating new user document:', user);
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
      console.log({ data });

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

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, signup, logout, updateUserData }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access the AuthContext.
 *
 * @returns The auth context value, including user state and auth methods.
 * @throws Error if used outside of an `<AuthProvider>`.
 *
 * @example
 * const { user, login } = useAuth();
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
