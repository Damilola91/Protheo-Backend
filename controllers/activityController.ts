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

//  DRY RUN — mostra quali log verrebbero cancellati
export const dryRunCleanup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const days = Number(req.query.olderThan) || 180;

    if (Number.isNaN(days) || days < 7) {
      return next(createError(400, "olderThan must be a number >= 7"));
    }

    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const logs = await ActivityLogModel.find({
      createdAt: { $lte: cutoff },
    })
      .sort({ createdAt: -1 })
      .populate("userId", "name email")
      .populate("productId", "name image")
      .lean();

    return res.status(200).json({
      mode: "dryRun",
      olderThanDays: days,
      cutoffDate: cutoff,
      totalToDelete: logs.length,
      logs,
    });
  } catch (err) {
    next(err);
  }
};

//  EXECUTE — elimina davvero i log vecchi
export const cleanupOldLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const days = Number(req.query.olderThan) || 180;

    if (Number.isNaN(days) || days < 7) {
      return next(createError(400, "olderThan must be a number >= 7"));
    }

    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const deleted = await ActivityLogModel.deleteMany({
      createdAt: { $lte: cutoff },
    });

    return res.status(200).json({
      mode: "execute",
      olderThanDays: days,
      cutoffDate: cutoff,
      deletedCount: deleted.deletedCount,
      message: `Successfully deleted ${deleted.deletedCount} logs older than ${days} days.`,
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
