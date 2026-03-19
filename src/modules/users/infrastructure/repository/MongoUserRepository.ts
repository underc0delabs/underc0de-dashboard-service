import { Sequelize } from "sequelize";
import { IUserRepository } from "../../core/repository/IMongoUserRepository.js";
import UserModel from "../models/UserModel.js";
import configs from "../../../../configs.js";
import IUser from "../../core/entities/IUser.js";
import SubscriptionPlan from "../../../subscriptionPlan/infrastructure/models/SubscriptionPlanModel.js";
import Payment from "../../../payment/infrastructure/models/PaymentModel.js";

/** Un solo nombre para mostrar: evita duplicar (name ya incluye apellido, o name === lastname). */
const fullNameWithoutDuplicate = (name?: string | null, lastname?: string | null): string => {
  const n = (name ?? "").trim();
  const l = (lastname ?? "").trim();
  if (!n) return l;
  if (!l) return n;
  if (n === l) return n;
  if (l && n.endsWith(l)) return n;
  return `${n} ${l}`.trim();
};

export const MongoUserRepository = (): IUserRepository => ({
  async save(user) {
    const payload = { ...(user as object) };
    delete (payload as any).id;
    const newUser = await UserModel.create(payload as any);
    const userJson = newUser.toJSON() as any;
    delete userJson.password;
    return userJson as IUser;
  },
  async edit(user, id) {
    const payload = user && typeof user === "object" ? { ...user } : {};
    const sanitized: Record<string, unknown> = {};
    Object.keys(payload).forEach((key) => {
      const val = (payload as any)[key];
      if (val !== undefined && val !== null) {
        sanitized[key] = val;
      }
    });
    if (Object.keys(sanitized).length === 0) return [0];
    return await UserModel.update(sanitized as any, { where: { id } });
  },
  async remove(id) {
    return await UserModel.destroy({ where: { id } });
  },
  async get(query) {
    const {
      page_count = configs.api.default_page_count,
      page_number = 0,
      ...rest
    } = query;

    const validFields = [
      'id',
      'username',
      'name',
      'lastname',
      'phone',
      'email',
      'idNumber',
      'userType',
      'birthday',
      'status',
      'fcmToken',
      'mpPayerId',
      'mercadopago_email',
      'is_pro',
      'createdAt',
      'updatedAt',
    ];
    const whereClause: any = {};

    Object.keys(rest).forEach((key) => {
      if (
        validFields.includes(key) &&
        rest[key] !== undefined &&
        rest[key] !== null &&
        rest[key] !== ''
      ) {
        whereClause[key] = rest[key];
      }
    });

    const users = await UserModel.findAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      include: [
        {
          model: SubscriptionPlan,
          as: 'subscriptionPlans',
          required: false,
          include: [
            {
              model: Payment,
              as: 'payments',
              required: false,
              separate: true,
              order: [['paidAt', 'DESC']],
              limit: 1,
            }
          ]
        }
      ]
    });

    const usersWithSubscriptionInfo = users.map((user: any) => {
      const userJson = user.toJSON();
      const activeSubscription = userJson.subscriptionPlans?.find((sub: any) => sub.status === 'ACTIVE');
      const cancelledSubscription = userJson.subscriptionPlans?.find((sub: any) => sub.status === 'CANCELLED');
      const subscriptionPlan = activeSubscription ?? cancelledSubscription;

      let subscriptionStatus = null;
      let isUpToDate = null;
      let lastPayment = null;
      let nextPaymentDate = null;

      if (activeSubscription) {
        subscriptionStatus = activeSubscription.status;
        nextPaymentDate = activeSubscription.nextPaymentDate;
        lastPayment = activeSubscription.payments?.[0] || null;

        if (nextPaymentDate) {
          const nextPayment = new Date(nextPaymentDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (lastPayment) {
            const lastPaymentDate = new Date(lastPayment.paidAt);
            lastPaymentDate.setHours(0, 0, 0, 0);
            isUpToDate = lastPaymentDate >= nextPayment;
          } else {
            isUpToDate = nextPayment >= today;
          }
        } else {
          if (lastPayment) {
            const lastPaymentDate = new Date(lastPayment.paidAt);
            const today = new Date();
            const daysSinceLastPayment = Math.floor((today.getTime() - lastPaymentDate.getTime()) / (1000 * 60 * 60 * 24));
            isUpToDate = daysSinceLastPayment < 30;
          } else {
            isUpToDate = false;
          }
        }
      } else if (cancelledSubscription) {
        subscriptionStatus = 'CANCELLED';
      }

      const displayStatus = activeSubscription
        ? (isUpToDate === false ? 'expired' : subscriptionStatus)
        : cancelledSubscription
          ? 'CANCELLED'
          : subscriptionStatus;

      return {
        ...userJson,
        fullName: fullNameWithoutDuplicate(userJson.name, userJson.lastname),
        vip: !!(activeSubscription && isUpToDate !== false) || !!(userJson.is_pro && !activeSubscription),
        subscription: subscriptionPlan ? {
          id: subscriptionPlan.id,
          status: displayStatus,
          rawStatus: subscriptionStatus,
          startedAt: subscriptionPlan.startedAt,
          nextPaymentDate: nextPaymentDate ?? subscriptionPlan.nextPaymentDate,
          isUpToDate: isUpToDate,
          lastPayment: lastPayment ? {
            id: lastPayment.id,
            amount: lastPayment.amount,
            currency: lastPayment.currency,
            paidAt: lastPayment.paidAt,
          } : null,
        } : null,
      };
    });

    return {
      users: usersWithSubscriptionInfo,
    };
  },
  async getOneByEmailIgnoreCase(email: string) {
    if (!email?.trim()) return null;
    const user = await UserModel.findOne({
      where: Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("email")),
        email.trim().toLowerCase()
      ),
      attributes: { exclude: ["password"] },
    });
    return user ? (user.toJSON() as any) : null;
  },
  async getOneByMercadopagoEmailIgnoreCase(email: string) {
    if (!email?.trim()) return null;
    const user = await UserModel.findOne({
      where: Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("mercadopago_email")),
        email.trim().toLowerCase()
      ),
      attributes: { exclude: ["password"] },
    });
    return user ? (user.toJSON() as any) : null;
  },
  async getById(id) {
    const user = await UserModel.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: SubscriptionPlan,
          as: 'subscriptionPlans',
          required: false,
          include: [
            {
              model: Payment,
              as: 'payments',
              required: false,
              separate: true,
              order: [['paidAt', 'DESC']],
              limit: 1,
            }
          ]
        }
      ]
    });

    if (!user) return null;

    const userJson = user.toJSON() as any;
    const activeSubscription = userJson.subscriptionPlans?.find((sub: any) => sub.status === 'ACTIVE');
    
    let subscriptionStatus = null;
    let isUpToDate = null;
    let lastPayment = null;
    let nextPaymentDate = null;

    if (activeSubscription) {
      subscriptionStatus = activeSubscription.status;
      nextPaymentDate = activeSubscription.nextPaymentDate;
      lastPayment = activeSubscription.payments?.[0] || null;
      
      if (nextPaymentDate) {
        const nextPayment = new Date(nextPaymentDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (lastPayment) {
          const lastPaymentDate = new Date(lastPayment.paidAt);
          lastPaymentDate.setHours(0, 0, 0, 0);
          isUpToDate = lastPaymentDate >= nextPayment;
        } else {
          isUpToDate = nextPayment >= today;
        }
      } else {
        if (lastPayment) {
          const lastPaymentDate = new Date(lastPayment.paidAt);
          const today = new Date();
          const daysSinceLastPayment = Math.floor((today.getTime() - lastPaymentDate.getTime()) / (1000 * 60 * 60 * 24));
          isUpToDate = daysSinceLastPayment < 30;
        } else {
          isUpToDate = false;
        }
      }
    }

    return {
      ...userJson,
      fullName: fullNameWithoutDuplicate(userJson.name, userJson.lastname),
      subscription: activeSubscription ? {
        id: activeSubscription.id,
        status: subscriptionStatus,
        startedAt: activeSubscription.startedAt,
        nextPaymentDate: nextPaymentDate,
        isUpToDate: isUpToDate,
        lastPayment: lastPayment ? {
          id: lastPayment.id,
          amount: lastPayment.amount,
          currency: lastPayment.currency,
          paidAt: lastPayment.paidAt,
        } : null,
      } : null,
    };
  },
  async getOne(query, includePassword = false) {
    const sanitizedWhere: any = {};
    if (query && typeof query === 'object') {
      Object.keys(query).forEach((key) => {
        const val = query[key];
        if (val !== undefined && val !== null) {
          sanitizedWhere[key] = val;
        }
      });
    }
    if (Object.keys(sanitizedWhere).length === 0) {
      return null;
    }
    const options: any = {
      where: sanitizedWhere,
      include: [
        {
          model: SubscriptionPlan,
          as: 'subscriptionPlans',
          required: false,
          include: [
            {
              model: Payment,
              as: 'payments',
              required: false,
              separate: true,
              order: [['paidAt', 'DESC']],
              limit: 1,
            }
          ]
        }
      ]
    };
    if (!includePassword) {
      options.attributes = { exclude: ['password'] };
    }
    const user = await UserModel.findOne(options);
    if (!user) return null;

    const userJson = user.toJSON() as any;
    const activeSubscription = userJson.subscriptionPlans?.find((sub: any) => sub.status === 'ACTIVE');
    
    let subscriptionStatus = null;
    let isUpToDate = null;
    let lastPayment = null;
    let nextPaymentDate = null;

    if (activeSubscription) {
      subscriptionStatus = activeSubscription.status;
      nextPaymentDate = activeSubscription.nextPaymentDate;
      lastPayment = activeSubscription.payments?.[0] || null;
      
      if (nextPaymentDate) {
        const nextPayment = new Date(nextPaymentDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (lastPayment) {
          const lastPaymentDate = new Date(lastPayment.paidAt);
          lastPaymentDate.setHours(0, 0, 0, 0);
          isUpToDate = lastPaymentDate >= nextPayment;
        } else {
          isUpToDate = nextPayment >= today;
        }
      } else {
        if (lastPayment) {
          const lastPaymentDate = new Date(lastPayment.paidAt);
          const today = new Date();
          const daysSinceLastPayment = Math.floor((today.getTime() - lastPaymentDate.getTime()) / (1000 * 60 * 60 * 24));
          isUpToDate = daysSinceLastPayment < 30;
        } else {
          isUpToDate = false;
        }
      }
    }

    return {
      ...userJson,
      subscription: activeSubscription ? {
        id: activeSubscription.id,
        status: subscriptionStatus,
        startedAt: activeSubscription.startedAt,
        nextPaymentDate: nextPaymentDate,
        isUpToDate: isUpToDate,
        lastPayment: lastPayment ? {
          id: lastPayment.id,
          amount: lastPayment.amount,
          currency: lastPayment.currency,
          paidAt: lastPayment.paidAt,
        } : null,
      } : null,
    };
  },
});
