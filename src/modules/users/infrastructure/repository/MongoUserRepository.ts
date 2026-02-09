import { Sequelize } from "sequelize";
import { IUserRepository } from "../../core/repository/IMongoUserRepository.js";
import UserModel from "../models/UserModel.js";
import configs from "../../../../configs.js";
import IUser from "../../core/entities/IUser.js";
import SubscriptionPlan from "../../../subscriptionPlan/infrastructure/models/SubscriptionPlanModel.js";
import Payment from "../../../payment/infrastructure/models/PaymentModel.js";

export const MongoUserRepository = (): IUserRepository => ({
  async save(user) {
    const newUser = await UserModel.create(user as any);
    const userJson = newUser.toJSON() as any;
    delete userJson.password;
    return userJson as IUser;
  },
  async edit(user, id) {
    return await UserModel.update(user as any, { where: { id } });
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
        vip: !!(activeSubscription?.status === "ACTIVE" || userJson.is_pro),
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
    const options: any = {
      where: query,
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
