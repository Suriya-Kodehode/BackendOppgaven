import db from '../sequelize.js';
import { hashtoken } from './util.js';
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

    const [result] = await db.query(
        `DECLARE @ReturnCode INT;
         EXEC @ReturnCode = sp_SignUp @Username = :userName, @Email = :email, @Password = :password;
         SELECT @ReturnCode as ReturnCode;`,
        { replacements: { userName: userName || null, email, password }, type: db.QueryTypes.SELECT }
    );

    switch (result?.ReturnCode) {
        case 0:
            return { success: true, message: "User signup successfully", data: { userName, email } };
        case -1:
            throw new ReqError(400, ERROR_MESSAGES.signup.required);
        case -2:
        case -3:
            throw new ReqError(409, ERROR_MESSAGES.signup.exists);
        case -4:
        default:
            throw new ReqError(500, ERROR_MESSAGES.signup.unknown);
    }
};

export const checkUser = async ({ userName, email }) => {
    if (!userName && !email) throw new ReqError(400, ERROR_MESSAGES.user.check);

    const results = await db.query(
        `SELECT UserID, Username, Email FROM t_Users
         WHERE LOWER(Username) = LOWER(:userName) OR LOWER(Email) = LOWER(:email);`,
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
};

export const editUser = async ({ token, newUsername, newPassword, newEmail }) => {
    if (!token) throw new ReqError(400, ERROR_MESSAGES.editUser.token);
    if (!newUsername && !newPassword && !newEmail) throw new ReqError(400, ERROR_MESSAGES.editUser.unknown);

    const ReturnCode = await execSP(
        `DECLARE @ReturnCode INT;
         EXEC sp_EditUser
            @Token = :hashedToken,
            @NewUsername = :newUsername,
            @NewPassword = :newPassword,
            @NewEmail = :newEmail,
            @ReturnCode = @ReturnCode OUTPUT;
         SELECT @ReturnCode AS ReturnCode;`,
        {
            hashedToken: hashtoken(token),
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

export const validateToken = async (hashedToken) => {
    const [tokenValid] = await db.query(
        `SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END AS IsValid
         FROM t_UsersTokens
         WHERE Token = :hashedtoken AND TokenValidDate > GETDATE();`,
        { replacements: { hashedtoken: hashedToken }, type: db.QueryTypes.SELECT }
    );
    if (!tokenValid || !tokenValid.IsValid) throw new ReqError(401, ERROR_MESSAGES.token.invalid);
    return true;
};