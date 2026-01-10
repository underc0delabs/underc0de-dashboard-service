export type MpSubscriptionStatus = "authorized" | "cancelled";

export interface MpSubscription {
  id: string;
  status: MpSubscriptionStatus;
  payer_email?: string;
  payer_id?: number;
  payer_first_name?: string;
  payer_last_name?: string;
  date_created: string;
  auto_recurring?: {
    frequency: number;
    frequency_type: string;
    transaction_amount: number;
    currency_id: string;
    start_date: string;
  };
}

export interface MpPayment {
  id: string;
  status: string; // Puede ser "approved", "pending", "rejected", etc.
  transaction_amount: number;
  currency_id: string;
  date_approved?: string;
  date_created?: string;
}
