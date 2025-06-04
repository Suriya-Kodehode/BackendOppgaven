import { addUser, checkUser } from "../util/dbQueries.js";
import { ReqError, ERROR_MESSAGES, handleError } from "../middleware/errorHandler.js";
import { emailRegex } from "../util/util.js";

export const userSignup = async (req, res) => {
    const { userName, email, password } = req.body;

    try {
        if (!email || !password) {
            throw new ReqError(400, ERROR_MESSAGES.signup.required);
        }

        if (!emailRegex.test(email)) {
            throw new ReqError(400, "Invalid email format");
        }
        if (password.length < 6) {
            throw new ReqError(400, "Password must be at least 6 characters long");
        }

        const existingUser = await checkUser({ userName: userName ?? null, email });
        if (existingUser) {
            const conflictField = existingUser[0]?.Email === email ? "Email" : "Username";
            throw new ReqError(409, ERROR_MESSAGES.signup.exists, { conflictField });
        }

        const response = await addUser({ email, userName: userName ?? null, password });
        return res.status(201).json({ message: response.message, data: response.data });
    } catch (err) {
        return handleError(err, res);
    }
};