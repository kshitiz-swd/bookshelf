import mongoose, { isValidObjectId } from "mongoose";
import { Book } from "../models/book.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { Review } from "../models/review.model.js"

const addNewBook = asyncHandler(async (req, res) => {
    //check if the book already exists
    //cehck for the coverImage
    //

    const { name, description, author, genre, publishedYear, isPublished } = req.body
    if (
        [name, description, author, genre].some((field) =>
            field.trim() === ""
        )
    )
        throw new Error(400, "Please enter required fields!!")

    const existingBook = await Book.findOne({ name })

    if (existingBook)
        throw new Error("Book with this name already exists!!")

    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath)
        throw new Error("Cover image not provided!!")

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!coverImage)
        throw new Error(400, "Cover image not required!!")

    const book = await Book.create({
        name,
        description,
        author,
        genre,
        publishedYear,
        isPublished,
        coverImage: coverImage.url,
        coverImagePublicId: coverImage.public_id,
        addedBy: req.user._id

    })

    res.status(200).json({
        book: book,
        message: "User created successfully!!"
    })
})

const getAllBooks = asyncHandler(async (req, res) => {
    //sort
    //send all the books in the data
    //use pagination
    //use limit
    const { page, limit, query, genre, sortBy, sortType } = req.query

    let allowedSortFields = ['createdAt', "title", "publishedYear"]

    const matchStage = {
        isPublished: true
    }

    if (query) {
        let trimQuery = query.trim()
        matchStage.$or = [
            { name: { $regex: trimQuery, $options: "i" } },
            { author: { $regex: trimQuery, $options: "i" } }
        ]
    }
    if (genre)
        matchStage.genre = genre.trim()


    const sortDirection = sortType === "asc" ? 1 : -1

    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt"
    const sortStage = { [sortField]: sortDirection }
    console.log(matchStage);
    console.log(sortStage);

    const aggregate = await Book.aggregate([
        { $match: matchStage },
        { $sort: sortStage }
    ])

    console.log(aggregate);

    res.send('hi')
})

const getBook = asyncHandler(async (req, res) => {
    const { bookId } = req.params
    console.log(bookId);

    if (!isValidObjectId(bookId))
        throw new Error("Invalid object id")



    const existingBook = await Book.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(bookId) }
        },
        {
            $lookup: {
                from: "users",
                localField: "addedBy",
                foreignField: "_id",
                as: "addedBy",
                pipeline: [
                    {
                        $project: {
                            userName: 1,
                            name: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "reviews",
                localField: "_id",
                foreignField: "bookreviewed",
                as: "reviews",
                pipeline: [{
                    $lookup: {
                        from: "users",
                        localField: "reviewedBy",
                        foreignField: "_id",
                        as: "reviewedBy",
                        pipeline: [{
                            $project: {
                                userName: 1,
                                name: 1,
                                avatar: 1
                            }
                        }]

                    }
                }]
            }
        }, {
            $project: {
                rating: 1,
                comment: 1,
                reviewedBy,
                createdAt: 1
            }
        },
        { $sort: { createdAt: -1 } },
        {
            $addFields: {
                totalReviews: {
                    $size: "$reviews"
                },
                addedBy: {
                    $first: "$addedBy"
                },
                averageRating: {
                    $round: [{ $ifNull: [{ $avg: "$reviews.rating" }, 0] }, 1]
                }
            }
        }
    ])


    if (!existingBook.length)
        throw new Error("Book not found!!")

    res.status(200).json({ book: existingBook, message: "Book fetched successfully" })
})

const addReview = asyncHandler(async (req, res) => {
    //take bookid from params
    //take rating and comment
    //if not rating error
    //check for the book
    //add the review

    const { bookId } = req.params
    const { rating, comment } = req.body

    if (!isValidObjectId(bookId)) throw new Error("Invalid book Id!!")

    const ratingNumber = Number(rating)
    if (!ratingNumber || ratingNumber < 1 || ratingNumber > 5)
        throw new Error("Rating must be a whole number from 1 to 5!!")

    const exisitngBook = await Book.findById(bookId)

    if (!exisitngBook) throw new Error("Cannot find the book!!")

    if (!exisitngBook.isPublished)
        throw new Error("Cannot review unpublished book!!")

    const isBookReview = await Review.findOne({
        reviewedBy: req.user._id,
        bookreviewed: exisitngBook._id
    });

    if (isBookReview) throw new Error("The book has already been reviewed!!")

    const newReview = await Review.create({
        reviewedBy: req.user._id,
        bookreviewed: exisitngBook._id,
        rating: ratingNumber,
        comment: comment.trim()
    })

    return res.status(200).json({ review: newReview, message: "Review Added sucessfully!" })
})

const editBook = asyncHandler(async (req, res) => {
    //take the book id
    //check if exist or not
    //take the specific field allowed fields only
    //optional cover iamge update
    //update public id
    const { bookId } = req.params

    const { name, author, description, genre, publishedYear } = req.body

    if (!isValidObjectId(bookId))
        throw new Error("Invalid Book Id!!")

    const exisitingBook = await Book.findById(bookId)

    if (!exisitingBook) throw new Error("Cannot find the book!!")

    if (req.user._id.toString() !== exisitingBook.addedBy.toString())
        throw new Error("Cannot edit !!")

    const updates = {}
    if (name !== undefined) updates.name = name.trim()

    if (author !== undefined) updates.author = author.trim()

    if (description !== undefined) updates.description = description.trim()

    if (genre !== undefined) updates.genre = genre.trim()

    if (publishedYear !== undefined) {
        const year = parseInt(publishedYear)
        if (!Number.isFinite(year))
            throw new ApiError(400, "Published year must be a number")
        updates.publishedYear = year
    }

    if (Object.keys(updates).length === 0 && !req.file)
        throw new ApiError(400, "Nothing to update")

    const coverImageLocalPath = req.file?.path
    const oldCoverImage = exisitingBook.coverImagePublicId
    let coverImage
    if (coverImageLocalPath) {
        coverImage = await uploadOnCloudinary(coverImageLocalPath)

        if (!coverImage?.url)
            throw new ApiError(500, "Cover upload failed")

        updates.coverImage = coverImage.url
        updates.coverImagePublicId = coverImage.public_id
    }


    const updatedBook = await Book.findByIdAndUpdate(
        {
            _id: exisitingBook._id
        }, {
        $set: updates
    }, { new: true, runValidators: true })

    if (!updatedBook) throw new Error("Book not found")

    if (coverImageLocalPath && oldCoverImage)
        await deleteOnCloudinary(oldCoverImage)


    res.status(200).json({ message: "Book info updated successfully!!", book: updatedBook })
})

export { addNewBook, getAllBooks, getBook, addReview, editBook }