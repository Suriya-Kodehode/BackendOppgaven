import jwt from 'jsonwebtoken';

import { logIn } from "../util/dbQueries.js";
import { hashtoken } from "../util/util.js";
import { handleError, ReqError, ERROR_MESSAGES } from "../middleware/errorHandler.js";

export const userLogin = async (req, res) => {
    const { identifier, password } = req.body;

    try {
        if (!identifier || !password) {
            // console.warn("Username/Email and password are required");
            throw new ReqError(400, ERROR_MESSAGES.login.invalid);
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            // console.error("JWT_SECRET is not defined in the environment variables");
            throw new ReqError(500, ERROR_MESSAGES.auth.config);
        }

        const jwtToken = jwt.sign({ identifier }, secret, { expiresIn: '30m' });
        console.log("Generated JWT token:", jwtToken);

        const hashedToken = hashtoken(jwtToken);
        // console.log("Hashed JWT token:", hashedToken);

        const loginQuery = await logIn(identifier, password, hashedToken);
        // console.log("Login query result:", loginQuery);

        if (!loginQuery || typeof loginQuery.UserID === "undefined") {
            // console.warn("Invalid username/email or password");
            throw new ReqError(401, ERROR_MESSAGES.login.invalid);
        }

        return res.status(200).json({
            success: true,
            message: "Login successful",
            jwtToken,
            userID: loginQuery.UserID
        });
    } catch (err) {
        // console.error("Error during user login:", err.message);
        return handleError(err, res);
    }
};