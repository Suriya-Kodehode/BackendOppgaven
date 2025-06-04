import { config } from 'dotenv';
import crypto from 'crypto';
import fs from 'fs';

const ENV_FILE_PATH = '.env';

function stripQuotes(value) {
    if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
        return value.slice(1, -1);
    }
    return value;
}

function ensureJwtSecret() {
    config();
    let secret = stripQuotes(process.env.JWT_SECRET);
    if (!secret) {
        let envConfig = [];
        if (fs.existsSync(ENV_FILE_PATH)) {
            envConfig = fs.readFileSync(ENV_FILE_PATH, 'utf-8').split('\n');
        }
        const jwtSecretIndex = envConfig.findIndex(line => line.trim().startsWith('JWT_SECRET='));
        if (jwtSecretIndex !== -1) {
            secret = stripQuotes(envConfig[jwtSecretIndex].split('=')[1]?.trim());
        }
        if (!secret) {
            secret = crypto.randomBytes(64).toString('hex');
            if (jwtSecretIndex !== -1) {
                envConfig[jwtSecretIndex] = `JWT_SECRET="${secret}"`;
                fs.writeFileSync(ENV_FILE_PATH, envConfig.join('\n'));
            } else {
                fs.appendFileSync(ENV_FILE_PATH, `\nJWT_SECRET="${secret}"`);
            }
        }
        process.env.JWT_SECRET = secret;
    } else {
        process.env.JWT_SECRET = secret;
    }
}

export default ensureJwtSecret;