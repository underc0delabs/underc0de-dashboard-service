import { IVerifyAppleSubscriptionAction } from './VerifyAppleSubscriptionAction.js';

export interface AppleSubscriptionRestoreInput {
  userId: string;
  transactions: Array<{
    transactionId: string;
    originalTransactionId: string;
    productId: string;
    signedTransactionInfo: string;
    environment?: string | null;
  }>;
}

export interface AppleSubscriptionRestoreResult {
  success: boolean;
  restored: boolean;
  user_is_pro?: boolean;
  subscription_status?: string;
  message?: string;
}

export interface IRestoreAppleSubscriptionAction {
  execute: (
    input: AppleSubscriptionRestoreInput,
  ) => Promise<AppleSubscriptionRestoreResult>;
}

export const RestoreAppleSubscriptionAction = (
  verifyAppleSubscriptionAction: IVerifyAppleSubscriptionAction,
): IRestoreAppleSubscriptionAction => ({
  execute: async (input) => {
    const transactions = input.transactions ?? [];
    if (transactions.length === 0) {
      return {
        success: true,
        restored: false,
        message: 'No se encontraron compras para restaurar',
      };
    }

    let lastResult: Awaited<
      ReturnType<IVerifyAppleSubscriptionAction['execute']>
    > | null = null;

    for (const tx of transactions) {
      lastResult = await verifyAppleSubscriptionAction.execute({
        userId: input.userId,
        transactionId: tx.transactionId,
        originalTransactionId: tx.originalTransactionId,
        productId: tx.productId,
        signedTransactionInfo: tx.signedTransactionInfo,
        environment: tx.environment ?? null,
      });
    }

    const restored = Boolean(lastResult?.user_is_pro);
    return {
      success: true,
      restored,
      user_is_pro: lastResult?.user_is_pro,
      subscription_status: lastResult?.subscription_status,
      message: restored
        ? 'Suscripción restaurada correctamente'
        : 'No hay una suscripción activa para restaurar',
    };
  },
});
