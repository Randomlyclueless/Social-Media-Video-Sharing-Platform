// Create a custom response class for successful API responses
class ApiResponse {

    // Constructor runs when a new ApiResponse object is created
    constructor(
        statusCode,              // HTTP status code (200, 201, etc.)
        data,                    // Data to send in response
        message = "Success"      // Default success message
    ) {

        // Assign values to the response object
        this.statusCode = statusCode;  // HTTP status code
        this.data = data;              // Actual response data
        this.message = message;        // Success message
        this.success = true;           // Indicates request succeeded
    }
}

// Export ApiResponse so it can be used in controllers
export { ApiResponse };
