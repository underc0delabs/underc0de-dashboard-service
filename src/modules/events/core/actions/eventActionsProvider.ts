import { getFileUrl } from "../../../../helpers/file-url.js";
import IEvent from "../entities/IEvent.js";
import { IEventRepository } from "../repository/IEventRepository.js";

export class EventNotFoundException extends Error {
  constructor() {
    super("Evento no encontrado");
    this.name = "EventNotFoundException";
  }
}

const mapEvent = (event: IEvent): IEvent => ({
  ...event,
  imageUrl: getFileUrl(event.imageUrl ?? null),
});

const parseBoolean = (value: unknown, fallback: boolean): boolean => {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") {
      return true;
    }
    if (normalized === "false") {
      return false;
    }
  }
  return fallback;
};

const parseDateRange = (from?: string, to?: string) => {
  const today = new Date();
  const defaultFrom = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  const defaultTo = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10);

  const parsedFrom = String(from ?? defaultFrom).slice(0, 10);
  const parsedTo = String(to ?? defaultTo).slice(0, 10);

  if (parsedFrom > parsedTo) {
    throw new Error("El rango de fechas es inválido");
  }

  return { from: parsedFrom, to: parsedTo };
};

export interface IEventActions {
  listAdmin: () => Promise<IEvent[]>;
  getAdminById: (id: string) => Promise<IEvent>;
  createAdmin: (
    input: Partial<IEvent>,
    file?: Express.Multer.File,
  ) => Promise<IEvent>;
  updateAdmin: (
    id: string,
    input: Partial<IEvent> & { removeImage?: boolean },
    file?: Express.Multer.File,
  ) => Promise<IEvent>;
  deleteAdmin: (id: string) => Promise<void>;
  listApp: (from?: string, to?: string) => Promise<IEvent[]>;
}

export const EventActionsProvider = (
  eventRepository: IEventRepository,
  fileStorageService: {
    saveFile: (
      file: Express.Multer.File,
      subfolder: string,
    ) => Promise<string>;
  },
): IEventActions => ({
  async listAdmin() {
    const rows = await eventRepository.listAll();
    return rows.map(mapEvent);
  },

  async getAdminById(id) {
    const event = await eventRepository.findById(id);
    if (!event) {
      throw new EventNotFoundException();
    }
    return mapEvent(event);
  },

  async createAdmin(input, file) {
    let imageUrl: string | null = null;
    if (file) {
      imageUrl = await fileStorageService.saveFile(file, "events");
    }

    const event = await eventRepository.create({
      title: input.title ?? null,
      eventType: input.eventType ?? null,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      startTime: input.startTime ?? null,
      endTime: input.endTime ?? null,
      place: input.place ?? null,
      modality: input.modality ?? null,
      description: input.description ?? null,
      notes: input.notes ?? null,
      imageUrl,
      visibleInApp: parseBoolean(input.visibleInApp, true),
    });

    return mapEvent(event);
  },

  async updateAdmin(id, input, file) {
    const existing = await eventRepository.findById(id);
    if (!existing) {
      throw new EventNotFoundException();
    }

    let imageUrl = existing.imageUrl ?? null;
    if (file) {
      imageUrl = await fileStorageService.saveFile(file, "events");
    } else if (parseBoolean(input.removeImage, false)) {
      imageUrl = null;
    }

    const updated = await eventRepository.update(id, {
      title: input.title,
      eventType: input.eventType,
      startDate: input.startDate,
      endDate: input.endDate,
      startTime: input.startTime,
      endTime: input.endTime,
      place: input.place,
      modality: input.modality,
      description: input.description,
      notes: input.notes,
      imageUrl,
      visibleInApp:
        input.visibleInApp !== undefined
          ? parseBoolean(input.visibleInApp, true)
          : undefined,
    });

    if (!updated) {
      throw new EventNotFoundException();
    }

    return mapEvent(updated);
  },

  async deleteAdmin(id) {
    const deleted = await eventRepository.remove(id);
    if (!deleted) {
      throw new EventNotFoundException();
    }
  },

  async listApp(from, to) {
    const range = parseDateRange(from, to);
    const rows = await eventRepository.listVisibleInRange(range.from, range.to);
    return rows.map(mapEvent);
  },
});
