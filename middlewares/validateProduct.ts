import { Request, Response, NextFunction } from "express";
import { createError } from "../utils/createError";
import { allowedUnits, allowedPackagingTypes } from "../models/ProductModel";

export const validateProduct = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors: string[] = [];
  const { name, image, features, composition, dosage, packaging } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    errors.push("Product name is required and must be a non-empty string");
  }

  if (!image || typeof image !== "string" || !image.trim()) {
    errors.push("Product image is required and must be a non-empty string URL");
  }

  if (composition && Array.isArray(composition)) {
    composition.forEach((c, index) => {
      if (!c.element || typeof c.element !== "string") {
        errors.push(
          `composition[${index}].element is required and must be a string.`
        );
      }
      if (typeof c.percentage !== "number") {
        errors.push(`composition[${index}].percentage must be a number.`);
      }
    });
  }
  // DOSAGE (opzionale)
  if (dosage && Array.isArray(dosage)) {
    dosage.forEach((d, index) => {
      if (!d.crop || typeof d.crop !== "string") {
        errors.push(`dosage[${index}].crop is required and must be a string.`);
      }
      if (typeof d.min !== "number" || typeof d.max !== "number") {
        errors.push(`dosage[${index}].min and max must be numbers.`);
      }
      if (!d.unit || !allowedUnits.includes(d.unit)) {
        errors.push(
          `dosage[${index}].unit must be one of: ${allowedUnits.join(", ")}.`
        );
      }
    });
  }

  // PACKAGING (opzionale)
  if (packaging && Array.isArray(packaging)) {
    packaging.forEach((p, index) => {
      if (!p.type || !allowedPackagingTypes.includes(p.type)) {
        errors.push(
          `packaging[${index}].type must be one of: ${allowedPackagingTypes.join(
            ", "
          )}.`
        );
      }
      if (p.weight !== undefined && typeof p.weight !== "number") {
        errors.push(`packaging[${index}].weight must be a number if provided.`);
      }
      if (p.volume !== undefined && typeof p.volume !== "number") {
        errors.push(`packaging[${index}].volume must be a number if provided.`);
      }
    });
  }

  if (errors.length > 0) {
    return next(createError(400, "Product validation failed", errors));
  }

  next();
};
