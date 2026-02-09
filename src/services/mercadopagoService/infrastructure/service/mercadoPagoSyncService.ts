import { MercadoPagoSyncService as IMercadoPagoSyncService } from "../../core/service/mercadoPagoSyncService.js";
import { MercadoPagoGateway } from "../../core/gateway/mercadoPagoGateway.js";
import { MpSubscription } from "../../core/types/mercadoPagoTypes.js";
import { MpPayment } from "../../core/types/mercadoPagoTypes.js";

export const MercadoPagoSyncService = (
    gateway: MercadoPagoGateway
  ): IMercadoPagoSyncService => {
    return {
      syncSubscriptions: async (): Promise<MpSubscription[]> => {
       return await gateway.getSuscriptions();  
      },
      getPreapprovalById: (preapprovalId: string) =>
        gateway.getPreapprovalById(preapprovalId),
      syncPayments: async (
        subscription: MpSubscription
      ): Promise<MpPayment[]> => {
        return await gateway.getPaymentsByPreapprovalId(
          subscription.id
        );
      },
    };
  };