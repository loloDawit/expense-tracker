import { FirebaseApp, initializeApp } from 'firebase/app';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Auth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

const firebaseConfig = Constants.expoConfig?.extra?.firebase;

if (!firebaseConfig?.apiKey) {
  throw new Error(
    '❌ Firebase config is missing or incomplete. Check app.config.js and .env.',
  );
}

// Initialize Firebase app and Firebase Storage
let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

try {
  app = initializeApp(firebaseConfig);
  console.log('🔥 Firebase App initialized');

  // Initialize Firebase Auth
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  console.log('🔥 Firebase Auth initialized successfully');

  firestore = getFirestore(app);
  console.log('🔥 Firestore initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Firebase:', error);
}

export { app, auth, firestore };
