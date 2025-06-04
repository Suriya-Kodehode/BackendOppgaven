export const ERROR_MESSAGES = {
    signup: {
        required: "Email and password are required.",
        exists: "Registration failed. Email or username may already exist.",
        unknown: "Unknown error occurred during signup"
    },
    login: {
        invalid: "Invalid username/email or password.",
        db: "A database error occurred during login.",
        unknown: "An unexpected error occurred during login."
    },
    editUser: {
        token: "Invalid or expired token",
        exists: "Username or email already exists",
        unknown: "Unexpected error occurred during user edit"
    },
    user: {
        notFound: "User not found.",
        fetch: "Error fetching users",
        check: "Error checking for user"
    },
    token: {
        invalid: "Invalid or expired token",
        validate: "Error validating token"
    },
    auth: {
        missing: "No token provided",
        expired: "Token has expired.",
        invalid: "Invalid token.",
        config: "Server configuration error",
        verify: "Invalid or expired token"
    },
    server: {
        config: "Server configuration error",
        unexpected: "An unexpected error occurred."
    }
};

export class ReqError extends Error {
    constructor(status, message, details = null) {
        super(message);
        this.status = status;
        this.details = details;
    }
}

export const handleError = (error, res) => {
    if (error instanceof ReqError) {
        console.warn(`Handled error [${error.status}]: ${error.message}`);
        return res.status(error.status).json({ error: error.message, details: error.details || undefined });
    } else {
        console.error(`Unhandled error: ${error.stack}`);
        return res.status(500).json({ error: ERROR_MESSAGES.server.unexpected });
    }
};

export const errorMiddleware = (err, req, res, next) => handleError(err, res);

export const errorHandler = {
    s: (...args) => console.error(...args)
};