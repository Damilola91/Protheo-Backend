import { Request, Response, NextFunction } from "express";
import Product from "../models/ProductModel";
import { createError } from "../utils/createError";

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.create(req.body);
    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await Product.find();
    if (!products.length) {
      return next(createError(404, "No products found"));
    }

    return res.status(200).json({
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return next(createError(404, "Product not found"));
    }

    return res.status(200).json({ product });
  } catch (err) {
    next(createError(400, "Invalid productId format"));
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.productId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return next(createError(404, "Product not found"));
    }

    return res.status(200).json({
      message: "Product updated successfully",
      product: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.productId);
    if (!deleted) {
      return next(createError(404, "Product not found"));
    }

    return res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const getPaginatedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments();
    const products = await Product.find().skip(skip).limit(limit);

    return res.status(200).json({
      total,
      page,
      pages: Math.ceil(total / limit),
      amount: products.length,
      products,
    });
  } catch (err) {
    next(err);
  }
};

export const filterProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filter: any = {};

    // FILTRI BASE DIRETTI
    if (req.query.name) filter.name = { $regex: req.query.name, $options: "i" };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.technology) filter.technology = req.query.technology;

    // PREZZO
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    // FEATURES (search inside array)
    if (req.query.feature) {
      filter["features.name"] = { $regex: req.query.feature, $options: "i" };
    }

    // COMPOSITION element
    if (req.query.element) {
      filter["composition.element"] = {
        $regex: req.query.element,
        $options: "i",
      };
    }

    // DOSAGE CROP
    if (req.query.crop) {
      filter["dosage.crop"] = { $regex: req.query.crop, $options: "i" };
    }

    // PACKAGING
    if (req.query.packageType) {
      filter["packaging.type"] = req.query.packageType;
    }

    // ORDINAMENTO → sort=price (asc) | -price (desc)
    const sort = req.query.sort
      ? String(req.query.sort).replace("-", "")
      : "createdAt";
    const order = String(req.query.sort || "").includes("-") ? -1 : 1;

    const results = await Product.find(filter).sort({ [sort]: order });

    if (!results.length)
      return res.status(404).json({ message: "No products match filters" });

    res.status(200).json({
      filtersUsed: req.query,
      total: results.length,
      products: results,
    });
  } catch (err) {
    next(err);
  }
};

export const uploadProductImage = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const file = req.file as any; // Cloudinary + multer
    return res.status(200).json({
      message: "Image uploaded successfully",
      url: file.path, // URL cloudinary
      public_id: file.filename || file.public_id,
    });
  } catch (err) {
    next(err);
  }
};

export const uploadProductImages = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ message: "No files provided" });
    }

    const files = req.files as any[];
    const urls = files.map((f) => ({
      url: f.path,
      public_id: f.filename || f.public_id,
    }));

    return res.status(200).json({
      message: "Images uploaded successfully",
      files: urls,
    });
  } catch (err) {
    next(err);
  }
};
