import { Op } from "sequelize";
import IEvent from "../../core/entities/IEvent.js";
import EventModel from "../models/EventModel.js";

const toEvent = (row: { toJSON: () => unknown }): IEvent =>
  row.toJSON() as IEvent;

const normalizeOptionalString = (value: unknown): string | null => {
  if (value == null) {
    return null;
  }
  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeOptionalDate = (value: unknown): string | null => {
  const normalized = normalizeOptionalString(value);
  if (!normalized) {
    return null;
  }
  return normalized.slice(0, 10);
};

export const EventRepository = () => ({
  async listAll(): Promise<IEvent[]> {
    const rows = await EventModel.findAll({
      order: [
        ["startDate", "DESC"],
        ["startTime", "ASC"],
        ["createdAt", "DESC"],
      ],
    });
    return rows.map(toEvent);
  },

  async findById(id: string): Promise<IEvent | null> {
    const row = await EventModel.findByPk(id);
    return row ? toEvent(row) : null;
  },

  async listVisibleInRange(from: string, to: string): Promise<IEvent[]> {
    const rows = await EventModel.findAll({
      where: {
        visibleInApp: true,
        [Op.or]: [
          {
            startDate: { [Op.lte]: to },
            endDate: { [Op.gte]: from },
          },
          {
            startDate: { [Op.between]: [from, to] },
            endDate: null,
          },
          {
            startDate: null,
            endDate: { [Op.between]: [from, to] },
          },
          {
            startDate: { [Op.lte]: to },
            endDate: { [Op.gte]: from },
          },
        ],
      },
      order: [
        ["startDate", "ASC"],
        ["startTime", "ASC"],
        ["title", "ASC"],
      ],
    });
    return rows.map(toEvent);
  },

  async create(input: Omit<IEvent, "id">): Promise<IEvent> {
    const row = await EventModel.create({
      title: normalizeOptionalString(input.title),
      eventType: normalizeOptionalString(input.eventType),
      startDate: normalizeOptionalDate(input.startDate),
      endDate: normalizeOptionalDate(input.endDate),
      startTime: normalizeOptionalString(input.startTime),
      endTime: normalizeOptionalString(input.endTime),
      place: normalizeOptionalString(input.place),
      modality: normalizeOptionalString(input.modality),
      description: normalizeOptionalString(input.description),
      notes: normalizeOptionalString(input.notes),
      imageUrl: normalizeOptionalString(input.imageUrl),
      visibleInApp: input.visibleInApp ?? true,
    });
    return toEvent(row);
  },

  async update(id: string, input: Partial<IEvent>): Promise<IEvent | null> {
    const row = await EventModel.findByPk(id);
    if (!row) {
      return null;
    }

    await row.update({
      ...(input.title !== undefined
        ? { title: normalizeOptionalString(input.title) }
        : {}),
      ...(input.eventType !== undefined
        ? { eventType: normalizeOptionalString(input.eventType) }
        : {}),
      ...(input.startDate !== undefined
        ? { startDate: normalizeOptionalDate(input.startDate) }
        : {}),
      ...(input.endDate !== undefined
        ? { endDate: normalizeOptionalDate(input.endDate) }
        : {}),
      ...(input.startTime !== undefined
        ? { startTime: normalizeOptionalString(input.startTime) }
        : {}),
      ...(input.endTime !== undefined
        ? { endTime: normalizeOptionalString(input.endTime) }
        : {}),
      ...(input.place !== undefined
        ? { place: normalizeOptionalString(input.place) }
        : {}),
      ...(input.modality !== undefined
        ? { modality: normalizeOptionalString(input.modality) }
        : {}),
      ...(input.description !== undefined
        ? { description: normalizeOptionalString(input.description) }
        : {}),
      ...(input.notes !== undefined
        ? { notes: normalizeOptionalString(input.notes) }
        : {}),
      ...(input.imageUrl !== undefined
        ? { imageUrl: normalizeOptionalString(input.imageUrl) }
        : {}),
      ...(input.visibleInApp !== undefined
        ? { visibleInApp: Boolean(input.visibleInApp) }
        : {}),
    });

    return toEvent(row);
  },

  async remove(id: string): Promise<boolean> {
    const deleted = await EventModel.destroy({ where: { id } });
    return deleted > 0;
  },
});
