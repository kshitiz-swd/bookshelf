import mongoose, { Schema } from "mongoose";

const bookSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 35
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    author: {
        type: String,
        required: true,
        trim: true,
    },
    genre: {
        type: String,
        enum: {
            values: ["horror", "romance", "thriller", "fiction", "non-fiction"],
            message: '{VALUE} is not a genre listed'
        },
        required: true
    },
    coverImage: {
        type: String,
        required: true,
    },
    coverImagePublicId: {
        type: String
    },
    publishedYear: {
        type: Number,
        min: 1,
        validate: {
            validator: Number.isInteger,
            message: "Published year must be an integer"
        }
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    addedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true })

export const Book = mongoose.model("Book", bookSchema)