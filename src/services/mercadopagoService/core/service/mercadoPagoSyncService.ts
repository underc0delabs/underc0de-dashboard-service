import { MpPayment, MpSubscription } from "../types/mercadoPagoTypes";

export interface MercadoPagoSyncService {
  syncSubscriptions(): Promise<MpSubscription[]>;
  syncPayments( subscription: MpSubscription ): Promise<MpPayment[]>;
}