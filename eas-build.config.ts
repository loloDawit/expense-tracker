// eas-build.config.js
module.exports = {
    build: {
      production: {
        node: '18',
        env: {
          SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
          EXPO_PUBLIC_SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
        },
        hooks: {
          postInstall: './eas-build-post-install.sh',
        },
      },
    },
  };
  