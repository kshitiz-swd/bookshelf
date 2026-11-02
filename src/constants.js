export const DB_NAME = 'bookshelf'

// post/books
// get/books
// GET /books/:bookId
// POST /reviews/:bookId
// GET /users/profile/:username
// POST /follows/toggle/:userId
// PATCH /books/:bookId




// 5. PATCH /books/:bookId

// Tests: the ownership check (403 vs 404), partial updates with $set, an optional new cover, deleting the old cover from Cloudinary only after the new upload succeeds, { new: true }.
// Edge cases: an empty body gives 400, someone else’s book gives 403.
// Later: Zod schema, logging who changed what.



// 6. POST /reviews/:bookId

// Tests: checking the parent exists, a compound unique index on { book, owner }, catching duplicate key error 11000 and returning 409, rating limited to 1 to 5 in the schema.
// Edge cases: a second review on the same book gives 409, reviewing your own book gives 403 (your rule to decide).
// Later: Zod validation, a BullMQ job to notify the book’s owner.

// 7. POST /follows/toggle/:userId

// Tests: the toggle pattern (findOne, then delete or create), returning which state you ended in, blocking self-follow.
// Edge cases: following yourself gives 400, a missing user gives 404.
// Later: rate limiting, tests for both toggle paths.

// 8. GET /users/profile/:username

// Tests: the course’s big channel aggregation on a new domain. Two $lookups on follows, followersCount and followingCount with $size, isFollowing with $cond and $in, booksAdded and reviewsWritten via more lookups, then $project to hide private fields.
// Edge cases: an unknown username gives 404, viewing your own profile still works.
// Later: Redis caching, Swagger docs.