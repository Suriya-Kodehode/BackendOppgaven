import { addUser, checkUser } from "../util/dbQueries.js";
import { ReqError, ERROR_MESSAGES } from "../middleware/errorHandler.js";
import { emailRegex } from "../util/util.js";

export const userSignup = async (req, res) => {
    const { userName, email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ error: ERROR_MESSAGES.signup.required });
        }

        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long" });
        }

        const existingUser = await checkUser({ userName: userName ?? null, email });
        if (existingUser) {
            const conflictField = existingUser[0]?.Email === email ? "Email" : "Username";
            return res.status(409).json({ error: ERROR_MESSAGES.signup.exists, conflictField });
        }

        try {
            const response = await addUser({ email, userName: userName ?? null, password });
            return res.status(201).json({ message: response.message, data: response.data });
        } catch (err) {
            if (err instanceof ReqError) {
                return res.status(err.status).json({ error: err.message });
            }
            return res.status(500).json({ error: err.message || ERROR_MESSAGES.server.unexpected });
        }
    } catch (err) {
        if (err instanceof ReqError) {
            return res.status(err.status).json({ error: err.message });
        }
        return res.status(500).json({ error: ERROR_MESSAGES.server.unexpected });
    }
};