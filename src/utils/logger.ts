/**
 * Logger utility for next-with-linaria
 * Provides consistent logging functionality with support for different log levels and colorized output
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  enableColors?: boolean;
  minLevel?: LogLevel;
  prefix?: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const COLORS = {
  reset: '\x1b[0m',
  debug: '\x1b[36m', // cyan
  info: '\x1b[32m', // green
  warn: '\x1b[33m', // yellow
  error: '\x1b[31m', // red
  bold: '\x1b[1m',
};

export class Logger {
  private prefix: string;
  private enableColors: boolean;
  private minLevel: LogLevel;

  constructor(options: LoggerOptions = {}) {
    this.prefix = options.prefix || 'next-linaria';
    this.enableColors = options.enableColors !== false;
    this.minLevel = options.minLevel || 'info';
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.minLevel];
  }

  private format(level: LogLevel, message: string): string {
    if (!this.enableColors) {
      return `[${this.prefix}] ${level.toUpperCase()}: ${message}`;
    }

    const color = COLORS[level];
    return `${color}[${this.prefix}]${COLORS.reset} ${COLORS.bold}${color}${level.toUpperCase()}:${COLORS.reset} ${message}`;
  }

  debug(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('debug')) return;
    console.log(this.format('debug', message), ...args);
  }

  info(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('info')) return;
    console.log(this.format('info', message), ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('warn')) return;
    console.warn(this.format('warn', message), ...args);
  }

  error(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('error')) return;
    console.error(this.format('error', message), ...args);
  }

  // Simple colorized log without level checking (for backward compatibility)
  colorize(message: string, color: keyof typeof COLORS = 'info'): string {
    if (!this.enableColors) return message;
    return `${COLORS[color]}${message}${COLORS.reset}`;
  }
}

// Create default singleton instance
export const logger = new Logger();

// Factory function to create custom loggers
export function createLogger(options: LoggerOptions): Logger {
  return new Logger(options);
}
