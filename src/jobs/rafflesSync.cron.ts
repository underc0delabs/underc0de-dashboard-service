import cron from "node-cron";
import { DependencyManager } from "../dependencyManager.js";
import { syncAllRaffleDeadlines } from "../modules/raffles/core/actions/raffleActionsProvider.js";
import type { IRaffleRepository } from "../modules/raffles/infrastructure/repository/RaffleRepository.js";

export function startRafflesSyncCron(dependencyManager: DependencyManager) {
  cron.schedule(
    "*/1 * * * *",
    async () => {
      try {
        const raffleRepository = dependencyManager.resolve(
          "raffleRepository",
        ) as IRaffleRepository;
        const result = await syncAllRaffleDeadlines(raffleRepository);
        if (result.updated > 0) {
          console.info(
            `[RAFFLES SYNC] ${result.updated}/${result.processed} sorteos actualizados`,
          );
        }
      } catch (error) {
        console.error("[RAFFLES SYNC] Sync failed", error);
      }
    },
    {
      timezone: "America/Argentina/Buenos_Aires",
    },
  );
}
