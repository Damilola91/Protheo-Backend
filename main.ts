import init from "./db"
import cors from "cors"
import express from "express"
import users from "./routes/users"

const server = express()

server.use(express.json())
server.use(cors())
server.use("/", users)


const PORT = process.env.PORT || 4154


init()

server.listen(PORT, () => console.log(`Server is runnin' on PORT ${PORT}`))