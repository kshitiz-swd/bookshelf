import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 20,
        minLength: 3
    },
    userName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 20,
        minLength: 3,
        unique: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,

    },
    avatarPublicId: {
        type: String,
    },
    refreshToken: {
        type: String
    }

}, { timestamps: true })

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return

    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({ _id: this._id }, process.env.REFRESH_SECRET_KEY)
}
userSchema.methods.generateAccessToken = function () {
    return jwt.sign({ _id: this._id, email: this.email }, process.env.ACCESS_TOKEN_SECRET)
}

export const User = mongoose.model("User", userSchema)