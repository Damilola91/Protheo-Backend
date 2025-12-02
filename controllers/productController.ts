import { Request, Response, NextFunction } from "express";
import Product from "../models/ProductModel";
import { createError } from "../utils/createError";
import { logActivity } from "../utils/logActivity";

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.create(req.body);

    await logActivity({
      action: "CREATE_PRODUCT",
      userId: (req as any).user.id,
      productId: product._id,
    });

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
    if (!products.length) return next(createError(404, "No products found"));

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
    if (!product) return next(createError(404, "Product not found"));

    return res.status(200).json({ product });
  } catch {
    next(createError(400, "Invalid productId format"));
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = req.params.productId;

    const before = await Product.findById(productId).lean();
    if (!before) return next(createError(404, "Product not found"));

    // Cast per poter usare indicizzazione dinamica
    const beforeObj = before as Record<string, any>;
    const updateData: Record<string, any> = { ...req.body };

    // ---------------------------
    // 🔥 RENAME INTELLIGENTE
    // ---------------------------
    if (updateData.name && updateData.name !== beforeObj.name) {
      const baseName = updateData.name.trim();
      const escaped = escapeRegex(baseName);
      const regex = new RegExp(`^${escaped}( \\(\\d+\\))?$`, "i");

      const conflicts = await Product.find({
        name: regex,
        _id: { $ne: productId },
      }).lean();

      if (conflicts.length > 0) {
        const nums = conflicts
          .map((p) => {
            const m = p.name.match(/\((\\d+)\)$/);
            return m ? Number(m[1]) : 1;
          })
          .sort((a, b) => b - a);

        const nextNum = nums[0] + 1;
        updateData.name = `${baseName} (${nextNum})`;
      }
    }
    //  UPDATE DATABASE
    const updated = await Product.findByIdAndUpdate(productId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return next(createError(404, "Product not found after update"));
    }

    const updatedObj = (
      updated.toObject ? updated.toObject() : updated
    ) as Record<string, any>;

    // LOG DELLA DIFFERENZA (solo campi realmente cambiati)

    const changes: Record<string, any> = {};

    for (const key of Object.keys(updateData)) {
      if (beforeObj[key] !== updatedObj[key]) {
        changes[key] = {
          before: beforeObj[key],
          after: updatedObj[key],
        };
      }
    }

    await logActivity({
      action: "UPDATE_PRODUCT",
      userId: (req as any).user.id,
      productId, // va bene come string, il tipo lo accetta
      changes,
    });

    return res.status(200).json({
      message: "Product updated successfully",
      product: updated,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE PRODUCT

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.productId);
    if (!deleted) return next(createError(404, "Product not found"));

    await logActivity({
      action: "DELETE_PRODUCT",
      userId: (req as any).user.id,
      productId: deleted._id,
    });

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// PAGINATION

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
      count: products.length,
      products,
    });
  } catch (err) {
    next(err);
  }
};

// FILTER PRODUCTS

export const filterProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filter: any = {};

    if (req.query.name) filter.name = { $regex: req.query.name, $options: "i" };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.technology) filter.technology = req.query.technology;

    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    if (req.query.feature)
      filter["features.name"] = { $regex: req.query.feature, $options: "i" };

    if (req.query.element)
      filter["composition.element"] = {
        $regex: req.query.element,
        $options: "i",
      };

    if (req.query.crop)
      filter["dosage.crop"] = { $regex: req.query.crop, $options: "i" };

    if (req.query.packageType) filter["packaging.type"] = req.query.packageType;

    const sortField = (req.query.sort as string) || "createdAt";
    const sortOrder = sortField.startsWith("-") ? -1 : 1;
    const sanitizedSort = sortField.replace("-", "");

    const results = await Product.find(filter).sort({
      [sanitizedSort]: sortOrder,
    });

    if (!results.length)
      return res.status(404).json({ message: "No products match filters" });

    return res.status(200).json({
      filtersUsed: req.query,
      total: results.length,
      products: results,
    });
  } catch (err) {
    next(err);
  }
};

// PUBLISH PRODUCT

export const publishProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      {
        isPublished: true,
        publishedAt: new Date(),
        lastEditedBy: (req as any).user.id,
      },
      { new: true }
    );

    if (!product) return next(createError(404, "Product not found"));

    await logActivity({
      action: "PUBLISH_PRODUCT",
      userId: (req as any).user.id,
      productId: product._id,
    });

    res.status(200).json({ message: "Product published", product });
  } catch (err) {
    next(err);
  }
};

// UNPUBLISH PRODUCT

export const unpublishProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      { isPublished: false, lastEditedBy: (req as any).user.id },
      { new: true }
    );

    if (!product) return next(createError(404, "Product not found"));

    await logActivity({
      action: "UNPUBLISH_PRODUCT",
      userId: (req as any).user.id,
      productId: product._id,
    });

    res.status(200).json({ message: "Product unpublished", product });
  } catch (err) {
    next(err);
  }
};

// UPLOAD SINGLE IMAGE

export const uploadProductImage = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file provided" });

    const file = req.file as any;

    return res.status(200).json({
      message: "Image uploaded successfully",
      url: file.path,
      public_id: file.filename || file.public_id,
    });
  } catch (err) {
    next(err);
  }
};

// UPLOAD MULTIPLE IMAGES

export const uploadProductImages = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.files || !Array.isArray(req.files))
      return res.status(400).json({ message: "No files provided" });

    const files = (req.files as any[]).map((f) => ({
      url: f.path,
      public_id: f.filename || f.public_id,
    }));

    return res.status(200).json({ message: "Images uploaded", files });
  } catch (err) {
    next(err);
  }
};

// GET PUBLISHED PRODUCTS

export const getPublishedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await Product.find({ isPublished: true });

    if (!products.length)
      return next(createError(404, "No published products found"));

    return res.status(200).json({
      count: products.length,
      products,
    });
  } catch (err) {
    next(err);
  }
};

// DUPLICATE PRODUCT (già perfetto)

export const duplicateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const original = await Product.findById(req.params.productId);
    if (!original) return next(createError(404, "Product not found"));

    const baseName = original.name;
    const escapedBase = escapeRegex(baseName);
    const regex = new RegExp(`^${escapedBase} \\(Copy( \\d+)?\\)$`, "i");

    const copies = await Product.find({ name: regex }).lean();

    let newName = `${baseName} (Copy)`;

    if (copies.length > 0) {
      const numbers = copies
        .map((c) => {
          const match = c.name.match(/\(Copy(?: (\d+))?\)$/);
          return match && match[1] ? Number(match[1]) : 1;
        })
        .sort((a, b) => b - a);

      const nextNumber = numbers[0] + 1;
      newName = `${baseName} (Copy ${nextNumber})`;
    }

    const data = original.toObject();
    delete data._id;
    delete data.createdAt;
    delete data.updatedAt;

    const duplicated = await Product.create({
      ...data,
      name: newName,
      isPublished: false,
      publishedAt: null,
      lastEditedBy: (req as any).user.id,
    });

    await logActivity({
      action: "DUPLICATE_PRODUCT",
      userId: (req as any).user.id,
      productId: duplicated._id,
      changes: { from: original._id },
    });

    return res.status(201).json({
      message: "Product duplicated successfully",
      product: duplicated,
    });
  } catch (err) {
    next(err);
  }
};
