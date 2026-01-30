import { MpSubscription, MpPayment } from "../types/mercadoPagoTypes.js";

export interface MercadoPagoGateway {
  getSuscriptions(): Promise<MpSubscription[]>;
  getPaymentsByPreapprovalId(
    preapprovalId: string
  ): Promise<MpPayment[]>;
}
