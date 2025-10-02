// Simple logger utility for consistent logging across the application
export class Logger {
  static info(message, ...args) {
    console.log(`ℹ️  ${message}`, ...args);
  }

  static success(message, ...args) {
    console.log(`✅ ${message}`, ...args);
  }

  static warn(message, ...args) {
    console.warn(`⚠️  ${message}`, ...args);
  }

  static error(message, error, ...args) {
    console.error(`❌ ${message}`, ...args);
    if (error?.stack) {
      console.error(error.stack);
    } else if (error) {
      console.error(error);
    }
  }

  static debug(message, ...args) {
    if (process.env.DEBUG === 'true') {
      console.log(`🔍 ${message}`, ...args);
    }
  }

  static api(method, path, ...args) {
    console.log(`🌐 ${method} ${path}`, ...args);
  }

  static db(operation, collection, ...args) {
    if (process.env.DEBUG === 'true') {
      console.log(`💾 ${operation} ${collection}`, ...args);
    }
  }
}
