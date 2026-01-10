import { MpSubscription, MpPayment } from "../types/mercadoPagoTypes";

export interface MercadoPagoGateway {
  getSuscriptions(): Promise<MpSubscription[]>;
  getPaymentsByPreapprovalId(
    preapprovalId: string
  ): Promise<MpPayment[]>;
}
