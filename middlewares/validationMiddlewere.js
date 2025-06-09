import { body } from "express-validator";

export const validateRegistrationRules = [
    body('username').trim().isLength({ min: 3 }).escape().withMessage('username must be at atleast 3 character'),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('password must be of atleast 6 character'),
]