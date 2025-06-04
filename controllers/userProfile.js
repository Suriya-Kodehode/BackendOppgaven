import { checkUser } from "../util/dbQueries.js";
import { ReqError, ERROR_MESSAGES, errorHandler } from "../middleware/errorHandler.js";

export const userProfile = async (req, res) => {
    console.info("Request successfully reached userProfile controller");
    try {
        const { identifier } = req.user;
        if (!identifier || typeof identifier !== 'string' || identifier.trim() === '') {
            console.warn("Invalid identifier provided:", identifier);
            return res.status(400).json({ error: ERROR_MESSAGES.user.notFound });
        }

        console.info(`Fetching the user profile ${identifier}`);

        const users = await checkUser({ userName: identifier.toLowerCase(), email: identifier.toLowerCase() });
        console.info("Result from checkUser:", users);
        
        if (!users || users.length === 0) {
            console.warn("No user found for identifier:", identifier);
            return res.status(404).json({ error: ERROR_MESSAGES.user.notFound });
        }

        const userProfile = {
            UserID: users[0].UserID,
            UserName: users[0].Username,
            Email: users[0].Email,
        };
        console.info(`User profile found: ${JSON.stringify(userProfile)}`);
        return res.status(200).json({
            message: "User fetched successfully",
            profile: userProfile,
        });
    } catch (err) {
        if (err instanceof ReqError) {
            errorHandler.s("Request failed", { message: err.message, stack: err.stack });
            return res.status(err.status).json({ error: err.message });
        }
        errorHandler.s("Error fetching user profile:", err.stack);
        res.status(500).json({ error: ERROR_MESSAGES.server.unexpected });
    }
};