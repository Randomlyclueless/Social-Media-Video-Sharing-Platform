// Import Express framework
import express from 'express';

// Import CORS middleware (allows frontend & backend to communicate)
import cors from "cors";

// Import cookie parser (reads cookies from requests)
import cookieParser from "cookie-parser";

// Create Express application instance
const app = express();

// Enable CORS with custom configuration
// Allows requests only from specified frontend origin
// credentials: true allows cookies to be sent
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// Middleware to parse incoming JSON data
// limit prevents large payload attacks
app.use(express.json({ limit: "16kb" }));

// Middleware to parse URL-encoded form data
// extended: true allows nested objects
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Serve static files from "public" folder
// Example: images, css, js files
app.use(express.static("public"));

// Middleware to parse cookies from request headers
// Cookies will be available in req.cookies
app.use(cookieParser());

// Export app so it can be used in index.js
export { app };
