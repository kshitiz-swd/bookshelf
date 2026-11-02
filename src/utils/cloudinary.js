import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
    api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET
});

export const uploadOnCloudinary = async (localFilePath) => {
    try {
        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log(result.url);
        fs.unlinkSync(localFilePath)
        return result

    } catch (error) {
        fs.unlinkSync(localFilePath)
        throw new Error(error.message)
    }
}

export const deleteOnCloudinary = async (publicId) => {
    try {
        cloudinary.uploader.destroy(publicId, {
            resource_type: "auto"
        })
    } catch (error) {
        return null
    }
}