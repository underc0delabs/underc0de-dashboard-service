import configs from "../../../../configs.js";
import IAdminUser from "../../core/entities/IAdminUser.js";
import { IAdminUserRepository } from "../../core/repository/IAdminUserRepository.js";
import AdminUserModel from "../models/AdminUserModel.js";

export const AdminUserRepository = (): IAdminUserRepository => ({
  async save(user) {
    const newUser = await AdminUserModel.create(user as any);
    const userJson = newUser.toJSON() as any;
    delete userJson.password;
    return userJson as IAdminUser;
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
    
    const validFields = ['id', 'name', 'rol', 'email', 'status', 'createdAt', 'updatedAt'];
    const whereClause: any = {};
    
    Object.keys(rest).forEach(key => {
      if (validFields.includes(key) && rest[key] !== undefined && rest[key] !== null && rest[key] !== '') {
        whereClause[key] = rest[key];
      }
    });
    
    const defaultPageCount = Number(configs.api.default_page_count) || 10;
    const pageCountNum = Number(page_count);
    const pageNumberNum = Number(page_number);
    
    const total = await AdminUserModel.count({ where: whereClause });
    const users = await AdminUserModel.findAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      limit: isNaN(pageCountNum) ? defaultPageCount : pageCountNum,
      offset: isNaN(pageNumberNum) ? 0 : pageNumberNum,
    });
    const pagination = {
      total,
      page_number: isNaN(pageNumberNum) ? 0 : pageNumberNum,
      page_count: isNaN(pageCountNum) ? defaultPageCount : pageCountNum,
      records: users.length,
    };
    return {
      users,
      pagination,
    };
  },
  async getById(id) {
    return await AdminUserModel.findByPk(id, {
      attributes: { exclude: ['password'] },
    });
  },
  async getOne(query, includePassword = false) {
    const options: any = {
      where: query,
    };
    if (!includePassword) {
      options.attributes = { exclude: ['password'] };
    }
    return await AdminUserModel.findOne(options);
  },
});
