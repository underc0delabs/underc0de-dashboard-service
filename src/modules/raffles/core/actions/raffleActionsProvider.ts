import { getFileUrl } from "../../../../helpers/file-url.js";
import { UserNotActiveException } from "../../../users/core/exceptions/UserNotActiveException.js";
import { UserNotExistException } from "../../../users/core/exceptions/UserNotExistException.js";
import type { IUserRepository } from "../../../users/core/repository/IMongoUserRepository.js";
import {
  RaffleConflictException,
  RaffleForbiddenException,
  RaffleNotFoundException,
  RaffleValidationException,
} from "../exceptions/RaffleExceptions.js";
import { RAFFLE_STATUS } from "../../infrastructure/models/RaffleModel.js";
import { RAFFLE_EVENT_TYPE } from "../../infrastructure/models/RaffleEventModel.js";
import type { IRaffleRepository, RaffleRow } from "../../infrastructure/repository/RaffleRepository.js";

const dateFieldLabels: Record<string, string> = {
  participationDeadline: "Fecha de cierre de participación",
  claimDeadline: "Fecha límite para reclamar el premio",
};

/** datetime-local from admin dashboard has no timezone — treat as Argentina. */
const parseDate = (value: unknown, field: string): Date => {
  const raw = String(value ?? "").trim();
  if (!raw) {
    throw new RaffleValidationException(
      `${dateFieldLabels[field] ?? field} es obligatoria`,
    );
  }

  let date: Date;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(raw)) {
    const normalized = raw.length === 16 ? `${raw}:00` : raw;
    date = new Date(`${normalized}-03:00`);
  } else {
    date = value instanceof Date ? value : new Date(raw);
  }

  if (Number.isNaN(date.getTime())) {
    throw new RaffleValidationException(
      `${dateFieldLabels[field] ?? field} inválida`,
    );
  }
  return date;
};

/** FormData sends booleans as strings; Boolean("false") is true. */
const parseBoolean = (value: unknown, defaultValue = false): boolean => {
  if (value === true || value === 1) {
    return true;
  }
  if (value === false || value === 0 || value == null) {
    return defaultValue;
  }

  const normalized = String(value).trim().toLowerCase();
  if (normalized === "true" || normalized === "1" || normalized === "yes") {
    return true;
  }
  if (
    normalized === "false" ||
    normalized === "0" ||
    normalized === "no" ||
    normalized === ""
  ) {
    return false;
  }

  return defaultValue;
};

const assertActiveUser = async (
  repo: IRaffleRepository,
  userId: number,
) => {
  const user = await repo.findUserById(userId);
  if (!user) {
    throw new UserNotExistException();
  }
  if (!user.status) {
    throw new UserNotActiveException();
  }
  return user;
};

const winnerDisplayName = async (
  repo: IRaffleRepository,
  userId: number,
): Promise<string> => {
  const user = await repo.findUserById(userId);
  return user?.name?.trim() || user?.username || "Participante";
};

export const syncRaffleDeadlines = async (
  repo: IRaffleRepository,
  raffle: RaffleRow,
): Promise<RaffleRow> => {
  const now = new Date();
  let updated = raffle;

  if (
    raffle.status === RAFFLE_STATUS.PUBLISHED &&
    now > new Date(raffle.participationDeadline)
  ) {
    const row = await repo.update(raffle.id, { status: RAFFLE_STATUS.CLOSED });
    if (row) {
      updated = row;
      await repo.addEvent({
        raffleId: raffle.id,
        type: RAFFLE_EVENT_TYPE.PARTICIPATION_CLOSED,
        payload: { participantCount: await repo.countParticipants(raffle.id) },
        actorType: "system",
      });
    }
  }

  if (
    updated.status === RAFFLE_STATUS.DRAWN &&
    now > new Date(updated.claimDeadline)
  ) {
    const row = await repo.update(updated.id, { status: RAFFLE_STATUS.EXPIRED });
    if (row) {
      updated = row;
      await repo.addEvent({
        raffleId: updated.id,
        type: RAFFLE_EVENT_TYPE.CLAIM_EXPIRED,
        payload: {},
        actorType: "system",
      });
    }
  }

  return updated;
};

const mapPublicRaffle = async (
  repo: IRaffleRepository,
  raffle: RaffleRow,
  viewerUserId?: number,
) => {
  const participantCount = await repo.countParticipants(raffle.id);
  const hasEntered =
    viewerUserId != null
      ? await repo.hasParticipated(raffle.id, viewerUserId)
      : false;

  let winnerDisplay: string | null = null;
  if (raffle.winnerUserId != null) {
    winnerDisplay = await winnerDisplayName(repo, raffle.winnerUserId);
  }

  return {
    id: raffle.id,
    title: raffle.title,
    description: raffle.description,
    imageUrl: getFileUrl(raffle.imageUrl),
    participationDeadline: raffle.participationDeadline,
    claimDeadline: raffle.claimDeadline,
    proOnly: raffle.proOnly,
    status: raffle.status,
    publishedAt: raffle.publishedAt,
    participantCount,
    hasEntered,
    winnerDisplayName: winnerDisplay,
  };
};

