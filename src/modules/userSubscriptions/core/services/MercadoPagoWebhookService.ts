import axios from "axios";
import UserSubscription from "../../infrastructure/models/UserSubscriptionModel.js";
import User from "../../../users/infrastructure/models/UserModel.js";

export class MercadoPagoWebhookService {
  async handlePreapprovalEvent(preapprovalId: string) {
    try {
      console.log(`[MP WEBHOOK] Processing preapproval: ${preapprovalId}`);

      // Consultar API de MercadoPago para obtener el estado actual
      const mpResponse = await axios.get(
        `https://api.mercadopago.com/preapproval/${preapprovalId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
          },
        }
      );

      const { status, payer_email } = mpResponse.data;
      console.log(`[MP WEBHOOK] Preapproval status: ${status}, email: ${payer_email}`);

      // Buscar suscripción en la base de datos
      const subscription = await UserSubscription.findOne({
        where: { mpPreapprovalId: preapprovalId },
      });

      if (!subscription) {
        console.warn(`[MP WEBHOOK] Subscription not found for preapproval: ${preapprovalId}`);
        return { success: false, message: 'Subscription not found' };
      }

      // Actualizar estado de la suscripción
      subscription.status = status;
      await subscription.save();

      // Actualizar estado PRO del usuario
      const user = await User.findByPk(subscription.userId);
      if (!user) {
        console.error(`[MP WEBHOOK] User not found: ${subscription.userId}`);
        return { success: false, message: 'User not found' };
      }

      if (status === "authorized") {
        // @ts-ignore - is_pro puede no estar en el tipo User
        user.is_pro = true;
        await user.save();
        console.log(`[MP WEBHOOK] User ${user.id} is now PRO`);
      }

      if (status === "cancelled" || status === "paused") {
        // @ts-ignore - is_pro puede no estar en el tipo User
        user.is_pro = false;
        await user.save();
        console.log(`[MP WEBHOOK] User ${user.id} PRO status removed`);
      }

      return { 
        success: true, 
        subscription_status: status,
        user_is_pro: status === "authorized"
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("[MP WEBHOOK] MercadoPago API Error:", error.response?.data);
        throw new Error(`Error al consultar MercadoPago: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  async handleWebhook(body: any) {
    console.log("[MP WEBHOOK] Received event:", JSON.stringify(body, null, 2));

    if (body.type === "preapproval") {
      const preapprovalId = body.data?.id;
      
      if (!preapprovalId) {
        console.error("[MP WEBHOOK] Missing preapproval ID");
        return { success: false, message: 'Missing preapproval ID' };
      }

      return await this.handlePreapprovalEvent(preapprovalId);
    }

    console.log(`[MP WEBHOOK] Unhandled event type: ${body.type}`);
    return { success: true, message: 'Event type not handled' };
  }
}
