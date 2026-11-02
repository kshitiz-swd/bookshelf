import { User } from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { options } from "../utils/httpOptions.js"
import jwt from 'jsonwebtoken'

const generateRefreshAndAccessToken = async (userId) => {
    const user = await User.findById(userId)

    const refreshToken = user.generateRefreshToken()
    const accessToken = user.generateAccessToken()
    // console.log(refreshToken, accessToken);


    return { refreshToken, accessToken }
}

const registerUser = asyncHandler(async (req, res) => {

    const { name, userName, email, password } = req.body

    if ([name, email, password, userName].some((field) => {
        field.trim() === ""
    })) throw new Error(400, "all fields are required!!")


    const existingUser = await User.findOne({
        $or: [{ email }, { userName }]
    })

    if (existingUser)
        throw new Error("User already exists!!")

    let avatar
    let avatartLocalPath


    if (req.file) {
        avatartLocalPath = req.file?.path
        avatar = await uploadOnCloudinary(avatartLocalPath)
    }

    const user = await User.create({
        name,
        userName: userName.toLowerCase(),
        email,
        password,
        avatar: avatar ? avatar.url : "",
        avatarPublicId: avatar ? avatar.public_id : ""

    })
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser)
        throw new Error(500, "Something went wrong while registering the user")

    res.status(201).json(
        {
            user: user,
            message: "User created successfully!!"
        }
    )
})

const loginUser = asyncHandler(async (req, res) => {

    const { email, userName, password } = req.body

    if (!email && !userName)
        throw new Error(400, "Provide email or username!!")

    if (!password)
        throw new Error(400, "Password not entered!!")

    const existingUser = await User.findOne({
        $or: [{ email }, { userName }]
    })

    if (!existingUser)
        throw new Error(400, "User does not exists!!")

    const isPasswordCorrect = await existingUser.isPasswordCorrect(password)

    if (!isPasswordCorrect)
        throw new Error(401, "Wrong password entered!!")

    const { refreshToken, accessToken } = await generateRefreshAndAccessToken(existingUser._id)

    const loggedInUser = await User.findById(existingUser._id).select("-password -refreshToken")

    res.status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json({ user: loggedInUser, message: "User logged in successfully!!" })
})

const getUserProfile = asyncHandler(async (req, res) => {
    const { userName } = req.body

    if (userName.trim().toLowerCase() === "") throw new Error("Username does not exist!!")

    const user = await User.aggregate([
        { $match: { userName: userName } },
        {
            $lookup: {
                from: "follows",
                localField: "_id",
                foreignField: "following",
                as: "followers"
            }
        },
        {
            $lookup: {
                from: "follows",
                localField: "_id",
                foreignField: "follower",
                as: "following"
            }
        },
        {
            $lookup: {
                from: "books",
                localField: "_id",
                foreignField: "addedBy",
                as: "addedBooks",
            }
        },
        {
            $lookup: {
                from: "reviews",
                localField: "_id",
                foreignField: "reviewedBy",
                as: "reviews",
            }
        },
        {
            $addFields: {
                totalFollowers: {
                    $size: "$followers"
                },
                totalFollowing: {
                    $size: "$following"
                },
                totalAddedBooks: {
                    $size: "$addedBooks"
                },
                unPublishedBooks: {
                    $size: {
                        $filter: {
                            input: "$addedBooks",
                            as: "book",
                            $cond: { $eq: ["$$book.isPublished", false] }
                        }
                    }
                }
            }
        }
    ])

    if (!user.length) throw new Error("User does not exist!!")

    return res.status(200).json({ message: "profile fetched successfully!", user: user })

})

const refreshAccessToken = asyncHandler(async (req, res) => {

    // check the refresh token in the user
    //generate new access token and refresh token

    const token = req.cookies?.refreshToken
    if (!token) throw new Error("Invalid request!!")

    const decoded = jwt.verify(token, process.env.REFRESH_SECRET_KEY)

    const user = await User.findById(decoded._id)

    if (!user) throw new Error("User not found!!")

    if (token !== user.refreshToken)
        throw new Error("Refresh token invalid!!")

    const { accessToken, refreshToken } = await generateRefreshAndAccessToken(user._id)

    user.refreshToken = refreshToken

    await user.save()

    res.status(200).
        cookie("refreshToken", refreshToken, options).
        cookie("accessToken", accessToken, options).
        json("Access Token refreshed!!")
})


export { registerUser, loginUser, getUserProfile, refreshAccessToken }