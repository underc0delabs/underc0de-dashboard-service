import { MpPayment, MpSubscription } from "../types/mercadoPagoTypes.js";
import { MpPreapprovalDetail } from "../gateway/mercadoPagoGateway.js";

export interface MercadoPagoSyncService {
  syncSubscriptions(): Promise<MpSubscription[]>;
  getPreapprovalById(preapprovalId: string): Promise<MpPreapprovalDetail | null>;
  syncPayments( subscription: MpSubscription ): Promise<MpPayment[]>;
}