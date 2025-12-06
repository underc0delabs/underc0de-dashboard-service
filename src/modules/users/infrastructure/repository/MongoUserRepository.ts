import { IUserRepository } from "../../core/repository/IMongoUserRepository";
import UserModel from "../models/UserModel";
import configs from "../../../../configs";
import IUser from "../../core/entities/IUser";

export const MongoUserRepository = (): IUserRepository => ({
  async save(user) {
    const newUser = await UserModel.create(user as any);
    return newUser.toJSON() as IUser;
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
    const total = await UserModel.count(rest);
    const users = await UserModel.findAll({
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
    return await UserModel.findByPk(id);
  },
  async getOne(query) {
    return await UserModel.findOne({ where: query });
  },
});
