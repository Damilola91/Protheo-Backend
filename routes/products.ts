import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getPaginatedProducts,
  filterProducts,
} from "../controllers/productController";
import { validateProduct } from "../middlewares/validateProduct";
import { verifyToken, authorizeAdmin } from "../middlewares/authGuard";

const products = Router();

products.get("/list", getAllProducts);
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

export default products;
