import { DependencyManager } from "../../dependencyManager.js";
import { EventRepository } from "./infrastructure/repository/EventRepository.js";

export const EventModuleInitializer = (
  dependencyManager: DependencyManager,
) => {
  const eventRepository = EventRepository();
  dependencyManager.register("eventRepository", eventRepository);
};
