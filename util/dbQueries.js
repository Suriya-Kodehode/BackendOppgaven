import db from '../sequelize.js';
import { ReqError, ERROR_MESSAGES } from '../middleware/errorHandler.js';

const execSP = async (query, replacements) => {
    const [result] = await db.query(query, { replacements, type: db.QueryTypes.SELECT });
    if (typeof result?.ReturnCode === "undefined") {
        throw new ReqError(500, ERROR_MESSAGES.signup.unknown);
    }
    return result.ReturnCode;
};

export const addUser = async ({ email, userName, password }) => {
    if (!email || !password) throw new ReqError(400, ERROR_MESSAGES.signup.required);

    try {
        const [result] = await db.query(
            `DECLARE @ReturnCode INT;
             EXEC @ReturnCode = sp_SignUp @Username = :userName, @Email = :email, @Password = :password;
             SELECT @ReturnCode as ReturnCode;`,
            { replacements: { userName: userName ?? null, email, password }, type: db.QueryTypes.SELECT }
        );

        if (!result || typeof result.ReturnCode === "undefined") {
            throw new ReqError(500, ERROR_MESSAGES.signup.unknown);
        }

        switch (result.ReturnCode) {
            case 0:
                return { success: true, message: "User signup successfully", data: { userName, email } };
            case -1:
                throw new ReqError(400, ERROR_MESSAGES.signup.required);
            case -2:
            case -3:
                throw new ReqError(409, ERROR_MESSAGES.signup.exists);
            case -4:
                throw new ReqError(500, "Database error during signup. Please contact support.");
            default:
                throw new ReqError(500, ERROR_MESSAGES.signup.unknown);
        }
    } catch (err) {
        if (err.name === 'SequelizeDatabaseError' && err.parent) {
            throw new ReqError(500, `Database error: ${err.parent.message || err.message}`);
        }
        throw new ReqError(500, ERROR_MESSAGES.signup.unknown);
    }
};

export const checkUser = async ({ userName, email }) => {
    if (!userName && !email) throw new ReqError(400, ERROR_MESSAGES.user.check);

    const results = await db.query(
        `SELECT UserID, Username, Email FROM t_Users
         WHERE (:userName IS NOT NULL AND LOWER(Username) = LOWER(:userName))
            OR LOWER(Email) = LOWER(:email);`,
        { replacements: { userName: userName ?? null, email: email ?? null }, type: db.QueryTypes.SELECT }
    );

    return Array.isArray(results) && results.length ? results : null;
};

export const getAllUsers = async () => {
    const users = await db.query(
        `SELECT UserID, Username, Email FROM t_Users`,
        { type: db.QueryTypes.SELECT }
    );
    return users || [];
};

export const logIn = async (identifier, password, token) => {
    try {
        const [result] = await db.query(
            `DECLARE @ReturnCode INT; DECLARE @UserID BIGINT;
             EXECUTE sp_Login
                @Identifier = :identifier,
                @Password = :password,
                @Token = :token,
                @UserID = @UserID OUTPUT,
                @ReturnCode = @ReturnCode OUTPUT;
             SELECT @ReturnCode AS ReturnCode, @UserID AS UserID;`,
            { replacements: { identifier, password, token }, type: db.QueryTypes.SELECT }
        );

        switch (result?.ReturnCode) {
            case 0:
                return result;
            case -1:
                throw new ReqError(401, ERROR_MESSAGES.login.invalid);
            case -2:
                throw new ReqError(500, ERROR_MESSAGES.login.db);
            default:
                throw new ReqError(500, ERROR_MESSAGES.login.unknown);
        }
    } catch (err) {
        if (
            err instanceof ReqError &&
            err.status === 401
        ) {
            throw err;
        }
        if (
            err.name === 'SequelizeDatabaseError' &&
            err.parent &&
            err.parent.message &&
            err.parent.message.toLowerCase().includes('invalid')
        ) {
            throw new ReqError(401, ERROR_MESSAGES.login.invalid);
        }
        console.error("Login DB error:", err);
        throw new ReqError(500, ERROR_MESSAGES.login.db);
    }
};

export const editUser = async ({ token, newUsername, newPassword, newEmail }) => {
    if (!token) throw new ReqError(400, ERROR_MESSAGES.editUser.token);
    if (!newUsername && !newPassword && !newEmail) throw new ReqError(400, ERROR_MESSAGES.editUser.unknown);

    const ReturnCode = await execSP(
        `DECLARE @ReturnCode INT;
         EXEC sp_EditUser
            @Token = :token,
            @NewUsername = :newUsername,
            @NewPassword = :newPassword,
            @NewEmail = :newEmail,
            @ReturnCode = @ReturnCode OUTPUT;
         SELECT @ReturnCode AS ReturnCode;`,
        {
            token,
            newUsername: newUsername ?? null,
            newPassword: newPassword ?? null,
            newEmail: newEmail ?? null
        }
    );

    switch (ReturnCode) {
        case -1:
            throw new ReqError(401, ERROR_MESSAGES.editUser.token);
        case -2:
        case -3:
            throw new ReqError(400, ERROR_MESSAGES.editUser.exists);
        case -4:
        default:
            throw new ReqError(500, ERROR_MESSAGES.editUser.unknown);
        case 0:
            return { success: true, message: "User updated successfully" };
    }
};

export const validateToken = async (token) => {
    const [tokenValid] = await db.query(
        `SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END AS IsValid
         FROM t_UsersTokens
         WHERE Token = :token AND TokenValidDate > GETDATE();`,
        { replacements: { token }, type: db.QueryTypes.SELECT }
    );
    if (!tokenValid || !tokenValid.IsValid) throw new ReqError(401, ERROR_MESSAGES.token.invalid);
    return true;
};

export const deleteUser = async (token) => {
    // Validate token and get UserID
    const [userToken] = await db.query(
        `SELECT UserID FROM t_UsersTokens WHERE Token = :token AND TokenValidDate > GETDATE();`,
        { replacements: { token }, type: db.QueryTypes.SELECT }
    );
    if (!userToken || !userToken.UserID) {
        throw new ReqError(401, ERROR_MESSAGES.token.invalid);
    }
    await db.query(
        `DELETE FROM t_Users WHERE UserID = :userID;`,
        { replacements: { userID: userToken.UserID }, type: db.QueryTypes.DELETE }
    );

    return { success: true, message: "User deleted successfully" };
};