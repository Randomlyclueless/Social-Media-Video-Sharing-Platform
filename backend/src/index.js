import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({ path: "./.env" });

const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    app.on("error", (error) => {
      console.error("Server error:", error);
      process.exit(1);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  });