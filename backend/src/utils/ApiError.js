// Create a custom error class that extends JavaScript's built-in Error class
class ApiError extends Error {

    // Constructor runs when a new ApiError object is created
    constructor(
        statusCode,                        // HTTP status code (400, 404, 500, etc.)
        message = "Something Went Wrong",  // Default error message
        errors = [],                       // Extra error details (optional)
        stack = ""                        // Custom stack trace (optional)
    ) {

        // Call parent Error class constructor with message
        super(message);

        // Assign custom properties
        this.statusCode = statusCode;  // HTTP status code
        this.data = null;              // No data returned on error
        this.message = message;        // Error message
        this.success = false;          // Indicates request failed
        this.errors = errors;           // Array of error details

        // If stack trace is provided, use it
        if (stack) {
            this.stack = stack;
        } 
        // Otherwise, generate stack trace automatically
        else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

// Export ApiError so it can be used in other files
export { ApiError };
