/**
 * Miembro interno: 1:1 con Users.appUserId. Inventario previo (task 1.1): Users tiene
 * email, mercadopago_email, mpPayerId; SubscriptionPlans (userId, mpPreapprovalId, …).
 * Se añade InternalMembers para vínculos foro y Mercado Pago explícitos sin asumir
 * igualdad de emails entre sistemas.
 */
import { DependencyManager } from "../../dependencyManager.js";
import { InternalMemberRepository } from "./infrastructure/repository/InternalMemberRepository.js";

export const InternalMemberModuleInitializer = (
  dependencyManager: DependencyManager
) => {
  dependencyManager.register(
    "internalMemberRepository",
    InternalMemberRepository()
  );
};
