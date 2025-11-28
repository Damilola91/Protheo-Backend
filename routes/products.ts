import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getPaginatedProducts,
  filterProducts,
  uploadProductImage,
  uploadProductImages,
  publishProduct,
  unpublishProduct,
  getPublishedProducts,
} from "../controllers/productController";
import { validateProduct } from "../middlewares/validateProduct";
import { verifyToken, authorizeAdmin } from "../middlewares/authGuard";
import { uploadSingle, uploadMultiple } from "../utils/cloudinary";

const products = Router();

products.get("/list", getAllProducts);

products.get("/published", getPublishedProducts);

products.get("/details/:productId", getProductById);

products.get("/paginated", getPaginatedProducts);

products.get("/filter", filterProducts);

products.post(
  "/create",
  verifyToken,
  authorizeAdmin,
  validateProduct,
  createProduct
);

products.patch(
  "/update/:productId",
  verifyToken,
  authorizeAdmin,
  validateProduct,
  updateProduct
);

products.delete(
  "/delete/:productId",
  verifyToken,
  authorizeAdmin,
  deleteProduct
);

// CMS ACCESS — only admin
products.patch(
  "/publish/:productId",
  verifyToken,
  authorizeAdmin,
  publishProduct
);
products.patch(
  "/unpublish/:productId",
  verifyToken,
  authorizeAdmin,
  unpublishProduct
);

products.post("/upload-image", uploadSingle, uploadProductImage);
products.post("/upload-images", uploadMultiple, uploadProductImages);

export default products;
