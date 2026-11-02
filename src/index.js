
import { connectDB } from './db/db.js'
import 'dotenv/config'
import { app } from './app.js'

connectDB().then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`Server is running of PORT: ${process.env.PORT}`);
    })
}).catch((error) => {
    console.log("MONGODB connection error!!: ", error)
})

