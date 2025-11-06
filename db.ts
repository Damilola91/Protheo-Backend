import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config()

const init = async (): Promise<void> => {
    try {
        await mongoose.connect(process.env.DB_URI || "");
        console.log("Database connection successful")
    } catch (error) {
        console.error("Error connection to database", error)
        process.exit(1)
    }
}

export default init