import { Op, Sequelize, type WhereOptions } from "sequelize";
import { IUserRepository } from "../../core/repository/IMongoUserRepository.js";
import UserModel from "../models/UserModel.js";
import configs from "../../../../configs.js";
import IUser from "../../core/entities/IUser.js";
import SubscriptionPlan from "../../../subscriptionPlan/infrastructure/models/SubscriptionPlanModel.js";
import Payment from "../../../payment/infrastructure/models/PaymentModel.js";
import InternalMember from "../../../internalMembers/infrastructure/models/InternalMemberModel.js";
import {
  normalizeUserLookupKey,
  sanitizeIlikeLiteralFragment,
} from "../../../../helpers/userLookupNormalize.js";

const flattenInternalMember = (userJson: Record<string, unknown>) => {
  const im = userJson.internalMember as Record<string, unknown> | null | undefined;
  const { internalMember: _internalMemberDrop, ...rest } = userJson;
  return {
    ...rest,
    forumUserId: (im?.forumUserId as string | null | undefined) ?? null,
    forumEmail: (im?.forumEmail as string | null | undefined) ?? null,
    mercadopagoCustomerId:
      (im?.mercadopagoCustomerId as string | null | undefined) ?? null,
    mercadopagoExternalReference:
      (im?.mercadopagoExternalReference as string | null | undefined) ?? null,
  } as Record<string, unknown>;
};

const toPlanRow = (sub: any) =>
  sub && typeof sub.toJSON === "function" ? sub.toJSON() : sub;

/**
 * Con más de un plan ACTIVE (p. ej. reactivación desde el panel sin cerrar el anterior),
 * `.find` devolvía el primero por id y podía seguir mostrando "expirado" si ese registro
 * tenía fechas viejas. Tomamos el ACTIVE más reciente por createdAt.
 */
const pickLatestActiveSubscription = (plans: any[] | undefined): any | null => {
  if (!plans?.length) return null;
  const actives = plans.map(toPlanRow).filter((p: any) => p?.status === "ACTIVE");
  if (actives.length === 0) return null;
  return actives.reduce((best: any, p: any) => {
    const bt = best?.createdAt ? new Date(best.createdAt).getTime() : 0;
    const pt = p?.createdAt ? new Date(p.createdAt).getTime() : 0;
    if (pt > bt) return p;
    if (pt === bt && Number(p?.id) > Number(best?.id)) return p;
    return best;
  });
};

