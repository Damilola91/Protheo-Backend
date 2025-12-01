import { Request, Response, NextFunction } from "express";
import { createError } from "../utils/createError";
import { allowedUnits, allowedPackagingTypes } from "../models/ProductModel";

export const validateProduct = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const errors: string[] = [];
  const { name, image, features, composition, dosage, packaging } = req.body;

  /** 📌 CREATE → name + image OBBLIGATORI */
  if (req.method === "POST") {
    if (!name || typeof name !== "string" || !name.trim())
      errors.push("Product name is required.");

    if (!image || typeof image !== "string" || !image.trim())
      errors.push("Product image is required.");
  }

  /** 📌 UPDATE → validiamo SOLO se i campi esistono */
  if (req.method === "PATCH") {
    if (name !== undefined && (typeof name !== "string" || !name.trim()))
      errors.push("If provided, name must be a valid string.");

    if (image !== undefined && (typeof image !== "string" || !image.trim()))
      errors.push("If provided, image must be a valid URL string.");
  }

  /** FEATURES */
  if (features) {
    if (!Array.isArray(features)) errors.push("Features must be an array.");
    else
      features.forEach((f, index) => {
        if (!f.name || typeof f.name !== "string")
          errors.push(`features[${index}].name must be a string`);
      });
  }

  /** COMPOSITION */
  if (composition) {
    if (!Array.isArray(composition)) errors.push("Composition must be array.");
    else
      composition.forEach((c, index) => {
        if (!c.element || typeof c.element !== "string")
          errors.push(`composition[${index}].element is required`);
        if (typeof c.percentage !== "number")
          errors.push(`composition[${index}].percentage must be number`);
      });
  }

  /** DOSAGE */
  if (dosage) {
    if (!Array.isArray(dosage)) errors.push("Dosage must be an array.");
    else
      dosage.forEach((d, index) => {
        if (!d.crop || typeof d.crop !== "string")
          errors.push(`dosage[${index}].crop must be a string`);
        if (typeof d.min !== "number" || typeof d.max !== "number")
          errors.push(`dosage[${index}].min/max must be numbers`);
        if (!allowedUnits.includes(d.unit))
          errors.push(
            `dosage[${index}].unit must be ${allowedUnits.join(" / ")}`
          );
      });
  }

  /** PACKAGING */
  if (packaging) {
    if (!Array.isArray(packaging)) errors.push("Packaging must be an array.");
    else
      packaging.forEach((p, index) => {
        if (!allowedPackagingTypes.includes(p.type))
          errors.push(
            `packaging[${index}].type must be ${allowedPackagingTypes.join(
              " / "
            )}`
          );
      });
  }

  if (errors.length > 0)
    return next(createError(400, "Product validation failed", errors));

  next();
};
