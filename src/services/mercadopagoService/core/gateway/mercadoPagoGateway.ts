import { MpSubscription, MpPayment, MpPreapproval } from "../types/mercadoPagoTypes.js";

export interface MercadoPagoGateway {
  getSuscriptions(): Promise<MpSubscription[]>;
  getPaymentsByPreapprovalId(
    preapprovalId: string
  ): Promise<MpPayment[]>;
  createPreapproval(
    userId: string,
    transactionAmount: number
  ): Promise<MpPreapproval>;
}
