import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.join(__dirname, '../../../logs');

const levels = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };
const colors = { error: 'red', warn: 'yellow', info: 'green', http: 'magenta', debug: 'cyan' };
winston.addColors(colors);

const isProd = process.env.NODE_ENV === 'production';

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  })
);

const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const makeRotating = (filename, level) =>
  new DailyRotateFile({
    filename: path.join(logsDir, `${filename}-%DATE%.log`),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    level,
    format: fileFormat,
    zippedArchive: true,
  });

export const logger = winston.createLogger({
  level: isProd ? 'warn' : 'debug',
  levels,
  transports: [
    new winston.transports.Console({ format: consoleFormat, silent: process.env.NODE_ENV === 'test' }),
    makeRotating('combined', 'http'),
    makeRotating('error', 'error'),
  ],
  exceptionHandlers: [makeRotating('exceptions', 'error')],
  rejectionHandlers: [makeRotating('rejections', 'error')],
});

// Category-specific loggers
export const securityLogger = logger.child({ category: 'security' });
export const paymentLogger = logger.child({ category: 'payment' });
export const auditLogger = logger.child({ category: 'audit' });
export const redisLogger = logger.child({ category: 'redis' });
export const dbLogger = logger.child({ category: 'database' });
