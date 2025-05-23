import { FirebaseApp, initializeApp } from 'firebase/app';

import logger from '@/utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native'; // ✅ correct SDK
import Constants from 'expo-constants';
import { Auth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

const firebaseConfig = Constants.expoConfig?.extra?.firebase;

if (!firebaseConfig?.apiKey) {
  const configError = new Error(
    '❌ Firebase config is missing or incomplete. Check app.config.js and .env.',
  );
  Sentry.captureException(configError); // ✅ Send to Sentry
  throw configError;
}

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

try {
  app = initializeApp(firebaseConfig);
  logger.info('🔥 Firebase App initialized successfully');

  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  logger.info('🔥 Firebase Auth initialized successfully');

  firestore = getFirestore(app);
  logger.info('🔥 Firestore initialized successfully');
} catch (error) {
  logger.error('Error initializing Firebase:', error);
  Sentry.captureException(error); // ✅ proper method
  throw error; // Still crash app
}

export { app, auth, firestore };