const pickLatestCancelledSubscription = (plans: any[] | undefined): any | null => {
  if (!plans?.length) return null;
  const cancelled = plans
    .map(toPlanRow)
    .filter((p: any) => p?.status === "CANCELLED");
  if (cancelled.length === 0) return null;
  return cancelled.reduce((best: any, p: any) => {
    const bt = best?.createdAt ? new Date(best.createdAt).getTime() : 0;
    const pt = p?.createdAt ? new Date(p.createdAt).getTime() : 0;
    if (pt > bt) return p;
    if (pt === bt && Number(p?.id) > Number(best?.id)) return p;
    return best;
  });
};

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
          model: InternalMember,
          as: "internalMember",
          required: false,
        },
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
      const userJson = flattenInternalMember(user.toJSON() as Record<string, unknown>) as any;
      const activeSubscription = pickLatestActiveSubscription(
        userJson.subscriptionPlans
      );
      const cancelledSubscription = activeSubscription
        ? null
        : pickLatestCancelledSubscription(userJson.subscriptionPlans);
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

          if (nextPayment > today) {
            isUpToDate = true;
          } else if (lastPayment) {
            const lastPaymentDate = new Date(lastPayment.paidAt);
            lastPaymentDate.setHours(0, 0, 0, 0);
            isUpToDate = lastPaymentDate >= nextPayment;
          } else {
            isUpToDate = false;
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
        nextPaymentDate = cancelledSubscription.nextPaymentDate;
        lastPayment = cancelledSubscription.payments?.[0] || null;
        if (nextPaymentDate) {
          const end = new Date(nextPaymentDate);
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);
          isUpToDate = end >= startOfToday;
        } else if (lastPayment) {
          const lastPaymentDate = new Date(lastPayment.paidAt);
          const today = new Date();
          const daysSinceLastPayment = Math.floor(
            (today.getTime() - lastPaymentDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          isUpToDate = daysSinceLastPayment < 30;
        } else {
          isUpToDate = false;
        }
      }

      // No forzar "expirado" solo por isUpToDate: si el plan en DB es ACTIVE, el usuario
      // puede estar al día aun con fechas desfasadas; isUpToDate queda en el payload para
      // filtros o UI secundaria.
      const displayStatus = activeSubscription
        ? subscriptionStatus
        : cancelledSubscription
          ? 'CANCELLED'
          : subscriptionStatus;

      const proFromCancelled =
        !!cancelledSubscription && isUpToDate === true;

      return {
        ...userJson,
        fullName: fullNameWithoutDuplicate(userJson.name, userJson.lastname),
        vip:
          (!!activeSubscription && isUpToDate !== false) ||
          proFromCancelled ||
          (!!userJson.is_pro && !activeSubscription && !cancelledSubscription),
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
  async getOneByEmailIgnoreCase(email: string, includePassword = false) {
    if (!email?.trim()) return null;
    const user = await UserModel.findOne({
      where: Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("email")),
        Op.eq,
        email.trim().toLowerCase()
      ),
      ...(includePassword ? {} : { attributes: { exclude: ["password"] } }),
    });
    return user ? (user.toJSON() as any) : null;
  },
  async getOneByMercadopagoEmailIgnoreCase(email: string) {
    if (!email?.trim()) return null;
    const user = await UserModel.findOne({
      where: Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("mercadopago_email")),
        Op.eq,
        email.trim().toLowerCase()
      ),
      attributes: { exclude: ["password"] },
    });
    return user ? (user.toJSON() as any) : null;
  },
  async getOneByUsernameIgnoreCase(username: string, includePassword = false) {
    if (!username?.trim()) return null;
    const user = await UserModel.findOne({
      where: Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("username")),
        Op.eq,
        username.trim().toLowerCase()
      ),
      ...(includePassword ? {} : { attributes: { exclude: ["password"] } }),
    });
    return user ? (user.toJSON() as any) : null;
  },
  async getOneByUsernameAccentFoldIgnoreCase(username: string, includePassword = false) {
    const needle = normalizeUserLookupKey(username ?? "");
    if (!needle) return null;
    const words = needle.split(" ").filter((w) => w.length > 0);
    const w0 = sanitizeIlikeLiteralFragment(words[0] ?? "");
    if (!w0) return null;

    const attr = includePassword ? {} : { attributes: { exclude: ["password"] } };
    const needleCompact = needle.replace(/\s+/g, "");

    const pickHit = (rows: any[]): any | null => {
      return (
        rows.find((row) => {
          const u = normalizeUserLookupKey(String((row as any).username ?? ""));
          if (u === needle) return true;
          if (
            needleCompact.length >= 3 &&
            u.replace(/\s+/g, "") === needleCompact
          ) {
            return true;
          }
          return false;
        }) ?? null
      );
    };

    /** Prefijo largo, luego 2 letras (ej. "noemi" vs "Noemí…") y contiene (último recurso). */
    const wheres: WhereOptions[] = [{ username: { [Op.iLike]: `${w0}%` } }];
    if (w0.length >= 2) {
      const two = w0.slice(0, 2);
      wheres.push({ username: { [Op.iLike]: `${two}%` } });
      wheres.push({ username: { [Op.iLike]: `%${two}%` } });
    }

    const seen = new Set<string | number>();
    const merged: any[] = [];
    for (const where of wheres) {
      const rows = await UserModel.findAll({
        where,
        limit: 180,
        ...attr,
      });
      for (const row of rows) {
        const id = (row as any).id as string | number;
        if (!seen.has(id)) {
          seen.add(id);
          merged.push(row);
        }
      }
      const hit = pickHit(merged);
      if (hit) return hit.toJSON() as any;
    }

    return null;
  },
  async getById(id) {
    const user = await UserModel.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: InternalMember,
          as: "internalMember",
          required: false,
        },
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

    const userJson = flattenInternalMember(user.toJSON() as Record<string, unknown>) as any;
    const activeSubscription = pickLatestActiveSubscription(
      userJson.subscriptionPlans
    );
    const cancelledSubscription = activeSubscription
      ? null
      : pickLatestCancelledSubscription(userJson.subscriptionPlans);
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

        if (nextPayment > today) {
          isUpToDate = true;
        } else if (lastPayment) {
          const lastPaymentDate = new Date(lastPayment.paidAt);
          lastPaymentDate.setHours(0, 0, 0, 0);
          isUpToDate = lastPaymentDate >= nextPayment;
        } else {
          isUpToDate = false;
        }
        } else {
          if (lastPayment) {
            const lastPaymentDate = new Date(lastPayment.paidAt);
            const today = new Date();
            const daysSinceLastPayment = Math.floor(
              (today.getTime() - lastPaymentDate.getTime()) /
                (1000 * 60 * 60 * 24)
            );
            isUpToDate = daysSinceLastPayment < 30;
          } else {
            isUpToDate = false;
          }
        }
    } else if (cancelledSubscription) {
      subscriptionStatus = "CANCELLED";
      nextPaymentDate = cancelledSubscription.nextPaymentDate;
      lastPayment = cancelledSubscription.payments?.[0] || null;
      if (nextPaymentDate) {
        const end = new Date(nextPaymentDate);
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        isUpToDate = end >= startOfToday;
      } else if (lastPayment) {
        const lastPaymentDate = new Date(lastPayment.paidAt);
        const today = new Date();
        const daysSinceLastPayment = Math.floor(
          (today.getTime() - lastPaymentDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        isUpToDate = daysSinceLastPayment < 30;
      } else {
        isUpToDate = false;
      }
    }

    const displayStatus = activeSubscription
      ? subscriptionStatus
      : cancelledSubscription
        ? "CANCELLED"
        : subscriptionStatus;

    const proFromCancelled =
      !!cancelledSubscription && isUpToDate === true;

    const resolvedVip =
      (!!activeSubscription && isUpToDate !== false) ||
      proFromCancelled ||
      (!!userJson.is_pro && !activeSubscription && !cancelledSubscription);

    return {
      ...userJson,
      fullName: fullNameWithoutDuplicate(userJson.name, userJson.lastname),
      vip: resolvedVip,
      subscription: subscriptionPlan
        ? {
            id: subscriptionPlan.id,
            status: displayStatus,
            rawStatus: subscriptionStatus,
            startedAt: subscriptionPlan.startedAt,
            nextPaymentDate: nextPaymentDate ?? subscriptionPlan.nextPaymentDate,
            isUpToDate: isUpToDate,
            lastPayment: lastPayment
              ? {
                  id: lastPayment.id,
                  amount: lastPayment.amount,
                  currency: lastPayment.currency,
                  paidAt: lastPayment.paidAt,
                }
              : null,
          }
        : null,
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
