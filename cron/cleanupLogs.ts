import cron from "node-cron";
import ActivityLog from "../models/ActivityLogModel";

export const startActivityLogCleanupCron = () => {
  // Abilita/disabilita da .env
  if (process.env.ENABLE_CRON !== "true") {
    console.log("⛔ CRON DISABLED (ENABLE_CRON != true)");
    return;
  }

  const retention = Number(process.env.LOG_RETENTION_DAYS) || 180;

  console.log(
    `⏳ CRON SCHEDULED: cleanup ogni mese — retention: ${retention} giorni`
  );

  // Ogni 1° del mese alle 02:00
  cron.schedule("0 2 1 * *", async () => {
    try {
      const cutoff = new Date(Date.now() - retention * 24 * 60 * 60 * 1000);

      console.log("🧪 DRY RUN CLEANUP STARTED (cron)");

      const toDelete = await ActivityLog.find({
        createdAt: { $lte: cutoff },
      }).countDocuments();

      console.log(`🧹 Dry run: ${toDelete} logs older than ${retention} days.`);

      if (toDelete === 0) {
        console.log("✔ Nessun log da cancellare.");
        return;
      }

      // Esegui cleanup
      const deleted = await ActivityLog.deleteMany({
        createdAt: { $lte: cutoff },
      });

      console.log(`🧹 CLEANUP EXECUTED → Deleted ${deleted.deletedCount} logs`);
    } catch (error) {
      console.error("🔥 CRON ERROR:", error);
    }
  });
};
