/**
 * Model for representing error responses.
 */
export class ErrorResponseModel {
    constructor(
        public status: number,   // HTTP status code
        public message: string,  // Error message
        public error: object,    // Detailed error object
    ) {}
}

/**
 * Model for representing success responses.
 */
export class SuccessResponseModel {
    constructor(
        public status: number,   // HTTP status code
        public message: string,  // Success message
        public data: object,     // Data object containing the response data
    ) {}
}

/**
 * Model for representing common responses which can be either success or error.
 */
export class CommonResponseModel {
    constructor(
        public status: number,   // HTTP status code
        public message: string,  // General message (success or error)
        public data?: object,    // Optional data object for success responses
        public error?: object,   // Optional error object for error responses
    ) {}
}
