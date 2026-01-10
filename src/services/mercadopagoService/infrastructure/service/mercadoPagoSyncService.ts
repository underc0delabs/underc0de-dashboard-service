import { MercadoPagoSyncService as IMercadoPagoSyncService } from "../../core/service/mercadoPagoSyncService";
import { MercadoPagoGateway } from "../../core/gateway/mercadoPagoGateway";
import { MpSubscription } from "../../core/types/mercadoPagoTypes";
import { MpPayment } from "../../core/types/mercadoPagoTypes";

export const MercadoPagoSyncService = (
    gateway: MercadoPagoGateway
  ): IMercadoPagoSyncService => {
    return {
      syncSubscriptions: async (): Promise<MpSubscription[]> => {
       return await gateway.getSuscriptions();  
      },
      syncPayments: async (
        subscription: MpSubscription
      ): Promise<MpPayment[]> => {
        return await gateway.getPaymentsByPreapprovalId(
          subscription.id
        );
      },
    };
  };