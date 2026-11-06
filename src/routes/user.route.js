import express from "express"
import { getUserProfile, loginUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.js"
import { auth } from "../middlewares/auth.js"

const router = express.Router()

router.post("/register", upload.single('avatar'), registerUser)
router.post("/login", loginUser)
router.post("/profile/:userName", auth, getUserProfile)
router.post("/refresh-token", refreshAccessToken)

export default router