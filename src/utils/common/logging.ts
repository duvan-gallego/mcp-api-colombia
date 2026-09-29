export const LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
} as const;

type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];
type LogMeta = Record<string, unknown>;

const levelPriority: Record<LogLevel, number> = {
  [LogLevel.ERROR]: 0,
  [LogLevel.WARN]: 1,
  [LogLevel.INFO]: 2,
  [LogLevel.DEBUG]: 3,
};

function getMinimumLevel(): LogLevel {
  const configuredLevel = process.env.LOG_LEVEL?.toLowerCase();
  return Object.values(LogLevel).includes(configuredLevel as LogLevel)
    ? (configuredLevel as LogLevel)
    : LogLevel.INFO;
}

function write(level: LogLevel, message: string, meta?: LogMeta): void {
  if (levelPriority[level] > levelPriority[getMinimumLevel()]) {
    return;
  }

  process.stderr.write(
    `${JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(meta && { meta }),
    })}\n`
  );
}

export const log = {
  error: (message: string, meta?: LogMeta) => write(LogLevel.ERROR, message, meta),
  warn: (message: string, meta?: LogMeta) => write(LogLevel.WARN, message, meta),
  info: (message: string, meta?: LogMeta) => write(LogLevel.INFO, message, meta),
  debug: (message: string, meta?: LogMeta) => write(LogLevel.DEBUG, message, meta),
};
