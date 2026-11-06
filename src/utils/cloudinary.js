import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
    api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET
});

export const removeLocalFile = (localFilePath) => {
    if (localFilePath && fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath)
}

export const uploadOnCloudinary = async (localFilePath) => {
    if (!localFilePath) return null
    try {
        return await cloudinary.uploader.upload(localFilePath, {
            resource_type: "image"
        })
    } catch (error) {

        console.error("Cloudinary upload failed:", error.message)
        return null
    } finally {
        removeLocalFile(localFilePath)
    }
}

export const deleteOnCloudinary = async (publicId) => {
    if (!publicId) return null
    try {
        return await cloudinary.uploader.destroy(publicId, {
            resource_type: "image"
        })
    } catch (error) {
        console.error("Cloudinary delete failed:", error.message)
        return null
    }
}