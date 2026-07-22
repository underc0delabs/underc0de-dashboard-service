import { DependencyManager } from "../../../../dependencyManager.js";
import { EventActionsProvider } from "../../core/actions/eventActionsProvider.js";
import { IEventRepository } from "../../core/repository/IEventRepository.js";
import { EventControllers } from "./EventControllers.js";

export const getEventControllers = (dependencyManager: DependencyManager) => {
  const eventRepository = dependencyManager.resolve(
    "eventRepository",
  ) as IEventRepository;
  const fileStorageService = dependencyManager.resolve("fileStorageService") as {
    saveFile: (
      file: Express.Multer.File,
      subfolder: string,
    ) => Promise<string>;
  };
  const actions = EventActionsProvider(eventRepository, fileStorageService);
  return EventControllers(actions);
};
