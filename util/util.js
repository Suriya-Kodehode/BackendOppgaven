import crypto from 'crypto';

export const hashtoken = (token) => {
    return crypto.createHash('sha512').update(token).digest('hex');
};

export const log = (level, message, details = {}) => {
    const validLevels = ['log', 'info', 'warn', 'error', 'debug'];
    const logMethod = validLevels.includes(level) ? level : 'log';
    console[logMethod](`[${new Date().toISOString()}] ${message}`, details);
};

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;