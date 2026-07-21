import { BINGO_EVENT_STATUS } from "../../infrastructure/models/BingoEventModel.js";
import type {
  IBingoRepository,
  BingoEventRow,
  BingoStandRow,
} from "../../infrastructure/repository/BingoRepository.js";
import {
  BingoConflictException,
  BingoEventNotFoundException,
  BingoStandNotFoundException,
  BingoValidationException,
} from "../exceptions/BingoExceptions.js";
import {
  emptyBingoEventMetrics,
  type BingoEventMetrics,
} from "../domain/bingoEventMetrics.js";
import {
  canActivateBingoEvent,
  isBingoEventActive,
  isBingoEventClosed,
  isBingoEventDraft,
  normalizeBingoEventStatus,
} from "../domain/bingoEventStatus.js";

const parseDate = (value: unknown): Date | null => {
  if (value == null || value === "") {
    return null;
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const raw = String(value).trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (match) {
    const [, year, month, day, hour, minute] = match;
    const utcGuess = Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
    );
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Argentina/Buenos_Aires",
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    for (let offsetHours = -3; offsetHours <= 3; offsetHours += 1) {
      const candidate = new Date(utcGuess + offsetHours * 60 * 60 * 1000);
      const parts = formatter.formatToParts(candidate);
      const read = (type: Intl.DateTimeFormatPartTypes) =>
        parts.find(part => part.type === type)?.value ?? "";
      const candidateLocal = `${read("year")}-${read("month")}-${read("day")}T${read("hour")}:${read("minute")}`;
      if (candidateLocal === raw) {
        return candidate;
      }
    }
  }
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    throw new BingoValidationException("Fecha inválida");
  }
  return date;
};

const serializeOptionalDate = (value: unknown): string | null => {
  if (value == null || value === "") {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value as string);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
};

const mapEvent = (
  event: BingoEventRow,
  standCount = 0,
  metrics: BingoEventMetrics = emptyBingoEventMetrics(standCount),
) => ({
  id: event.id,
  name: event.name,
  description: event.description,
  status: normalizeBingoEventStatus(event.status),
  startDate: serializeOptionalDate(event.startDate),
  endDate: serializeOptionalDate(event.endDate),
  standCount,
  participantCount: metrics.participantCount,
  metrics,
  createdAt: serializeOptionalDate(event.createdAt) ?? event.createdAt,
});

const mapStand = (stand: BingoStandRow & { merchant?: { id: string; name: string; logo: string | null } }) => ({
  id: stand.id,
  bingoEventId: stand.bingoEventId,
  code: stand.code,
  label: stand.label,
  merchantId: stand.merchantId,
  merchantName: stand.merchant?.name ?? null,
  merchantLogo: stand.merchant?.logo ?? null,
});

export interface IBingoActions {
  // Admin
  createEvent(input: Record<string, unknown>, adminId: number): Promise<unknown>;
  updateEvent(id: string, input: Record<string, unknown>): Promise<unknown>;
  activateEvent(id: string): Promise<unknown>;
  reactivateEvent(id: string): Promise<unknown>;
  closeEvent(id: string): Promise<unknown>;
  listEventsAdmin(): Promise<unknown[]>;
  getEventAdmin(id: string): Promise<unknown>;
  deleteEvent(id: string): Promise<{ id: string }>;
  createStand(eventId: string, input: Record<string, unknown>): Promise<unknown>;
  updateStand(eventId: string, standId: string, input: Record<string, unknown>): Promise<unknown>;
  deleteStand(eventId: string, standId: string): Promise<{ id: string }>;
  listParticipantsAdmin(eventId: string): Promise<unknown[]>;
  drawAdmin(eventId: string, adminId: number): Promise<unknown>;

  // Participant
  getActiveEvent(): Promise<unknown>;
  joinEvent(eventId: string, participantId: string): Promise<unknown>;
  getBoard(eventId: string, participantId: string): Promise<unknown>;
  checkin(eventId: string, participantId: string, code: string): Promise<unknown>;
}

