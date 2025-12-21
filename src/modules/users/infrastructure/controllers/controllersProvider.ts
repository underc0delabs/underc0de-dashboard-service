import { DependencyManager } from "../../../../dependencyManager";
import { getUserActions } from "../../core/actions/actionsProvider";
import { IUserRepository } from "../../core/repository/IMongoUserRepository";
import { IHashService } from "../../core/services/IHashService";
import { UserControllers } from "./UserControllers";
import { IMerchantRepository } from "../../../merchants/core/repository/IMerchantRepository";
import { IPushNotificationRepository } from "../../../pushNotifications/core/repository/IPushNotificationRepository";

export const getUserControllers = (dependencyManager: DependencyManager) => {
  const UserRepository = getUserRepository(dependencyManager);
  const hashService = getHashService(dependencyManager);
  const merchantsRepository = getMerchantsRepository(dependencyManager);
  const notificationsRepository = getNotificationsRepository(dependencyManager);
  const UserActions = getUserActions(
    UserRepository,
    hashService,
    merchantsRepository,
    notificationsRepository
  );
  return UserControllers(UserActions);
};

const getUserRepository = (dependencyManager: DependencyManager) => {
  return dependencyManager.resolve("userRepository") as IUserRepository;
};
const getHashService = (dependencyManager: DependencyManager) => {
  return dependencyManager.resolve("hashService") as IHashService;
};

const getMerchantsRepository = (dependencyManager: DependencyManager) => {
  return dependencyManager.resolve(
    "merchantRepository"
  ) as IMerchantRepository;
};
const getNotificationsRepository = (dependencyManager: DependencyManager) => {
  return dependencyManager.resolve(
    "pushNotificationRepository"
  ) as IPushNotificationRepository;
};
