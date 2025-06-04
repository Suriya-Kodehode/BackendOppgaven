export const log = (level, message, details = {}) => {
    const validLevels = ['log', 'info', 'warn', 'error', 'debug'];
    const logMethod = validLevels.includes(level) ? level : 'log';
    console[logMethod](`[${new Date().toISOString()}] ${message}`, details);
};

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;