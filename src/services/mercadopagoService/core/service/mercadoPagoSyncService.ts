import { MpPayment, MpSubscription } from "../types/mercadoPagoTypes.js";

export interface MercadoPagoSyncService {
  syncSubscriptions(): Promise<MpSubscription[]>;
  syncPayments( subscription: MpSubscription ): Promise<MpPayment[]>;
}