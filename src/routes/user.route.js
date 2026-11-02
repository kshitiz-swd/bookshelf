import express from "express"
import { getUserProfile, loginUser, registerUser } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.js"

const router = express.Router()

router.post("/register", upload.single('avatar'), registerUser)
router.post("/login", loginUser)
router.post("/profile/:userName", getUserProfile)

export default router