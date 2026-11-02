import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema({
    reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    bookreviewed: {
        type: Schema.Types.ObjectId,
        ref: "Book",
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment: {
        type: String,
        trim: true
    }
}, { timestamps: true })

export const Review = mongoose.model("Review", reviewSchema)