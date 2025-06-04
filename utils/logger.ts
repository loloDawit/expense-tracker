const isProd = process.env.NODE_ENV === 'production';

// You can route logs to Sentry or a remote store in production
function logToConsole(type: 'log' | 'warn' | 'error' | 'info', ...args: any[]) {
  if (!isProd || type === 'error') {
    // Show everything in dev, but only errors in prod
    console[type](...args);
  }
}

const logger = {
  info: (...args: any[]) => logToConsole('info', 'ℹ️ [INFO]', ...args),
  warn: (...args: any[]) => logToConsole('warn', '⚠️ [WARN]', ...args),
  error: (...args: any[]) => logToConsole('error', '🔥 [ERROR]', ...args),
  debug: (...args: any[]) => {
    if (!isProd) logToConsole('log', '🐛 [DEBUG]', ...args);
  },

  // Optional: integrate Sentry
  remote: (error: unknown, context?: Record<string, any>) => {
    // Add integration here (Sentry, Firebase, etc.)
    if (isProd) {
      // e.g., Sentry.captureException(error, { extra: context });
    }
  },
};

export default logger;
