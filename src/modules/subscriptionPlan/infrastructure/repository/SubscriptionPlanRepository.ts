import { ISubscriptionPlanRepository } from "../../core/repository/ISubscriptionPlanRepository";
import SubscriptionPlanModel from "../models/SubscriptionPlanModel";
import configs from "../../../../configs";
import ISubscriptionPlan from "../../core/entities/ISubscriptionPlan";

export const SubscriptionPlanRepository = (): ISubscriptionPlanRepository => ({
  async save(subscriptionPlan) {
    const newSubscriptionPlan = await SubscriptionPlanModel.create(subscriptionPlan as any);
    return newSubscriptionPlan.toJSON() as ISubscriptionPlan;
  },
  async edit(subscriptionPlan, id) {
    return await SubscriptionPlanModel.update(subscriptionPlan as any, { where: { id } });
  },
  async remove(id) {
    return await SubscriptionPlanModel.destroy({ where: { id } });
  },
  async get(query) {
    const {
      page_count = configs.api.default_page_count,
      page_number = 0,
      ...rest
    } = query;
    const total = await SubscriptionPlanModel.count(rest);
    const subscriptionPlans = await SubscriptionPlanModel.findAll({
      where: rest,
      limit: Number(page_count),
      offset: Number(page_number),
      order: [['createdAt', 'DESC']]
    });
    const pagination = {
      total,
      page_number,
      page_count,
      records: subscriptionPlans.length,
    };
    return {
      subscriptionPlans,
      pagination,
    };
  },
  async getById(id) {
    return await SubscriptionPlanModel.findByPk(id);
  },
  async getOne(query) {
    return await SubscriptionPlanModel.findOne({ where: query });
  },
});

