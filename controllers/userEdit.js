import { editUser } from "../util/dbQueries.js";
import { ReqError, ERROR_MESSAGES, handleError } from "../middleware/errorHandler.js";

export const userEdit = async (req, res) => {
    // Debug: log entry into controller
    // console.log("userEdit controller called");
    // console.log("Request body:", req.body);

    const { newUsername, newPassword, newEmail } = req.body;

    try {
        if (!newUsername && !newPassword && !newEmail) {
            console.warn("No fields provided for update");
            return res.status(400).json({ error: ERROR_MESSAGES.editUser.unknown });
        }

        const authHeader = req.headers.authorization;
        // console.log("Authorization header:", authHeader);

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.warn("Missing or invalid token in Authorization header");
            return res.status(401).json({ error: ERROR_MESSAGES.auth.missing });
        }

        const token = authHeader.slice(7).trim();
        // console.log("Raw token:", token);

        // Debug: log about to call editUser
        // console.log("About to call editUser with:", { token, newUsername, newPassword, newEmail });

        const userEdited = await editUser({
            token,
            newUsername: newUsername ?? null,
            newPassword: newPassword ?? null,
            newEmail: newEmail ?? null,
        });
        // console.log("EditUser response:", userEdited);

        return res.status(200).json({
            message: userEdited.message || "User edited successfully",
            updatedField: {
                newUsername: newUsername || "N/A",
                newEmail: newEmail || "N/A",
                newPassword: newPassword ? "******" : null
            }
        });
    } catch (err) {
        return handleError(err, res);
    }
};