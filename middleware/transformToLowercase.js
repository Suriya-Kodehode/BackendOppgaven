const preservedKeys = ['userName', 'newEmail', 'newPassword', 'newUsername'];

export const transformToLowercase = (obj, preserveKeys = preservedKeys) => {
    if (!obj || typeof obj !== "object") return obj;
    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [
            preserveKeys.includes(key) ? key : key.toLowerCase(),
            typeof value === 'string' && !preserveKeys.includes(key) ? value.toLowerCase() : value,
        ])
    );
};

export const transformToLowercaseMiddleware = (req, res, next) => {
    if (req.body) req.body = transformToLowercase(req.body);
    if (req.query) req.query = transformToLowercase(req.query);
    if (req.params) req.params = transformToLowercase(req.params);
    next();
};