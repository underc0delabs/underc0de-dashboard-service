import { MpSubscription, MpPayment, MpPreapproval } from "../types/mercadoPagoTypes.js";

export interface MpPreapprovalDetail {
  id: string;
  payer_email?: string;
  payer_id?: number;
  status?: string;
  [key: string]: unknown;
}

export interface MercadoPagoGateway {
  getSuscriptions(): Promise<MpSubscription[]>;
  getPreapprovalById(preapprovalId: string): Promise<MpPreapprovalDetail | null>;
  getPaymentsByPreapprovalId(
    preapprovalId: string
  ): Promise<MpPayment[]>;
  createPreapproval(
    userId: string,
    transactionAmount: number
  ): Promise<MpPreapproval>;
}
