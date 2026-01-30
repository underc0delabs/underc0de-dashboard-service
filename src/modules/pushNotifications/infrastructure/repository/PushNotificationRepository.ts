import { IPushNotificationRepository } from "../../core/repository/IPushNotificationRepository.js";
import PushNotificationModel from "../models/PushNotificationModel.js";
import configs from "../../../../configs.js";
import IPushNotification from "../../core/entities/IPushNotification.js";
import AdminUserModel from "../../../adminUsers/infrastructure/models/AdminUserModel.js";

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

    const validFields = [
      'id',
      'title',
      'message',
      'audience',
      'status',
      'createdBy',
      'modifiedBy',
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

    const defaultPageCount = Number(configs.api.default_page_count) || 10;
    const pageCountNum = Number(page_count);
    const pageNumberNum = Number(page_number);

    const total = await PushNotificationModel.count({ where: whereClause });
    const pushNotifications = await PushNotificationModel.findAll({
      where: whereClause,
      limit: isNaN(pageCountNum) ? defaultPageCount : pageCountNum,
      offset: isNaN(pageNumberNum) ? 0 : pageNumberNum,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: AdminUserModel,
          as: 'creator',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: AdminUserModel,
          as: 'modifier',
          attributes: ['id', 'name', 'email'],
          required: false,
        },
      ],
    });

    const pagination = {
      total,
      page_number: isNaN(pageNumberNum) ? 0 : pageNumberNum,
      page_count: isNaN(pageCountNum) ? defaultPageCount : pageCountNum,
      records: pushNotifications.length,
    };
    return {
      pushNotifications,
      pagination,
    };
  },
  async getById(id) {
    const pushNotification = await PushNotificationModel.findByPk(id, {
      include: [
        {
          model: AdminUserModel,
          as: 'creator',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: AdminUserModel,
          as: 'modifier',
          attributes: ['id', 'name', 'email'],
          required: false,
        },
      ],
    });
    return pushNotification;
  },
  async getOne(query) {
    const pushNotification = await PushNotificationModel.findOne({
      where: query,
      include: [
        {
          model: AdminUserModel,
          as: 'creator',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: AdminUserModel,
          as: 'modifier',
          attributes: ['id', 'name', 'email'],
          required: false,
        },
      ],
    });
    return pushNotification;
  },
});

