import { Request, Response, NextFunction } from "express";
import { createError } from "../utils/createError";
import { allowedUnits, allowedPackagingTypes } from "../models/ProductModel";

// Utility → controlla se un valore esiste
const isDefined = (v: any) => v !== undefined && v !== null;

export const validateProduct = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const errors: string[] = [];
  const { name, image, features, composition, dosage, packaging } = req.body;

  const isCreate = req.method === "POST";
  const isUpdate = req.method === "PATCH";

  // 🚫 1. BYPASS su rotte di DUPLICAZIONE → Niente validazione

  if (req.path.includes("duplicate")) {
    return next();
  }

  // 🚫 2. BYPASS se il body è completamente vuoto (PATCH senza body)

  if (Object.keys(req.body).length === 0) {
    return next();
  }

  // 🔹 CREATE PRODUCT (name + image obbligatori)

  if (isCreate) {
    if (!name || typeof name !== "string" || !name.trim()) {
      errors.push("Product name is required.");
    }

    if (!image || typeof image !== "string" || !image.trim()) {
      errors.push("Product image is required.");
    }
  }

  // 🔹 UPDATE PRODUCT (solo se il campo esiste)

  if (isUpdate) {
    if (isDefined(name) && (typeof name !== "string" || !name.trim())) {
      errors.push("If provided, name must be a valid non-empty string.");
    }

    if (isDefined(image) && (typeof image !== "string" || !image.trim())) {
      errors.push("If provided, image must be a valid URL string.");
    }
  }

  // 🔹 FEATURES

  if (isDefined(features)) {
    if (!Array.isArray(features)) {
      errors.push("Features must be an array.");
    } else {
      features.forEach((f, index) => {
        if (!f || typeof f.name !== "string" || !f.name.trim()) {
          errors.push(`features[${index}].name must be a non-empty string`);
        }
        if (isDefined(f.iconUrl) && typeof f.iconUrl !== "string") {
          errors.push(`features[${index}].iconUrl must be a string`);
        }
        if (isDefined(f.description) && typeof f.description !== "string") {
          errors.push(`features[${index}].description must be a string`);
        }
      });
    }
  }

  // 🔹 COMPOSITION

  if (isDefined(composition)) {
    if (!Array.isArray(composition)) {
      errors.push("Composition must be an array.");
    } else {
      composition.forEach((c, index) => {
        if (!isDefined(c.element) || typeof c.element !== "string") {
          errors.push(`composition[${index}].element must be a string`);
        }
        if (!isDefined(c.percentage) || typeof c.percentage !== "number") {
          errors.push(`composition[${index}].percentage must be a number`);
        }
      });
    }
  }

  // 🔹 DOSAGE

  if (isDefined(dosage)) {
    if (!Array.isArray(dosage)) {
      errors.push("Dosage must be an array.");
    } else {
      dosage.forEach((d, index) => {
        if (!d.crop || typeof d.crop !== "string") {
          errors.push(`dosage[${index}].crop must be a string`);
        }
        if (!isDefined(d.min) || typeof d.min !== "number") {
          errors.push(`dosage[${index}].min must be a number`);
        }
        if (!isDefined(d.max) || typeof d.max !== "number") {
          errors.push(`dosage[${index}].max must be a number`);
        }
        if (!allowedUnits.includes(d.unit)) {
          errors.push(
            `dosage[${index}].unit must be one of: ${allowedUnits.join(" / ")}`
          );
        }
        if (
          isDefined(d.application) &&
          !["foliar", "fertigation", "soil", "universal"].includes(
            d.application
          )
        ) {
          errors.push(
            `dosage[${index}].application must be foliar / fertigation / soil / universal`
          );
        }
      });
    }
  }

  //  PACKAGING

  if (isDefined(packaging)) {
    if (!Array.isArray(packaging)) {
      errors.push("Packaging must be an array.");
    } else {
      packaging.forEach((p, index) => {
        if (!allowedPackagingTypes.includes(p.type)) {
          errors.push(
            `packaging[${index}].type must be: ${allowedPackagingTypes.join(
              " / "
            )}`
          );
        }

        if (isDefined(p.weight) && typeof p.weight !== "number") {
          errors.push(`packaging[${index}].weight must be a number`);
        }
        if (isDefined(p.volume) && typeof p.volume !== "number") {
          errors.push(`packaging[${index}].volume must be a number`);
        }
        if (isDefined(p.ecoFriendly) && typeof p.ecoFriendly !== "boolean") {
          errors.push(`packaging[${index}].ecoFriendly must be a boolean`);
        }
      });
    }
  }

  if (errors.length > 0) {
    return next(createError(400, "Product validation failed", errors));
  }

  next();
};
