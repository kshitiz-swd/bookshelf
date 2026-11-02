import express from 'express'
import userRouter from './routes/user.route.js'
import bookRouter from './routes/book.route.js'
import connectionRouter from './routes/connection.route.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app = express()


app.use(express.json({ limit: "16kb" }))
app.use(cors({}))
app.use(cookieParser())

app.use('/api/user', userRouter)
app.use('/api/book', bookRouter)
app.use('/api/connection', connectionRouter)


export { app }