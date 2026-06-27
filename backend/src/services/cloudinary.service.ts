import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.config";

const config = {
  avatar: {
    folder: "users/avatars",
    resource_type: "image",
  },
  image: {
    folder: "messages/images",
    resource_type: "image",
  },
  gif: {
    folder: "messages/gifs",
    resource_type: "image",
  },
  sticker: {
    folder: "messages/stickers",
    resource_type: "image",
  },
  video: {
    folder: "messages/videos",
    resource_type: "video",
  },
  audio: {
    folder: "messages/audio",
    resource_type: "video",
  },
  file: {
    folder: "messages/files",
    resource_type: "raw",
  },
} as const;

type uploadType = keyof typeof config;

interface uploadOptions {
  folder: string;
  resourceType?: "image" | "video" | "raw" | "auto";
}
export const uploadToCloudinary = (
  file: Express.Multer.File,
  type: uploadType = "image",
): Promise<{
  secure_url: string;
  public_id: string;
}> => {
  return new Promise((resolve, reject) => {
    const options = config[type] as uploadOptions;

    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        console.log("result", result);
        if (error || !result) {
          return reject(error);
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      },
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};
export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image",
) => {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
};
