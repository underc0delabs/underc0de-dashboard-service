import IEvent from "../entities/IEvent.js";

export interface IEventRepository {
  listAll: () => Promise<IEvent[]>;
  findById: (id: string) => Promise<IEvent | null>;
  listVisibleInRange: (from: string, to: string) => Promise<IEvent[]>;
  create: (input: Omit<IEvent, "id">) => Promise<IEvent>;
  update: (id: string, input: Partial<IEvent>) => Promise<IEvent | null>;
  remove: (id: string) => Promise<boolean>;
}
