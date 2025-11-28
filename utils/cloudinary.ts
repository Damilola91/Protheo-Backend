import { v2 as cloudinary, ConfigOptions } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import type { Request } from "express";

interface MulterUploadedFile {
  mimetype: string;
  originalname: string;
}

// Config Cloudinary
cloudinary.config(<ConfigOptions>{
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage Cloudinary
const cloudStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req: Request, file: MulterUploadedFile) => {
    const isImage = file.mimetype.startsWith("image/");
    const isVideo = file.mimetype.startsWith("video/");

    if (!isImage && !isVideo) {
      throw new Error("File not supported — only images & videos allowed");
    }

    return {
      folder: "PROTHEO",
      resource_type: isVideo ? "video" : "image",
      public_id: file.originalname.split(".")[0],
      allowed_formats: [
        "jpg",
        "png",
        "jpeg",
        "webp",
        "gif",
        "mp4",
        "mov",
        "avi",
        "hevc",
        "avif",
      ],
    };
  },
});

export const upload = multer({ storage: cloudStorage });

export const uploadSingle = upload.single("file");
export const uploadMultiple = upload.array("files", 10);
