

export class ErrorHandller extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fails' : 'error';
        this.isOptional = true;
        Error.captureStackTrace(this, this.constructor)
    }
}