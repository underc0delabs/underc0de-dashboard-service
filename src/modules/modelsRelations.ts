import User from "./users/infrastructure/models/UserModel.js";
import SubscriptionPlan from "./subscriptionPlan/infrastructure/models/SubscriptionPlanModel.js";
import Payment from "./payment/infrastructure/models/PaymentModel.js";

// Definir relaciones después de que todos los modelos estén inicializados
User.hasMany(SubscriptionPlan, { foreignKey: 'userId', as: 'subscriptionPlans' });

SubscriptionPlan.belongsTo(User, { foreignKey: 'userId', as: 'user' });
SubscriptionPlan.hasMany(Payment, { foreignKey: 'userSubscriptionId', as: 'payments' });

Payment.belongsTo(SubscriptionPlan, {
  foreignKey: "userSubscriptionId",
  as: "subscriptionPlan",
});

