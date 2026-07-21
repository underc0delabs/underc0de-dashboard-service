import { BINGO_EVENT_STATUS, type BingoEventStatus } from "../../infrastructure/models/BingoEventModel.js";

export const normalizeBingoEventStatus = (
  status: string | null | undefined,
): BingoEventStatus | string => String(status ?? "").trim().toLowerCase();

export const isBingoEventDraft = (status: string | null | undefined): boolean =>
  normalizeBingoEventStatus(status) === BINGO_EVENT_STATUS.DRAFT;

export const isBingoEventActive = (status: string | null | undefined): boolean =>
  normalizeBingoEventStatus(status) === BINGO_EVENT_STATUS.ACTIVE;

export const isBingoEventClosed = (status: string | null | undefined): boolean =>
  normalizeBingoEventStatus(status) === BINGO_EVENT_STATUS.CLOSED;

export const canActivateBingoEvent = (status: string | null | undefined): boolean =>
  isBingoEventDraft(status) || isBingoEventClosed(status);
