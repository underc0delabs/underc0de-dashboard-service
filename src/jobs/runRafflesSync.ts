import { DependencyManager } from "../dependencyManager.js";
import { syncAllRaffleDeadlines } from "../modules/raffles/core/actions/raffleActionsProvider.js";
import type { IRaffleRepository } from "../modules/raffles/infrastructure/repository/RaffleRepository.js";

export type RafflesSyncResult = {
  processed: number;
  updated: number;
  details: Array<{
    id: string;
    title: string;
    status: string;
    participationDeadline: string;
    deadlineMs: number | null;
    nowMs: number;
    participationPassed: boolean;
    action: string;
  }>;
};

export const runRafflesSync = async (
  dependencyManager: DependencyManager,
): Promise<RafflesSyncResult> => {
  const raffleRepository = dependencyManager.resolve(
    "raffleRepository",
  ) as IRaffleRepository;
  return syncAllRaffleDeadlines(raffleRepository);
};
