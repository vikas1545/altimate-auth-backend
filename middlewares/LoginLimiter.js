import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        status: 429,
        error: "Limit exceeded",
        details: "Too many login attempts. Please try after sometime."
    }
})