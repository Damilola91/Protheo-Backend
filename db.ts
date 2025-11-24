import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config()

const init = async (): Promise<void> => {
    const dbUri = process.env.DB_URI

    if (!dbUri) {
        console.error("Database URI is missing. Please set the DB_URI environment variable.")
        process.exit(1)
    }

    try {
        await mongoose.connect(dbUri);
        console.log("Database connection successful")
    } catch (error) {
        console.error("Error connection to database", error)
        process.exit(1)
    }
}

export default init