import express from 'express'
import { toggleFollow } from '../controllers/connection.controller.js'
import { auth } from '../middlewares/auth.js'

const router = express.Router()

router.post('/follows/toggle/:userId', auth, toggleFollow)

export default router
