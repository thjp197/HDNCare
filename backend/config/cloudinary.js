import {v2 as cloudinary} from 'cloudinary'

const connectCloudinary = () => {
    const cloudName =
        process.env.CLOUDINARY_NAME || process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret =
        process.env.CLOUDINARY_SECRET_KEY || process.env.CLOUDINARY_API_SECRET

    const missingVariables = [
        !cloudName && 'CLOUDINARY_NAME',
        !apiKey && 'CLOUDINARY_API_KEY',
        !apiSecret && 'CLOUDINARY_SECRET_KEY'
    ].filter(Boolean)

    if (missingVariables.length > 0) {
        throw new Error(
            `Missing Cloudinary environment variables: ${missingVariables.join(', ')}`
        )
    }

    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret
    })
}

export default connectCloudinary;