export interface IRaffleActions {
  listAdmin(): Promise<unknown[]>;
  getAdminById(id: string): Promise<unknown>;
  createAdmin(input: Record<string, unknown>, adminId: number, file?: Express.Multer.File): Promise<unknown>;
  updateAdmin(id: string, input: Record<string, unknown>, file?: Express.Multer.File): Promise<unknown>;
  publishAdmin(id: string, adminId: number): Promise<unknown>;
  closeAdmin(id: string, adminId: number): Promise<unknown>;
  drawAdmin(id: string, adminId: number): Promise<unknown>;
  redrawAdmin(id: string, adminId: number): Promise<unknown>;
  claimAdmin(id: string, adminId: number): Promise<unknown>;
  listParticipantsAdmin(id: string): Promise<unknown[]>;
  listEventsAdmin(id: string): Promise<unknown[]>;
  listApp(userId: number): Promise<unknown[]>;
  getAppById(id: string, userId: number): Promise<unknown>;
  enterApp(id: string, userId: number): Promise<unknown>;
}

const isProMember = async (
  userRepository: IUserRepository,
  userId: number,
): Promise<boolean> => {
  const user = await userRepository.getById(String(userId));
  if (!user) {
    return false;
  }
  return Boolean((user as { vip?: boolean }).vip);
};

