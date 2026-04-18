import { DependencyManager } from "../../../../dependencyManager.js";
import { IUserRepository } from "../../../users/core/repository/IMongoUserRepository.js";
import { IHashService } from "../../../users/core/services/IHashService.js";
import { IInternalMemberRepository } from "../../core/repository/IInternalMemberRepository.js";
import { ISubscriptionPlanRepository } from "../../../subscriptionPlan/core/repository/ISubscriptionPlanRepository.js";
import { IPaymentRepository } from "../../../payment/core/repository/IPaymentRepository.js";
import { LinkSubscriptionAction } from "../../../users/core/actions/LinkSubscriptionAction.js";
import { ProvisionAppUserAndMemberAction } from "../../core/actions/ProvisionAppUserAndMemberAction.js";
import { GetMemberBundleByAppUserIdAction } from "../../core/actions/GetMemberBundleByAppUserIdAction.js";
import { PatchForumLinkByAppUserIdAction } from "../../core/actions/PatchForumLinkByAppUserIdAction.js";
import { PatchMercadoPagoByAppUserIdAction } from "../../core/actions/PatchMercadoPagoByAppUserIdAction.js";
import { LinkSubscriptionForAppUserAction } from "../../core/actions/LinkSubscriptionForAppUserAction.js";
import { AdminMemberControllers } from "./AdminMemberControllers.js";

export const getAdminMemberControllers = (dependencyManager: DependencyManager) => {
  const userRepository = dependencyManager.resolve(
    "userRepository"
  ) as IUserRepository;
  const hashService = dependencyManager.resolve("hashService") as IHashService;
  const internalMemberRepository = dependencyManager.resolve(
    "internalMemberRepository"
  ) as IInternalMemberRepository;
  const subscriptionPlanRepository = dependencyManager.resolve(
    "subscriptionPlanRepository"
  ) as ISubscriptionPlanRepository;
  const paymentRepository = dependencyManager.resolve(
    "paymentRepository"
  ) as IPaymentRepository;

  const provision = ProvisionAppUserAndMemberAction(
    hashService,
    internalMemberRepository
  );
  const getBundle = GetMemberBundleByAppUserIdAction(
    userRepository,
    internalMemberRepository,
    subscriptionPlanRepository
  );
  const patchForum = PatchForumLinkByAppUserIdAction(
    userRepository,
    internalMemberRepository
  );
  const patchMp = PatchMercadoPagoByAppUserIdAction(
    userRepository,
    internalMemberRepository
  );
  const linkSubscription = LinkSubscriptionAction(
    userRepository,
    subscriptionPlanRepository,
    paymentRepository
  );
  const linkSub = LinkSubscriptionForAppUserAction(
    userRepository,
    internalMemberRepository,
    linkSubscription,
    subscriptionPlanRepository
  );

  return AdminMemberControllers(
    provision,
    getBundle,
    patchForum,
    patchMp,
    linkSub
  );
};
