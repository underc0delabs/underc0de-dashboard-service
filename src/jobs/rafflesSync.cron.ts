import cron from "node-cron";
import { DependencyManager } from "../dependencyManager.js";
import { runRafflesSync } from "./runRafflesSync.js";

const logRafflesSyncResult = (result: { processed: number; updated: number }) => {
  console.info(
    `[RAFFLES SYNC] processed=${result.processed} updated=${result.updated}`,
  );
};

export function startRafflesSyncCron(dependencyManager: DependencyManager) {
  const execute = async () => {
    try {
      const result = await runRafflesSync(dependencyManager);
      logRafflesSyncResult(result);
    } catch (error) {
      console.error("[RAFFLES SYNC] Sync failed", error);
    }
  };

  void execute();

  const scheduled = cron.schedule("*/1 * * * *", execute);
  if (!scheduled) {
    console.error("[RAFFLES SYNC] No se pudo registrar el cron");
    return;
  }

  console.info("[RAFFLES SYNC] Cron activo (cada 1 minuto)");
}
