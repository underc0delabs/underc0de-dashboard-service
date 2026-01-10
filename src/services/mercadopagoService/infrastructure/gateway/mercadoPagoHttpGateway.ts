import axios, { AxiosInstance } from "axios";
import { MercadoPagoGateway } from "../../core/gateway/mercadoPagoGateway";

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
      throw error;
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

  return {
    getSuscriptions,
    getPaymentsByPreapprovalId,
  };
};
