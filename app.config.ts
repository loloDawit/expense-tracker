import 'dotenv/config';

const IS_DEV = process.env.APP_VARIANT === 'development';

export default {
  expo: {
    name: IS_DEV ? 'Expense Tracker Dev' : 'Expense Tracker',
    slug: IS_DEV ? 'expense-tracker-dev' : 'expense-tracker',
    scheme: 'expense-tracker-app',
    version: '1.0.0',
    icon: './assets/images/icon.png',
    userInterfaceStyle: 'automatic',
    orientation: 'portrait',
    newArchEnabled: true,

    ios: {
      icon: './assets/images/icon.png',
      bundleIdentifier: 'com.dawitabera64.expensetracker',
      supportsTablet: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },

    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
    },

    web: {
      favicon: './assets/images/favicon.png',
      bundler: 'metro',
      output: 'static',
    },

    plugins: [
      'expo-router',
      [
        'expo-local-authentication',
        {
          faceIDPermission:
            'Allow $(PRODUCT_NAME) to use Face ID for authentication.',
        },
      ],
      [
        'expo-splash-screen',
        {
          image: './assets/images/icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
    ],

    updates: {
      url: 'https://u.expo.dev/843fdcd5-faec-412e-a90c-abe826341a5c',
    },

    runtimeVersion: {
      policy: 'appVersion',
    },

    experiments: {
      typedRoutes: true,
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
