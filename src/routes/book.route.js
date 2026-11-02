import express from "express"
import { auth } from "../middlewares/auth.js"
import { upload } from "../middlewares/multer.js"
import { addNewBook, addReview, editBook, getAllBooks, getBook } from "../controllers/book.controller.js"

const router = express.Router()

router.post("/books", auth, upload.single("coverImage"), addNewBook)

router.get("/books", auth, getAllBooks)

router.get("/books/:bookId", auth, getBook)

router.post("/books/reviews/:bookId", auth, addReview)

router.patch("/books/:bookId", auth, editBook)

export default router