// Production-safe logger - COMPLETELY DISABLED
// All logs are suppressed to prevent security leaks

export const logger = {
  log: (...args: any[]) => {
    // Disabled in production for security
  },
  error: (...args: any[]) => {
    // Disabled in production for security
  },
  warn: (...args: any[]) => {
    // Disabled in production for security
  },
  info: (...args: any[]) => {
    // Disabled in production for security
  }
};