const buildBoard = async (
  repo: IBingoRepository,
  eventId: string,
  boardEntryId: string,
  completedAt: Date | null,
) => {
  const stands = await repo.listStandsByEvent(eventId);
  const checkedIds = new Set(await repo.listCheckedStandIds(boardEntryId));
  return {
    stands: stands.map(stand => ({
      ...mapStand(stand as BingoStandRow & { merchant?: { id: string; name: string; logo: string | null } }),
      checked: checkedIds.has(stand.id),
    })),
    completed: completedAt != null,
    completedAt,
  };
};

export const BingoActionsProvider = (repo: IBingoRepository): IBingoActions => {
  const promoteBingoEventToActive = async (id: string) => {
    const stands = await repo.listStandsByEvent(id);
    if (stands.length === 0) {
      throw new BingoConflictException("El evento necesita al menos un stand para activarse");
    }
    await repo.closeAllActiveEventsExcept(id);
    const updated = await repo.updateEvent(id, { status: BINGO_EVENT_STATUS.ACTIVE });
    const metrics = await repo.getEventMetrics(id);
    return mapEvent(updated!, stands.length, metrics);
  };

  return {
  async createEvent(input, adminId) {
    const name = String(input.name ?? "").trim();
    if (!name) {
      throw new BingoValidationException("El nombre del evento es obligatorio");
    }
    const event = await repo.createEvent({
      name,
      description: input.description ? String(input.description).trim() : null,
      startDate: parseDate(input.startDate),
      endDate: parseDate(input.endDate),
      createdByAdminId: adminId,
    });
    return mapEvent(event, 0, emptyBingoEventMetrics(0));
  },

  async updateEvent(id, input) {
    const existing = await repo.findEventById(id);
    if (!existing) {
      throw new BingoEventNotFoundException();
    }

    if (input.status !== undefined && input.status !== null && input.status !== "") {
      const requested = normalizeBingoEventStatus(String(input.status));
      const current = normalizeBingoEventStatus(existing.status);
      if (requested !== current) {
        if (requested === BINGO_EVENT_STATUS.ACTIVE && canActivateBingoEvent(current)) {
          return promoteBingoEventToActive(id);
        }
        if (requested === BINGO_EVENT_STATUS.CLOSED && isBingoEventActive(current)) {
          const updated = await repo.updateEvent(id, { status: BINGO_EVENT_STATUS.CLOSED });
          const stands = await repo.listStandsByEvent(id);
          const metrics = await repo.getEventMetrics(id);
          return mapEvent(updated!, stands.length, metrics);
        }
        throw new BingoConflictException(
          `No se puede cambiar el estado de "${current}" a "${requested}"`,
        );
      }
    }

    const updated = await repo.updateEvent(id, {
      name: input.name != null ? String(input.name).trim() : existing.name,
      description:
        input.description !== undefined
          ? (input.description ? String(input.description).trim() : null)
          : existing.description,
      startDate: input.startDate !== undefined ? parseDate(input.startDate) : existing.startDate,
      endDate: input.endDate !== undefined ? parseDate(input.endDate) : existing.endDate,
    });
    const stands = await repo.listStandsByEvent(id);
    const metrics = await repo.getEventMetrics(id);
    return mapEvent(updated!, stands.length, metrics);
  },

  async activateEvent(id) {
    const event = await repo.findEventById(id);
    if (!event) {
      throw new BingoEventNotFoundException();
    }
    const status = normalizeBingoEventStatus(event.status);
    if (!canActivateBingoEvent(status)) {
      throw new BingoConflictException(
        `No se puede activar un evento en estado "${status}". Solo borradores o inactivos.`,
      );
    }
    return promoteBingoEventToActive(id);
  },

  async reactivateEvent(id) {
    const event = await repo.findEventById(id);
    if (!event) {
      throw new BingoEventNotFoundException();
    }
    const status = normalizeBingoEventStatus(event.status);
    if (!isBingoEventClosed(status)) {
      throw new BingoConflictException("Solo se pueden reactivar eventos inactivos");
    }
    return promoteBingoEventToActive(id);
  },

  async closeEvent(id) {
    const event = await repo.findEventById(id);
    if (!event) {
      throw new BingoEventNotFoundException();
    }
    if (!isBingoEventActive(event.status)) {
      throw new BingoConflictException("Solo se pueden desactivar eventos activos");
    }
    const updated = await repo.updateEvent(id, { status: BINGO_EVENT_STATUS.CLOSED });
    const stands = await repo.listStandsByEvent(id);
    const metrics = await repo.getEventMetrics(id);
    return mapEvent(updated!, stands.length, metrics);
  },

  async listEventsAdmin() {
    const events = await repo.listEvents();
    return Promise.all(
      events.map(async event => {
        const stands = await repo.listStandsByEvent(event.id);
        const metrics = await repo.getEventMetrics(event.id);
        return mapEvent(event, stands.length, metrics);
      }),
    );
  },

  async getEventAdmin(id) {
    const event = await repo.findEventById(id);
    if (!event) {
      throw new BingoEventNotFoundException();
    }
    const stands = await repo.listStandsByEvent(id);
    const metrics = await repo.getEventMetrics(id, { includeStandVisits: true });
    return {
      ...mapEvent(event, stands.length, metrics),
      stands: stands.map(s => mapStand(s as BingoStandRow & { merchant?: { id: string; name: string; logo: string | null } })),
    };
  },

  async deleteEvent(id) {
    const event = await repo.findEventById(id);
    if (!event) {
      throw new BingoEventNotFoundException();
    }
    if (!isBingoEventDraft(event.status)) {
      throw new BingoConflictException("Solo se pueden eliminar eventos en borrador");
    }
    await repo.deleteEvent(id);
    return { id };
  },

  async createStand(eventId, input) {
    const event = await repo.findEventById(eventId);
    if (!event) {
      throw new BingoEventNotFoundException();
    }
    const label = String(input.label ?? "").trim();
    if (!label) {
      throw new BingoValidationException("El nombre del stand es obligatorio");
    }
    const stand = await repo.createStand({
      bingoEventId: eventId,
      label,
      merchantId: input.merchantId ? String(input.merchantId) : null,
      code: input.code ? String(input.code).trim() : undefined,
    });
    return mapStand(stand as BingoStandRow & { merchant?: { id: string; name: string; logo: string | null } });
  },

  async updateStand(eventId, standId, input) {
    const stand = await repo.findStandById(standId);
    if (!stand || stand.bingoEventId !== eventId) {
      throw new BingoStandNotFoundException();
    }
    const updated = await repo.updateStand(standId, {
      label: input.label != null ? String(input.label).trim() : stand.label,
      merchantId: input.merchantId !== undefined ? (input.merchantId ? String(input.merchantId) : null) : stand.merchantId,
    });
    return mapStand(updated as BingoStandRow & { merchant?: { id: string; name: string; logo: string | null } });
  },

  async deleteStand(eventId, standId) {
    const stand = await repo.findStandById(standId);
    if (!stand || stand.bingoEventId !== eventId) {
      throw new BingoStandNotFoundException();
    }
    await repo.deleteStand(standId);
    return { id: standId };
  },

  async listParticipantsAdmin(eventId) {
    const event = await repo.findEventById(eventId);
    if (!event) {
      throw new BingoEventNotFoundException();
    }
    const entries = await repo.listBoardEntriesByEvent(eventId);
    return Promise.all(
      entries.map(async entry => ({
        boardEntryId: entry.id,
        participantId: entry.participantId,
        name: entry.participant?.name ?? null,
        email: entry.participant?.email ?? null,
        joinedAt: entry.joinedAt,
        completedAt: entry.completedAt,
        checkedCount: await repo.countCheckins(entry.id),
      })),
    );
  },

  async drawAdmin(eventId, adminId) {
    const event = await repo.findEventById(eventId);
    if (!event) {
      throw new BingoEventNotFoundException();
    }
    const pool = await repo.listRaffleEntryParticipantIds(eventId);
    if (pool.length === 0) {
      throw new BingoConflictException("No hay participantes en el sorteo");
    }
    await repo.supersedeDraws(eventId);
    const winnerParticipantId = repo.pickRandomParticipant(pool);
    const draw = await repo.createDraw({
      bingoEventId: eventId,
      winnerParticipantId,
      participantCount: pool.length,
      drawnByAdminId: adminId,
    });
    const winner = await repo.findParticipantById(winnerParticipantId);
    return {
      drawId: draw.id,
      winnerParticipantId,
      winnerName: winner?.name ?? winner?.email ?? "Participante",
      participantCount: pool.length,
    };
  },

  async getActiveEvent() {
    const event = await repo.findActiveEvent();
    if (!event) {
      throw new BingoEventNotFoundException("No hay un evento de bingo activo");
    }
    const stands = await repo.listStandsByEvent(event.id);
    return mapEvent(event, stands.length);
  },

  async joinEvent(eventId, participantId) {
    const event = await repo.findEventById(eventId);
    if (!event || !isBingoEventActive(event.status)) {
      throw new BingoEventNotFoundException();
    }
    const existing = await repo.findBoardEntry(eventId, participantId);
    if (existing) {
      return buildBoard(repo, eventId, existing.id, existing.completedAt);
    }
    try {
      const entry = await repo.createBoardEntry(eventId, participantId);
      return buildBoard(repo, eventId, entry.id, entry.completedAt);
    } catch {
      // Concurrent join request already created the entry; fall back to it.
      const raceWinner = await repo.findBoardEntry(eventId, participantId);
      if (!raceWinner) {
        throw new BingoConflictException("No se pudo unir al evento");
      }
      return buildBoard(repo, eventId, raceWinner.id, raceWinner.completedAt);
    }
  },

  async getBoard(eventId, participantId) {
    const entry = await repo.findBoardEntry(eventId, participantId);
    if (!entry) {
      throw new BingoConflictException("Todavía no te uniste a este evento");
    }
    return buildBoard(repo, eventId, entry.id, entry.completedAt);
  },

  async checkin(eventId, participantId, code) {
    const event = await repo.findEventById(eventId);
    if (!event || !isBingoEventActive(event.status)) {
      throw new BingoEventNotFoundException();
    }
    const entry = await repo.findBoardEntry(eventId, participantId);
    if (!entry) {
      throw new BingoConflictException("Todavía no te uniste a este evento");
    }
    const stand = await repo.findStandByCode(eventId, code.trim());
    if (!stand) {
      throw new BingoStandNotFoundException("Código de stand inválido");
    }

    const alreadyChecked = await repo.findCheckin(entry.id, stand.id);
    if (!alreadyChecked) {
      try {
        await repo.createCheckin(entry.id, stand.id);
      } catch {
        // Concurrent check-in request already recorded it; treat as already checked.
      }
    }

    const totalStands = (await repo.listStandsByEvent(eventId)).length;
    const checkedCount = await repo.countCheckins(entry.id);
    let completedAt = entry.completedAt;
    let justCompleted = false;

    if (!completedAt && checkedCount >= totalStands && totalStands > 0) {
      await repo.markBoardEntryCompleted(entry.id);
      completedAt = new Date();
      justCompleted = true;
      if (!(await repo.hasRaffleEntry(eventId, participantId))) {
        try {
          await repo.createRaffleEntry(eventId, participantId);
        } catch {
          // Concurrent completion already created the raffle entry.
        }
      }
    }

    const board = await buildBoard(repo, eventId, entry.id, completedAt);
    return { ...board, justCompleted, alreadyChecked: Boolean(alreadyChecked) };
  },
};
};
