import { getAllUsers } from "../util/dbQueries.js";
import { handleError } from "../middleware/errorHandler.js";

export const userGet = async (req, res) => {
    try {
        const users = await getAllUsers();
        // console.log("Fetched users:", users);

        return res.status(200).json({ message: "User fetched successfully", users });
    } catch (err) {
        return handleError(err, res);
    }
};