import axios, { AxiosInstance } from "axios";
import { MercadoPagoGateway } from "../../core/gateway/mercadoPagoGateway.js";

const MP_BASE_URL = "https://api.mercadopago.com";

const PAGE_LIMIT = 100;
const MAX_PAGES = 20;
const SUBSCRIPTIONS_MONTH_WINDOW = 3;

export const MercadoPagoHttpGateway = (): MercadoPagoGateway => {
  const client: AxiosInstance = axios.create({
    baseURL: MP_BASE_URL,
    headers: {
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    timeout: 15000,
  });
  const getSuscriptions = async () => {
    try {
      let all: any[] = [];
      let offset = 0;
      const limit = 50;

      const now = new Date();
      const fromDate = new Date();
      fromDate.setMonth(now.getMonth() - SUBSCRIPTIONS_MONTH_WINDOW);

      while (true) {
        const { data } = await client.get("/preapproval/search", {
          params: { limit, offset },
        });

        const results = data?.results ?? [];
        if (!results.length) break;

        const recent = results.filter((sub: any) => {
          if (!sub.date_created) return false;
          const created = new Date(sub.date_created);
          return created >= fromDate;
        });

        all.push(...recent);

        if (results.length < limit) break;
        offset += limit;
      }
      return all;
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const body = error.response.data;
        console.error("[MP Gateway] preapproval/search failed", {
          status,
          statusText: error.response.statusText,
          data: body,
          hasToken: Boolean(process.env.MP_ACCESS_TOKEN),
          tokenPrefix: process.env.MP_ACCESS_TOKEN?.slice(0, 15) ?? "(none)",
        });
      }
      throw error;
    }
  };
  const getPreapprovalById = async (preapprovalId: string) => {
    try {
      const { data } = await client.get(`/preapproval/${preapprovalId}`);
      return data as import("../../core/gateway/mercadoPagoGateway.js").MpPreapprovalDetail;
    } catch (err: any) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  };

  const getPaymentsByPreapprovalId = async (preapprovalId: string) => {
    try {
      const { data: preapproval } = await client.get(
        `/preapproval/${preapprovalId}`
      );

      const subscriptionId =
        preapproval?.subscription_id || preapproval?.id;

      if (!subscriptionId) return [];

      const endDate = new Date();
      const beginDate = new Date();
      beginDate.setMonth(endDate.getMonth() - SUBSCRIPTIONS_MONTH_WINDOW);

      let offset = 0;
      let page = 0;
      const payments: any[] = [];

      while (page < MAX_PAGES) {
        const { data } = await client.get("/v1/payments/search", {
          params: {
            status: "approved",
            sort: "date_created",
            criteria: "desc",
            range: "date_created",
            begin_date: beginDate.toISOString(),
            end_date: endDate.toISOString(),
            limit: PAGE_LIMIT,
            offset,
          },
        });

        const results = data?.results ?? [];
        if (!results.length) break;

        const filtered = results.filter((payment: any) => {
          const metadata = payment.metadata ?? {};

          const isRelated =
            payment.subscription_id === subscriptionId ||
            metadata.subscription_id === subscriptionId ||
            metadata.preapproval_id === preapprovalId;

          const notRefunded =
            !payment.refunds || payment.refunds.length === 0;

          return isRelated && notRefunded;
        });

        payments.push(...filtered);

        if (results.length < PAGE_LIMIT) break;

        offset += PAGE_LIMIT;
        page++;
      }

      return payments;
    } catch (error: any) {
      return [];
    }
  };
  const createPreapproval = async (userEmail: string, transactionAmount: number) => {
    try {
      const response = await client.post("/preapproval",
        {
          "reason": "Membresía Underc0de PRO",
          "payer_email": userEmail,
          "auto_recurring": {
            "frequency": 1,
            "frequency_type": "months",
            "transaction_amount": transactionAmount || 3000,
            "currency_id": "ARS"
          },
          "back_url": "https://api.underc0de.net/api/v1",
          "notification_url": "https://api.underc0de.net/api/v1/webhook/mercadopago"
        }
      );
      return response.data
    } catch (error: any) {
      throw error;
    }
  };

  return {
    getSuscriptions,
    getPreapprovalById,
    getPaymentsByPreapprovalId,
    createPreapproval,
  };
};
