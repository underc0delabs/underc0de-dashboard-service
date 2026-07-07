import User from "./users/infrastructure/models/UserModel.js";
import RefreshToken from "./users/infrastructure/models/RefreshTokenModel.js";
import SubscriptionPlan from "./subscriptionPlan/infrastructure/models/SubscriptionPlanModel.js";
import Payment from "./payment/infrastructure/models/PaymentModel.js";
import InternalMember from "./internalMembers/infrastructure/models/InternalMemberModel.js";
import Category from "./categories/infrastructure/models/CategoryModel.js";
import Merchant from "./merchants/infrastructure/models/MerchantModel.js";
import UserConnection from "./connections/infrastructure/models/UserConnectionModel.js";
import UserFollow from "./connections/infrastructure/models/UserFollowModel.js";
import Raffle from "./raffles/infrastructure/models/RaffleModel.js";
import RaffleParticipant from "./raffles/infrastructure/models/RaffleParticipantModel.js";
import RaffleDraw from "./raffles/infrastructure/models/RaffleDrawModel.js";
import RaffleEvent from "./raffles/infrastructure/models/RaffleEventModel.js";
import "./partnerL2/infrastructure/models/L2PartnerForumLinkModel.js";

// Definir relaciones después de que todos los modelos estén inicializados
User.hasMany(RefreshToken, { foreignKey: "userId", as: "refreshTokens" });
RefreshToken.belongsTo(User, { foreignKey: "userId" });
User.hasMany(SubscriptionPlan, { foreignKey: 'userId', as: 'subscriptionPlans' });

SubscriptionPlan.belongsTo(User, { foreignKey: 'userId', as: 'user' });
SubscriptionPlan.hasMany(Payment, { foreignKey: 'userSubscriptionId', as: 'payments' });

Payment.belongsTo(SubscriptionPlan, {
  foreignKey: "userSubscriptionId",
  as: "subscriptionPlan",
});

User.hasOne(InternalMember, { foreignKey: "appUserId", as: "internalMember" });
InternalMember.belongsTo(User, { foreignKey: "appUserId", as: "appUser" });

Category.hasMany(Merchant, { foreignKey: "category", as: "merchants" });
Merchant.belongsTo(Category, { foreignKey: "category", as: "businessCategory" });

User.hasMany(UserConnection, { foreignKey: "requesterId", as: "sentConnections" });
User.hasMany(UserConnection, { foreignKey: "addresseeId", as: "receivedConnections" });
UserConnection.belongsTo(User, { foreignKey: "requesterId", as: "requester" });
UserConnection.belongsTo(User, { foreignKey: "addresseeId", as: "addressee" });

User.hasMany(UserFollow, { foreignKey: "followerId", as: "following" });
User.hasMany(UserFollow, { foreignKey: "followingId", as: "followers" });
UserFollow.belongsTo(User, { foreignKey: "followerId", as: "follower" });
UserFollow.belongsTo(User, { foreignKey: "followingId", as: "followedUser" });

Raffle.hasMany(RaffleParticipant, { foreignKey: "raffleId", as: "participants" });
RaffleParticipant.belongsTo(Raffle, { foreignKey: "raffleId", as: "raffle" });
RaffleParticipant.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(RaffleParticipant, { foreignKey: "userId", as: "raffleEntries" });

Raffle.hasMany(RaffleDraw, { foreignKey: "raffleId", as: "draws" });
RaffleDraw.belongsTo(Raffle, { foreignKey: "raffleId", as: "raffle" });
RaffleDraw.belongsTo(User, { foreignKey: "winnerUserId", as: "winner" });

Raffle.hasMany(RaffleEvent, { foreignKey: "raffleId", as: "events" });
RaffleEvent.belongsTo(Raffle, { foreignKey: "raffleId", as: "raffle" });
Raffle.belongsTo(User, { foreignKey: "winnerUserId", as: "winner" });
