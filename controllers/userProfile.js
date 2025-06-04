import { checkUser } from "../util/dbQueries.js";
import { ReqError, ERROR_MESSAGES, handleError } from "../middleware/errorHandler.js";

export const userProfile = async (req, res) => {
    // console.info("Request successfully reached userProfile controller");
    try {
        const { identifier } = req.user;
        if (!identifier || typeof identifier !== 'string' || identifier.trim() === '') {
            // console.warn("Invalid identifier provided:", identifier);
            throw new ReqError(400, ERROR_MESSAGES.user.notFound);
        }

        // console.info(`Fetching the user profile ${identifier}`);

        const users = await checkUser({ userName: identifier.toLowerCase(), email: identifier.toLowerCase() });
        // console.info("Result from checkUser:", users);
        
        if (!users || users.length === 0) {
            // console.warn("No user found for identifier:", identifier);
            throw new ReqError(404, ERROR_MESSAGES.user.notFound);
        }

        const userProfile = {
            UserID: users[0].UserID,
            UserName: users[0].Username,
            Email: users[0].Email,
        };
        // console.info(`User profile found: ${JSON.stringify(userProfile)}`);
        return res.status(200).json({
            message: "User fetched successfully",
            profile: userProfile,
        });
    } catch (err) {
        return handleError(err, res);
    }
};