export const RaffleActionsProvider = (
  raffleRepository: IRaffleRepository,
  fileStorageService: {
    saveFile: (
      file: Express.Multer.File,
      subfolder: string,
    ) => Promise<string>;
  },
  userRepository: IUserRepository,
): IRaffleActions => ({
  async listAdmin() {
    const rows = await raffleRepository.listAll();
    const synced = await Promise.all(
      rows.map(r => syncRaffleDeadlines(raffleRepository, r)),
    );
    return Promise.all(
      synced.map(r => mapPublicRaffle(raffleRepository, r)),
    );
  },

  async getAdminById(id: string) {
    const raffle = await raffleRepository.findById(id);
    if (!raffle) {
      throw new RaffleNotFoundException();
    }
    const synced = await syncRaffleDeadlines(raffleRepository, raffle);
    return mapPublicRaffle(raffleRepository, synced);
  },

  async createAdmin(input, adminId, file) {
    const participationDeadline = parseDate(
      input.participationDeadline,
      "participationDeadline",
    );
    const claimDeadline = parseDate(input.claimDeadline, "claimDeadline");
    if (claimDeadline < participationDeadline) {
      throw new RaffleValidationException(
        "La fecha de reclamo debe ser posterior a la de participación",
      );
    }

    let imageUrl: string | null = null;
    if (file) {
      imageUrl = await fileStorageService.saveFile(file, "raffles");
    }

    const raffle = await raffleRepository.create({
      title: String(input.title ?? "").trim(),
      description: String(input.description ?? "").trim(),
      imageUrl,
      participationDeadline,
      claimDeadline,
      proOnly: parseBoolean(input.proOnly, false),
      createdByAdminId: adminId,
    });

    if (!raffle.title || !raffle.description) {
      throw new RaffleValidationException("Título y descripción son obligatorios");
    }

    await raffleRepository.addEvent({
      raffleId: raffle.id,
      type: RAFFLE_EVENT_TYPE.CREATED,
      payload: { title: raffle.title },
      actorType: "admin",
      actorId: String(adminId),
    });

    return mapPublicRaffle(raffleRepository, raffle);
  },

  async updateAdmin(id, input, file) {
    const raffle = await raffleRepository.findById(id);
    if (!raffle) {
      throw new RaffleNotFoundException();
    }
    if (
      raffle.status !== RAFFLE_STATUS.DRAFT &&
      raffle.status !== RAFFLE_STATUS.PUBLISHED
    ) {
      throw new RaffleConflictException("No se puede editar en este estado");
    }

    const participationDeadline = input.participationDeadline
      ? parseDate(input.participationDeadline, "participationDeadline")
      : new Date(raffle.participationDeadline);
    const claimDeadline = input.claimDeadline
      ? parseDate(input.claimDeadline, "claimDeadline")
      : new Date(raffle.claimDeadline);
    if (claimDeadline < participationDeadline) {
      throw new RaffleValidationException(
        "La fecha de reclamo debe ser posterior a la de participación",
      );
    }

    let imageUrl = raffle.imageUrl;
    if (file) {
      imageUrl = await fileStorageService.saveFile(file, "raffles");
    } else if (input.removeImage === true || input.removeImage === "true") {
      imageUrl = null;
    }

    const updated = await raffleRepository.update(id, {
      title: input.title != null ? String(input.title).trim() : raffle.title,
      description:
        input.description != null
          ? String(input.description).trim()
          : raffle.description,
      imageUrl,
      participationDeadline,
      claimDeadline,
      proOnly:
        input.proOnly != null
          ? parseBoolean(input.proOnly, raffle.proOnly)
          : raffle.proOnly,
    });

    return mapPublicRaffle(raffleRepository, updated!);
  },

  async publishAdmin(id, adminId) {
    const raffle = await raffleRepository.findById(id);
    if (!raffle) {
      throw new RaffleNotFoundException();
    }
    if (raffle.status !== RAFFLE_STATUS.DRAFT) {
      throw new RaffleConflictException("Solo se pueden publicar borradores");
    }

    const updated = await raffleRepository.update(id, {
      status: RAFFLE_STATUS.PUBLISHED,
      publishedAt: new Date(),
    });

    await raffleRepository.addEvent({
      raffleId: id,
      type: RAFFLE_EVENT_TYPE.PUBLISHED,
      payload: {},
      actorType: "admin",
      actorId: String(adminId),
    });

    return mapPublicRaffle(raffleRepository, updated!);
  },

  async closeAdmin(id, adminId) {
    let raffle = await raffleRepository.findById(id);
    if (!raffle) {
      throw new RaffleNotFoundException();
    }

    raffle = await syncRaffleDeadlines(raffleRepository, raffle);

    if (raffle.status === RAFFLE_STATUS.CLOSED) {
      return mapPublicRaffle(raffleRepository, raffle);
    }

    if (raffle.status !== RAFFLE_STATUS.PUBLISHED) {
      throw new RaffleConflictException(
        "Solo se puede cerrar la participación de un sorteo publicado",
      );
    }

    const participantCount = await raffleRepository.countParticipants(id);
    const updated = await raffleRepository.update(id, {
      status: RAFFLE_STATUS.CLOSED,
    });

    await raffleRepository.addEvent({
      raffleId: id,
      type: RAFFLE_EVENT_TYPE.PARTICIPATION_CLOSED,
      payload: { participantCount, forced: true },
      actorType: "admin",
      actorId: String(adminId),
    });

    return mapPublicRaffle(raffleRepository, updated!);
  },

  async drawAdmin(id, adminId) {
    let raffle = await raffleRepository.findById(id);
    if (!raffle) {
      throw new RaffleNotFoundException();
    }
    raffle = await syncRaffleDeadlines(raffleRepository, raffle);

    if (raffle.status !== RAFFLE_STATUS.CLOSED) {
      throw new RaffleConflictException("El sorteo debe estar cerrado para sortear");
    }

    const pool = await raffleRepository.listParticipantUserIds(id);
    if (pool.length === 0) {
      throw new RaffleConflictException("No hay participantes");
    }

    const winnerUserId = raffleRepository.pickRandomParticipant(pool);
    const drawNumber = await raffleRepository.getNextDrawNumber(id);
    const draw = await raffleRepository.createDraw({
      raffleId: id,
      drawNumber,
      winnerUserId,
      participantCount: pool.length,
      drawnByAdminId: adminId,
    });

    const winnerName = await winnerDisplayName(raffleRepository, winnerUserId);
    const updated = await raffleRepository.update(id, {
      status: RAFFLE_STATUS.DRAWN,
      winnerUserId,
      currentDrawId: String(draw.id),
    });

    await raffleRepository.addEvent({
      raffleId: id,
      type: RAFFLE_EVENT_TYPE.DRAWN,
      payload: {
        drawNumber,
        participantCount: pool.length,
        winnerDisplayName: winnerName,
      },
      actorType: "admin",
      actorId: String(adminId),
    });

    return mapPublicRaffle(raffleRepository, updated!);
  },

  async redrawAdmin(id, adminId) {
    let raffle = await raffleRepository.findById(id);
    if (!raffle) {
      throw new RaffleNotFoundException();
    }
    raffle = await syncRaffleDeadlines(raffleRepository, raffle);

    if (
      raffle.status !== RAFFLE_STATUS.EXPIRED &&
      raffle.status !== RAFFLE_STATUS.DRAWN
    ) {
      throw new RaffleConflictException(
        "Solo se puede re-sortear cuando expiró el reclamo o se marca forfeit",
      );
    }

    await raffleRepository.supersedeDraws(id);
    const forfeited = await raffleRepository.listForfeitedWinnerIds(id);
    const all = await raffleRepository.listParticipantUserIds(id);
    const pool = all.filter(uid => !forfeited.includes(uid));

    if (pool.length === 0) {
      throw new RaffleConflictException("No hay participantes elegibles");
    }

    const winnerUserId = raffleRepository.pickRandomParticipant(pool);
    const drawNumber = await raffleRepository.getNextDrawNumber(id);
    const draw = await raffleRepository.createDraw({
      raffleId: id,
      drawNumber,
      winnerUserId,
      participantCount: pool.length,
      drawnByAdminId: adminId,
    });

    const winnerName = await winnerDisplayName(raffleRepository, winnerUserId);
    const updated = await raffleRepository.update(id, {
      status: RAFFLE_STATUS.DRAWN,
      winnerUserId,
      currentDrawId: String(draw.id),
    });

    await raffleRepository.addEvent({
      raffleId: id,
      type: RAFFLE_EVENT_TYPE.REDRAWN,
      payload: {
        drawNumber,
        participantCount: pool.length,
        winnerDisplayName: winnerName,
      },
      actorType: "admin",
      actorId: String(adminId),
    });

    return mapPublicRaffle(raffleRepository, updated!);
  },

  async claimAdmin(id, adminId) {
    const raffle = await raffleRepository.findById(id);
    if (!raffle) {
      throw new RaffleNotFoundException();
    }
    if (raffle.status !== RAFFLE_STATUS.DRAWN) {
      throw new RaffleConflictException("El sorteo debe tener ganador sorteado");
    }

    const updated = await raffleRepository.update(id, {
      status: RAFFLE_STATUS.COMPLETED,
    });

    await raffleRepository.addEvent({
      raffleId: id,
      type: RAFFLE_EVENT_TYPE.PRIZE_CLAIMED,
      payload: {},
      actorType: "admin",
      actorId: String(adminId),
    });

    return mapPublicRaffle(raffleRepository, updated!);
  },

  async listParticipantsAdmin(id: string) {
    const raffle = await raffleRepository.findById(id);
    if (!raffle) {
      throw new RaffleNotFoundException();
    }
    const participants = await raffleRepository.listParticipants(id);
    return participants.map(p => ({
      id: p.id,
      userId: p.userId,
      displayName: p.user?.name ?? "",
      username: p.user?.username ?? "",
      enteredAt: p.enteredAt,
    }));
  },

  async listEventsAdmin(id: string) {
    const raffle = await raffleRepository.findById(id);
    if (!raffle) {
      throw new RaffleNotFoundException();
    }
    return raffleRepository.listEvents(id);
  },

  async listApp(userId: number) {
    await assertActiveUser(raffleRepository, userId);
    const rows = await raffleRepository.listForApp(userId);
    const synced = await Promise.all(
      rows.map(r => syncRaffleDeadlines(raffleRepository, r)),
    );
    return Promise.all(
      synced.map(r => mapPublicRaffle(raffleRepository, r, userId)),
    );
  },

  async getAppById(id: string, userId: number) {
    await assertActiveUser(raffleRepository, userId);
    const raffle = await raffleRepository.findById(id);
    if (!raffle || raffle.status === RAFFLE_STATUS.DRAFT) {
      throw new RaffleNotFoundException();
    }
    const synced = await syncRaffleDeadlines(raffleRepository, raffle);
    const detail = await mapPublicRaffle(raffleRepository, synced, userId);
    const events = await raffleRepository.listEvents(id);
    return {
      ...detail,
      timeline: events.map(e => ({
        type: e.type,
        createdAt: e.createdAt,
        payload: e.payload,
      })),
    };
  },

  async enterApp(id: string, userId: number) {
    const user = await assertActiveUser(raffleRepository, userId);
    let raffle = await raffleRepository.findById(id);
    if (!raffle || raffle.status === RAFFLE_STATUS.DRAFT) {
      throw new RaffleNotFoundException();
    }
    raffle = await syncRaffleDeadlines(raffleRepository, raffle);

    if (raffle.status !== RAFFLE_STATUS.PUBLISHED) {
      throw new RaffleConflictException("El sorteo ya no acepta participantes");
    }

    if (new Date() > new Date(raffle.participationDeadline)) {
      throw new RaffleConflictException("Plazo de participación vencido");
    }

    if (raffle.proOnly && !(await isProMember(userRepository, userId))) {
      throw new RaffleForbiddenException("Sorteo exclusivo para miembros PRO");
    }

    if (await raffleRepository.hasParticipated(id, userId)) {
      throw new RaffleConflictException("Ya participás en este sorteo");
    }

    await raffleRepository.addParticipant(id, userId);
    await raffleRepository.addEvent({
      raffleId: id,
      type: RAFFLE_EVENT_TYPE.ENTERED,
      payload: { displayName: user.name },
      actorType: "user",
      actorId: String(userId),
    });

    return mapPublicRaffle(
      raffleRepository,
      (await raffleRepository.findById(id))!,
      userId,
    );
  },
});
