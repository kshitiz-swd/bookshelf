import express from 'express'
import userRouter from './routes/user.route.js'
import bookRouter from './routes/book.route.js'
import connectionRouter from './routes/connection.route.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
// import { errorHandler } from './middlewares/errorHandler.js'

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true
}))
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

app.use('/api/user', userRouter)
app.use('/api/book', bookRouter)
app.use('/api/connection', connectionRouter)

// app.use(errorHandler)

export { app }