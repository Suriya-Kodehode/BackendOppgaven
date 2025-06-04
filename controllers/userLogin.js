import jwt from 'jsonwebtoken';

import { logIn } from "../util/dbQueries.js";
import { handleError, ReqError, ERROR_MESSAGES } from "../middleware/errorHandler.js";

export const userLogin = async (req, res) => {
    const { identifier, password } = req.body;

    try {
        if (!identifier || !password) {
            throw new ReqError(400, ERROR_MESSAGES.login.invalid);
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new ReqError(500, ERROR_MESSAGES.auth.config);
        }

        const jwtToken = jwt.sign({ identifier }, secret, { expiresIn: '30m' });
        // console.log("Generated JWT token:", jwtToken);

        const loginQuery = await logIn(identifier, password, jwtToken);

        if (!loginQuery || typeof loginQuery.UserID === "undefined") {
            throw new ReqError(401, ERROR_MESSAGES.login.invalid);
        }

        return res.status(200).json({
            success: true,
            message: "Login successful",
            jwtToken,
            userID: loginQuery.UserID
        });
    } catch (err) {
        return handleError(err, res);
    }
};