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
import BingoEvent from "./bingo/infrastructure/models/BingoEventModel.js";
import BingoStand from "./bingo/infrastructure/models/BingoStandModel.js";
import BingoParticipant from "./bingo/infrastructure/models/BingoParticipantModel.js";
import BingoParticipantToken from "./bingo/infrastructure/models/BingoParticipantTokenModel.js";
import BingoBoardEntry from "./bingo/infrastructure/models/BingoBoardEntryModel.js";
import BingoCheckin from "./bingo/infrastructure/models/BingoCheckinModel.js";
import BingoRaffleEntry from "./bingo/infrastructure/models/BingoRaffleEntryModel.js";
import BingoDraw from "./bingo/infrastructure/models/BingoDrawModel.js";

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

BingoEvent.hasMany(BingoStand, { foreignKey: "bingoEventId", as: "stands" });
BingoStand.belongsTo(BingoEvent, { foreignKey: "bingoEventId", as: "event" });
BingoStand.belongsTo(Merchant, { foreignKey: "merchantId", as: "merchant" });

BingoParticipant.hasMany(BingoParticipantToken, { foreignKey: "participantId", as: "tokens" });
BingoParticipantToken.belongsTo(BingoParticipant, { foreignKey: "participantId" });

BingoEvent.hasMany(BingoBoardEntry, { foreignKey: "bingoEventId", as: "boardEntries" });
BingoBoardEntry.belongsTo(BingoEvent, { foreignKey: "bingoEventId", as: "event" });
BingoBoardEntry.belongsTo(BingoParticipant, { foreignKey: "participantId", as: "participant" });
BingoParticipant.hasMany(BingoBoardEntry, { foreignKey: "participantId", as: "boardEntries" });

BingoBoardEntry.hasMany(BingoCheckin, { foreignKey: "boardEntryId", as: "checkins" });
BingoCheckin.belongsTo(BingoBoardEntry, { foreignKey: "boardEntryId", as: "boardEntry" });
BingoCheckin.belongsTo(BingoStand, { foreignKey: "bingoStandId", as: "stand" });
BingoStand.hasMany(BingoCheckin, { foreignKey: "bingoStandId", as: "checkins" });

BingoEvent.hasMany(BingoRaffleEntry, { foreignKey: "bingoEventId", as: "raffleEntries" });
BingoRaffleEntry.belongsTo(BingoEvent, { foreignKey: "bingoEventId", as: "event" });
BingoRaffleEntry.belongsTo(BingoParticipant, { foreignKey: "participantId", as: "participant" });
BingoParticipant.hasMany(BingoRaffleEntry, { foreignKey: "participantId", as: "raffleEntries" });

BingoEvent.hasMany(BingoDraw, { foreignKey: "bingoEventId", as: "draws" });
BingoDraw.belongsTo(BingoEvent, { foreignKey: "bingoEventId", as: "event" });
BingoDraw.belongsTo(BingoParticipant, { foreignKey: "winnerParticipantId", as: "winner" });
