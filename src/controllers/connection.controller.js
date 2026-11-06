import { User } from "../models/user.model.js"
import{Follow} from "../models/follow.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleFollow = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (userId === req.user._id.toString())
        throw new Error("You cannot follow yourself!!")

    const userExists = await User.findById(userId)
    if (!userExists)
        throw new Error("User does not exisits!!")

    const doesConnectionExist = await Follow.findOne({
        follower: req.user._id,
        following: userId
    })

    if (doesConnectionExist) {
        await Follow.findByIdAndDelete(doesConnectionExist._id)
        return res.status(200).json({ message: `You unfollowed: , ${userExists.userName}` })
    }

    const createConnection = await Follow.create({
        follower: req.user._id,
        following: userId
    })

    return res.status(200).json({ message: "Following!!", connection: createConnection })
})


export { toggleFollow }