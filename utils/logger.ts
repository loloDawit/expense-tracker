type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const logPrefix = {
  info: 'ℹ️ [INFO]',
  warn: '⚠️ [WARN]',
  error: '🔴 [ERROR]',
  debug: '🐛 [DEBUG]',
};

const logFunctionMap = {
  info: console.info,
  warn: console.warn,
  error: console.error,
  debug: console.debug,
};

const logger = {
  info: (message: string, ...args: unknown[]) => {
    console.info(logPrefix.info, message, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(logPrefix.warn, message, ...args);
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(logPrefix.error, message, ...args);
  },
  debug: (message: string, ...args: unknown[]) => {
    if (__DEV__) {
      console.debug(logPrefix.debug, message, ...args);
    }
  },

  log: (level: LogLevel, message: string, ...args: unknown[]) => {
    if (level === 'debug' && !__DEV__) return;

    const prefix = logPrefix[level];
    const fn = logFunctionMap[level] || console.log;

    fn(prefix, message, ...args);
  },
};

export default logger;
