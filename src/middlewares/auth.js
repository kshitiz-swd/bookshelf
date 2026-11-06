import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

const auth = asyncHandler(async (req, res, next) => {
    const { accessToken } = req.cookies || req.header("Authorization")?.replace("Bearer ", "")

    if (!accessToken)
        throw new Error("Invalid request!!")

    const decoded = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)

    const user = await User.findById(decoded._id).select("-password -refreshToken")

    if (!user)
        throw new Error("User does not exists!!")

    req.user = user
    next()
})
export { auth }