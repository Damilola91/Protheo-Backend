import { Request, Response, NextFunction } from "express";
import ActivityLogModel from "../models/ActivityLogModel";
import { createError } from "../utils/createError";

export const getActivityLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};

    // 🧪 Filtri Admin CMS
    if (req.query.action) filter.action = req.query.action; // es. UPDATE_PRODUCT
    if (req.query.userId) filter.userId = req.query.userId; // log filtrati per utente
    if (req.query.productId) filter.productId = req.query.productId;

    // Intervallo date
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from)
        filter.createdAt.$gte = new Date(String(req.query.from));
      if (req.query.to) filter.createdAt.$lte = new Date(String(req.query.to));
    }

    const total = await ActivityLogModel.countDocuments(filter);
    const logs = await ActivityLogModel.find(filter)
      .sort({ createdAt: -1 }) // Mostra prima i più recenti (UX migliore)
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email role") // 🔥 Info utili nel CMS
      .populate("productId", "name image"); // 🔥 titolo e immagine prodotto

    return res.status(200).json({
      total,
      page,
      pages: Math.ceil(total / limit),
      logs,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteActivityLog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deleted = await ActivityLogModel.findByIdAndDelete(req.params.logId);

    if (!deleted) return next(createError(404, "Activity log not found"));

    return res.status(200).json({
      message: "Activity log successfully deleted",
      deleted,
    });
  } catch (err) {
    next(createError(400, "Invalid logId format"));
  }
};

export const deleteOldActivityLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const olderThanDays = req.query.olderThanDays
      ? Number(req.query.olderThanDays)
      : 30;

    if (Number.isNaN(olderThanDays) || olderThanDays <= 0) {
      return next(
        createError(
          400,
          "olderThanDays must be a positive number of days, e.g. 30"
        )
      );
    }

    const now = Date.now();
    const thresholdDate = new Date(now - olderThanDays * 24 * 60 * 60 * 1000);

    const result = await ActivityLogModel.deleteMany({
      createdAt: { $lt: thresholdDate },
    });

    return res.status(200).json({
      message: "Old activity logs deleted successfully",
      olderThanDays,
      deletedCount: result.deletedCount,
      beforeDate: thresholdDate,
    });
  } catch (err) {
    next(err);
  }
};

export const exportActivityLogsCSV = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filter: any = {};

    // Filtri opzionali
    if (req.query.action) filter.action = req.query.action;
    if (req.query.userId) filter.userId = req.query.userId;
    if (req.query.productId) filter.productId = req.query.productId;

    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from)
        filter.createdAt.$gte = new Date(String(req.query.from));
      if (req.query.to) filter.createdAt.$lte = new Date(String(req.query.to));
    }

    const logs = await ActivityLogModel.find(filter)
      .populate("userId", "name email role") // 🔥 user completo
      .populate("productId", "name image"); // 🔥 info prodotto

    if (!logs.length) return next(createError(404, "No logs found for export"));

    // HEADER CSV
    let csv = "Action,User Name,User Email,Product Name,Product ID,Date\n";

    const toCSV = (log: any) => {
      const user = log.userId || {};
      const product = log.productId || {};

      return [
        log.action,
        user.name ?? "",
        user.email ?? "",
        product.name ?? "",
        product._id ?? log.productId ?? "",
        log.createdAt,
      ].join(",");
    };

    csv += logs.map(toCSV).join("\n");

    // Response con download del CSV
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=activity-logs.csv"
    );

    return res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
};
