import { FirebaseError } from 'firebase/app';

export const getFirebaseAuthErrorMessage = (error: unknown): string => {
  if (error instanceof FirebaseError && error.code.startsWith('auth/')) {
    switch (error.code) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-not-found':
        return 'No account found with this email. Please check the email and try again.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'This email is already registered.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/network-request-failed':
        return 'Network error. Check your internet connection.';
      case 'auth/invalid-credential':
        return 'Invalid credentials. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      default:
        return 'Authentication error. Please try again.';
    }
  }

  // fallback
  return 'Something went wrong. Please try again.';
};
