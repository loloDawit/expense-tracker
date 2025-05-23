import 'dotenv/config';

export default {
  expo: {
    name: 'expense-tracker-app',
    slug: 'expense-tracker',
    scheme: 'expense-tracker-app',
    version: '1.0.0',
    updates: {
      url: 'https://u.expo.dev/843fdcd5-faec-412e-a90c-abe826341a5c',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    ios: {
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
      bundleIdentifier: 'com.dawitabera64.expensetracker',
      supportsTablet: true,
    },
    extra: {
      sentryDsn: process.env.SENTRY_DSN,
      eas: {
        projectId: '843fdcd5-faec-412e-a90c-abe826341a5c',
      },
      firebase: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID,
      },
    },
  },
};
