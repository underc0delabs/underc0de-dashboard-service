import { IPushNotificationRepository } from "../../core/repository/IPushNotificationRepository";
import PushNotificationModel from "../models/PushNotificationModel";
import configs from "../../../../configs";
import IPushNotification from "../../core/entities/IPushNotification";

export const PushNotificationRepository = (): IPushNotificationRepository => ({
  async save(pushNotification) {
    const newPushNotification = await PushNotificationModel.create(pushNotification as any);
    return newPushNotification.toJSON() as IPushNotification;
  },
  async edit(pushNotification, id) {
    return await PushNotificationModel.update(pushNotification as any, { where: { id } });
  },
  async remove(id) {
    return await PushNotificationModel.destroy({ where: { id } });
  },
  async get(query) {
    const {
      page_count = configs.api.default_page_count,
      page_number = 0,
      ...rest
    } = query;
    const total = await PushNotificationModel.count(rest);
    const pushNotifications = await PushNotificationModel.findAll({
      where: rest,
      limit: Number(page_count),
      offset: Number(page_number),
      order: [['createdAt', 'DESC']]
    });
    const pagination = {
      total,
      page_number,
      page_count,
      records: pushNotifications.length,
    };
    return {
      pushNotifications,
      pagination,
    };
  },
  async getById(id) {
    return await PushNotificationModel.findByPk(id);
  },
  async getOne(query) {
    return await PushNotificationModel.findOne({ where: query });
  },
});

