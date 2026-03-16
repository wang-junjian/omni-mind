import fs from 'fs/promises';
import path from 'path';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
}

class Logger {
  private logDir: string;
  private logFile: string;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.logFile = path.join(this.logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
    this.ensureLogDir();
  }

  private async ensureLogDir() {
    try {
      await fs.access(this.logDir);
    } catch {
      await fs.mkdir(this.logDir, { recursive: true });
    }
  }

  private async writeLog(entry: LogEntry) {
    const logLine = JSON.stringify(entry) + '\n';
    try {
      await fs.appendFile(this.logFile, logLine);
    } catch (error) {
      console.error('Failed to write log:', error);
    }
    // 同时输出到控制台
    const consoleLog = `[${entry.timestamp}] [${entry.level}] [${entry.module}] ${entry.message}`;
    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(consoleLog, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(consoleLog, entry.data || '');
        break;
      default:
        console.log(consoleLog, entry.data || '');
    }
  }

  public async debug(module: string, message: string, data?: any) {
    await this.writeLog({
      timestamp: new Date().toISOString(),
      level: LogLevel.DEBUG,
    module,
    message,
    data,
  });
}

  public async info(module: string, message: string, data?: any) {
  await this.writeLog({
    timestamp: new Date().toISOString(),
    level: LogLevel.INFO,
    module,
    message,
    data,
  });
}

  public async warn(module: string, message: string, data?: any) {
  await this.writeLog({
    timestamp: new Date().toISOString(),
    level: LogLevel.WARN,
    module,
    message,
    data,
  });
}

  public async error(module: string, message: string, data?: any) {
  await this.writeLog({
    timestamp: new Date().toISOString(),
    level: LogLevel.ERROR,
    module,
    message,
    data,
  });
}

  public async getRecentLogs(count: number = 100): Promise<LogEntry[]> {
    try {
      const content = await fs.readFile(this.logFile, 'utf-8');
      const lines = content.trim().split('\n');
      const recentLines = lines.slice(-count);
      return recentLines
        .filter(line => line.trim())
        .map(line => JSON.parse(line))
        .reverse();
    } catch (error) {
      console.error('Failed to read logs:', error);
      return [];
    }
  }
}

export const logger = new Logger();
