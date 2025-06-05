import { deleteUser } from "../util/dbQueries.js";
import { ERROR_MESSAGES, errorHandler, ReqError } from "../middleware/errorHandler.js";

export const userDelete = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.warn("Missing or invalid token in Authorization header");
            return res.status(401).json({ success: false, error: ERROR_MESSAGES.auth.missing });
        }
        const token = authHeader.slice(7).trim();

        const result = await deleteUser(token);

        return res.status(200).json({ success: true, message: result.message });
    } catch (err) {
        if (err instanceof ReqError) {
            errorHandler.s("Handled error during user delete:", err.message);
            return res.status(err.status).json({ success: false, error: err.message });
        }
        errorHandler.s("Unhandled error deleting user:", err);
        return res.status(500).json({ success: false, error: ERROR_MESSAGES.deleteUser.unknown });
    }
};