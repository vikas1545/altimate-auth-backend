import { validationResult } from 'express-validator';

const checkFieldsError = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return errors.array();
    }
    return null;
};

export default checkFieldsError;
