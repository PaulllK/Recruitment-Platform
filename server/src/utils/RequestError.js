export class RequestError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = "ForbiddenError";
        this.statusCode = statusCode; // Optional: include the HTTP status code for reference
    }
}