export type BingoEventMetrics = {
  participantCount: number;
  inProgressCount: number;
  completedCount: number;
  raffleEligibleCount: number;
  completionRate: number;
  totalCheckins: number;
  averageCheckinsPerParticipant: number;
  averageProgressPercent: number;
  drawCount: number;
  lastDraw: {
    id: string;
    winnerName: string;
    participantCount: number;
    drawnAt: Date;
    superseded: boolean;
  } | null;
  standVisits?: BingoStandVisitMetric[];
};

export type BingoStandVisitMetric = {
  standId: string;
  label: string;
  visitCount: number;
  visitRate: number;
};

const round1 = (value: number) => Math.round(value * 10) / 10;

export const buildBingoEventMetrics = (params: {
  participantCount: number;
  completedCount: number;
  raffleEligibleCount: number;
  totalCheckins: number;
  standCount: number;
  drawCount: number;
  lastDraw: BingoEventMetrics["lastDraw"];
  standVisits?: BingoStandVisitMetric[];
}): BingoEventMetrics => {
  const participantCount = params.participantCount;
  const completedCount = params.completedCount;
  const inProgressCount = Math.max(participantCount - completedCount, 0);
  const standCount = params.standCount;

  const completionRate =
    participantCount > 0 ? round1((completedCount / participantCount) * 100) : 0;

  const averageCheckinsPerParticipant =
    participantCount > 0 ? round1(params.totalCheckins / participantCount) : 0;

  const averageProgressPercent =
    standCount > 0 && participantCount > 0
      ? round1((averageCheckinsPerParticipant / standCount) * 100)
      : 0;

  return {
    participantCount,
    inProgressCount,
    completedCount,
    raffleEligibleCount: params.raffleEligibleCount,
    completionRate,
    totalCheckins: params.totalCheckins,
    averageCheckinsPerParticipant,
    averageProgressPercent,
    drawCount: params.drawCount,
    lastDraw: params.lastDraw,
    ...(params.standVisits ? { standVisits: params.standVisits } : {}),
  };
};

export const emptyBingoEventMetrics = (standCount = 0): BingoEventMetrics =>
  buildBingoEventMetrics({
    participantCount: 0,
    completedCount: 0,
    raffleEligibleCount: 0,
    totalCheckins: 0,
    standCount,
    drawCount: 0,
    lastDraw: null,
  });
