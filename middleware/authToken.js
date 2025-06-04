import jwt from 'jsonwebtoken';
import { validateToken } from '../util/dbQueries.js';
import { hashtoken } from '../util/util.js';
import { ERROR_MESSAGES, ReqError } from './errorHandler.js';

const authToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        // console.log("Authorization header:", authHeader);

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            // console.log("Authorization header missing or invalid:", authHeader);
            return next(new ReqError(401, ERROR_MESSAGES.auth.missing));
        }

        const token = authHeader.slice(7).trim();
        // console.log("Received token:", token);

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("JWT_SECRET is not defined in the environment variables");
            return next(new ReqError(500, ERROR_MESSAGES.auth.config));
        }

        let decoded;
        try {
            decoded = jwt.verify(token, secret);
            // console.log("Decoded token (verified):", decoded);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return next(new ReqError(401, ERROR_MESSAGES.auth.expired));
            } else if (err.name === 'JsonWebTokenError') {
                return next(new ReqError(401, ERROR_MESSAGES.auth.invalid));
            } else {
                return next(new ReqError(401, ERROR_MESSAGES.auth.verify));
            }
        }
        
        const hashedToken = hashtoken(token);
        // console.log("Hashed token:", hashedToken.toString('hex'));

        const tokenValid = await validateToken(hashedToken);
        if (!tokenValid) {
            console.error("Token is invalid or expired in the database");
            return next(new ReqError(401, ERROR_MESSAGES.token.invalid));
        }

        req.user = decoded;
        next();
    } catch (err) {
        console.error("Token verification failed:", err.message);
        return next(new ReqError(401, ERROR_MESSAGES.token.invalid, err.message));
    }
}

export default authToken;