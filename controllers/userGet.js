import { getAllUsers } from "../util/dbQueries.js";
import { ReqError, ERROR_MESSAGES } from "../middleware/errorHandler.js";

export const userGet = async (req, res) => {
    try {
        const users = await getAllUsers();
        // console.log("Fetched users:", users);

        return res.status(200).json({ message: "User fetched successfully", users });
    } catch (err) {
        if (err instanceof ReqError) {
            // console.error("Request failed", { message: err.message, stack: err.stack });
            return res.status(err.status).json({ error: err.message });
        }
        // console.error("Unexpected error while fetching users", { message: err.message, stack: err.stack });
        return res.status(500).json({ error: ERROR_MESSAGES.server.unexpected });
    }
};