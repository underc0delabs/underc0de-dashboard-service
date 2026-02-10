import { DependencyManager } from "../../../../dependencyManager.js";
import { getUserActions } from "../../core/actions/actionsProvider.js";
import { IUserRepository } from "../../core/repository/IMongoUserRepository.js";
import { IHashService } from "../../core/services/IHashService.js";
import { UserControllers } from "./UserControllers.js";
import { IMerchantRepository } from "../../../merchants/core/repository/IMerchantRepository.js";
import { IPushNotificationRepository } from "../../../pushNotifications/core/repository/IPushNotificationRepository.js";
import { ISubscriptionPlanRepository } from "../../../subscriptionPlan/core/repository/ISubscriptionPlanRepository.js";
import { IRefreshTokenRepository } from "../../core/repository/IRefreshTokenRepository.js";
import { IPaymentRepository } from "../../../payment/core/repository/IPaymentRepository.js";

export const getUserControllers = (dependencyManager: DependencyManager) => {
  const UserRepository = getUserRepository(dependencyManager);
  const hashService = getHashService(dependencyManager);
  const refreshTokenRepository = getRefreshTokenRepository(dependencyManager);
  const merchantsRepository = getMerchantsRepository(dependencyManager);
  const notificationsRepository = getNotificationsRepository(dependencyManager);
  const subscriptionPlanRepository = getSubscriptionPlanRepository(dependencyManager);
  const paymentRepository = getPaymentRepository(dependencyManager);
  const UserActions = getUserActions(
    UserRepository,
    hashService,
    refreshTokenRepository,
    merchantsRepository,
    notificationsRepository,
    subscriptionPlanRepository,
    paymentRepository
  );
  return UserControllers(UserActions);
};

const getRefreshTokenRepository = (dependencyManager: DependencyManager) => {
  return dependencyManager.resolve(
    "refreshTokenRepository"
  ) as IRefreshTokenRepository;
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
const getSubscriptionPlanRepository = (dependencyManager: DependencyManager) => {
  return dependencyManager.resolve(
    "subscriptionPlanRepository"
  ) as ISubscriptionPlanRepository;
};
const getPaymentRepository = (dependencyManager: DependencyManager) => {
  return dependencyManager.resolve(
    "paymentRepository"
  ) as IPaymentRepository;
};
