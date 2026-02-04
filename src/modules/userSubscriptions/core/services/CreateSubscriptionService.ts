import axios from "axios";
import UserSubscription from "../../infrastructure/models/UserSubscriptionModel.js";

export interface IUser {
  id: number;
  email: string;
  name: string;
}

export class CreateSubscriptionService {
  async execute(user: IUser) {
    try {
      // Verificar si el usuario ya tiene una suscripción activa
      const existingSubscription = await UserSubscription.findOne({
        where: { userId: user.id }
      });

      if (existingSubscription && (existingSubscription.status === 'authorized' || existingSubscription.status === 'pending')) {
        throw new Error('El usuario ya tiene una suscripción activa o pendiente');
      }

      // Crear preapproval en MercadoPago
      const response = await axios.post(
        "https://api.mercadopago.com/preapproval",
        {
          reason: "Membresía Underc0de PRO",
          payer_email: user.email,
          auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: 3000,
            currency_id: "ARS",
          },
          back_url: process.env.MP_BACK_URL || "https://underc0de.net/success",
          notification_url: process.env.MP_WEBHOOK_URL || "https://api.underc0de.net/api/v1/webhook/mercadopago",
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      const { id, init_point, status } = response.data;

      // Guardar suscripción en la base de datos
      await UserSubscription.create({
        userId: user.id,
        mpPreapprovalId: id,
        status: status || 'pending',
      });

      return { 
        init_point,
        preapproval_id: id,
        status
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("[CREATE SUBSCRIPTION] MercadoPago API Error:", error.response?.data);
        throw new Error(`Error al crear suscripción en MercadoPago: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }
}
