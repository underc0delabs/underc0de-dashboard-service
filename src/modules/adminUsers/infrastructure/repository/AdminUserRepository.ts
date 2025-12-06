import configs from "../../../../configs";
import IAdminUser from "../../core/entities/IAdminUser";
import { IAdminUserRepository } from "../../core/repository/IAdminUserRepository";
import AdminUserModel from "../models/AdminUserModel";

export const AdminUserRepository = (): IAdminUserRepository => ({
  async save(user) {
    const newUser = await AdminUserModel.create(user as any);
    return newUser.toJSON() as IAdminUser;
  },
  async edit(user, id) {
    return await AdminUserModel.update(user, { where: { id } });
  },
  async remove(id) {
    return await AdminUserModel.destroy({ where: { id } });
  },
  async get(query) {
    const {
      page_count = configs.api.default_page_count,
      page_number = 0,
      ...rest
    } = query;
    const total = await AdminUserModel.count(rest);
    const users = await AdminUserModel.findAll({
      where: rest,
      limit: Number(page_count),
      offset: Number(page_number),
    });
    const pagination = {
      total,
      page_number,
      page_count,
      records: users.length,
    };
    return {
      users,
      pagination,
    };
  },
  async getById(id) {
    return await AdminUserModel.findByPk(id);
  },
  async getOne(query) {
    return await AdminUserModel.findOne({ where: query });
  },
});
