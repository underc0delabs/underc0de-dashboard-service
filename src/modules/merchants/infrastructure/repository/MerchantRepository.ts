import { IMerchantRepository } from "../../core/repository/IMerchantRepository";
import MerchantModel from "../models/MerchantModel";
import configs from "../../../../configs";
import IMerchant from "../../core/entities/IMerchant";

export const MerchantRepository = (): IMerchantRepository => ({
  async save(merchant) {
    const newMerchant = await MerchantModel.create(merchant as any);
    return newMerchant.toJSON() as IMerchant;
  },
  async edit(merchant, id) {
    return await MerchantModel.update(merchant as any, { where: { id } });
  },
  async remove(id) {
    return await MerchantModel.destroy({ where: { id } });
  },
  async get(query) {
    const {
      page_count = configs.api.default_page_count,
      page_number = 0,
      ...rest
    } = query;
    const total = await MerchantModel.count(rest);
    const merchants = await MerchantModel.findAll({
      where: rest,
      limit: Number(page_count),
      offset: Number(page_number),
    });
    const pagination = {
      total,
      page_number,
      page_count,
      records: merchants.length,
    };
    return {
      merchants,
      pagination,
    };
  },
  async getById(id) {
    return await MerchantModel.findByPk(id);
  },
  async getOne(query) {
    return await MerchantModel.findOne({ where: query });
  },
});

