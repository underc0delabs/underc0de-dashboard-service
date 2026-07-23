import { IUserRepository } from '../../../users/core/repository/IMongoUserRepository.js';
import { ISubscriptionPlanRepository } from '../repository/ISubscriptionPlanRepository.js';
import {
  getExpectedAppleBundleId,
  getExpectedAppleProductId,
  verifyAppleSignedTransaction,
} from '../../../../services/appleIap/verifyAppleJws.js';

export interface AppleSubscriptionVerifyInput {
  userId: string;
  transactionId: string;
  originalTransactionId: string;
  productId: string;
  signedTransactionInfo: string;
  environment?: string | null;
}

export interface AppleSubscriptionVerifyResult {
  success: boolean;
  user_is_pro?: boolean;
  subscription_status?: string;
  message?: string;
}

const applePreapprovalId = (originalTransactionId: string): string =>
  `apple-${originalTransactionId}`;

const resolveStatus = (
  expiresDateMs?: number,
  revocationDateMs?: number,
): 'ACTIVE' | 'EXPIRED' | 'CANCELLED' => {
  if (revocationDateMs != null && revocationDateMs > 0) {
    return 'CANCELLED';
  }
  if (expiresDateMs != null && expiresDateMs > 0) {
    return expiresDateMs > Date.now() ? 'ACTIVE' : 'EXPIRED';
  }
  return 'ACTIVE';
};

export interface IVerifyAppleSubscriptionAction {
  execute: (
    input: AppleSubscriptionVerifyInput,
  ) => Promise<AppleSubscriptionVerifyResult>;
}

export const VerifyAppleSubscriptionAction = (
  subscriptionPlanRepository: ISubscriptionPlanRepository,
  userRepository: IUserRepository,
): IVerifyAppleSubscriptionAction => ({
  execute: async (input) => {
    const user = await userRepository.getById(input.userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const payload = await verifyAppleSignedTransaction(
      input.signedTransactionInfo,
    );

    const expectedBundleId = getExpectedAppleBundleId();
    const expectedProductId = getExpectedAppleProductId();

    if (payload.bundleId && payload.bundleId !== expectedBundleId) {
      throw new Error('La transacción no corresponde a esta app');
    }
    if (payload.productId && payload.productId !== expectedProductId) {
      throw new Error('Producto de suscripción inválido');
    }

    const originalTransactionId =
      payload.originalTransactionId?.trim() ||
      input.originalTransactionId?.trim();
    const transactionId =
      payload.transactionId?.trim() || input.transactionId?.trim();
    const productId = payload.productId?.trim() || input.productId?.trim();

    if (!originalTransactionId || !transactionId || !productId) {
      throw new Error('Datos de transacción incompletos');
    }

    const existingByOriginal = await subscriptionPlanRepository.getOne({
      originalTransactionId,
    });
    if (existingByOriginal) {
      const existingUserId =
        (existingByOriginal as any).userId ??
        (existingByOriginal as any).dataValues?.userId;
      if (
        existingUserId != null &&
        String(existingUserId) !== String(input.userId)
      ) {
        throw new Error('Esta suscripción ya está asociada a otra cuenta');
      }
    }

    const status = resolveStatus(payload.expiresDate, payload.revocationDate);
    const isPro = status === 'ACTIVE';
    const mpPreapprovalId = applePreapprovalId(originalTransactionId);
    const now = new Date();
    const expirationDate =
      payload.expiresDate != null && payload.expiresDate > 0
        ? new Date(payload.expiresDate)
        : null;

    if (existingByOriginal?.id != null) {
      await subscriptionPlanRepository.edit(
        {
          userId: (user as any).id,
          status,
          provider: 'apple',
          productId,
          transactionId,
          originalTransactionId,
          mpPreapprovalId,
          nextPaymentDate: expirationDate,
          expirationDate,
          environment:
            input.environment?.trim() ||
            payload.environment?.trim() ||
            null,
          lastValidatedAt: now,
        } as any,
        String(existingByOriginal.id),
      );
    } else {
      await subscriptionPlanRepository.save({
        userId: (user as any).id,
        status,
        startedAt: now,
        provider: 'apple',
        productId,
        transactionId,
        originalTransactionId,
        mpPreapprovalId,
        nextPaymentDate: expirationDate,
        expirationDate,
        environment:
          input.environment?.trim() ||
          payload.environment?.trim() ||
          null,
        lastValidatedAt: now,
      } as any);
    }

    await userRepository.edit({ is_pro: isPro } as any, input.userId);

    return {
      success: true,
      user_is_pro: isPro,
      subscription_status: status,
      message: isPro ? 'Suscripción activada' : 'Suscripción no activa',
    };
  },
});
