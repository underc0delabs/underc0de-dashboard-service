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
  /**
   * Cancela un preapproval en Mercado Pago (suscripción recurrente).
   * API: `PUT /preapproval/{id}` con cuerpo `{ "status": "cancelled" }` (misma base `https://api.mercadopago.com` que el resto del gateway).
   */
  cancelPreapproval(preapprovalId: string): Promise<void>;
}
