import { IMerchantRepository } from "../../core/repository/IMerchantRepository";
import MerchantModel from "../models/MerchantModel";
import configs from "../../../../configs";
import IMerchant from "../../core/entities/IMerchant";
import { getFileUrl } from "../../../../helpers/file-url";

export const MerchantRepository = (): IMerchantRepository => ({
  async save(merchant) {
    const newMerchant = await MerchantModel.create(merchant as any);
    const merchantData = newMerchant.toJSON() as any;
    if (merchantData.logo) {
      merchantData.logo = getFileUrl(merchantData.logo);
    }
    return merchantData as IMerchant;
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

    const validFields = [
      "id",
      "name",
      "address",
      "phone",
      "email",
      "status",
      "category",
      "logo",
      "createdAt",
      "updatedAt",
    ];
    const whereClause: any = {};

    Object.keys(rest).forEach((key) => {
      if (
        validFields.includes(key) &&
        rest[key] !== undefined &&
        rest[key] !== null &&
        rest[key] !== ""
      ) {
        whereClause[key] = rest[key];
      }
    });

    const defaultPageCount = Number(configs.api.default_page_count) || 10;
    const pageCountNum = Number(page_count);
    const pageNumberNum = Number(page_number);

    const total = await MerchantModel.count({ where: whereClause });
    const merchants = await MerchantModel.findAll({
      where: whereClause,
      limit: isNaN(pageCountNum) ? defaultPageCount : pageCountNum,
      offset: isNaN(pageNumberNum) ? 0 : pageNumberNum,
    });
    
    // Convertir rutas relativas de logos a URLs completas
    const merchantsWithUrls = merchants.map((merchant: any) => {
      const merchantData = merchant.toJSON ? merchant.toJSON() : merchant;
      if (merchantData.logo) {
        merchantData.logo = getFileUrl(merchantData.logo);
      }
      return merchantData;
    });
    
    const pagination = {
      total,
      page_number: isNaN(pageNumberNum) ? 0 : pageNumberNum,
      page_count: isNaN(pageCountNum) ? defaultPageCount : pageCountNum,
      records: merchantsWithUrls.length,
    };
    return {
      merchants: merchantsWithUrls,
      pagination,
    };
  },
  async getById(id) {
    const merchant = await MerchantModel.findByPk(id);
    if (!merchant) return null;
    const merchantData = merchant.toJSON ? merchant.toJSON() : merchant;
    if (merchantData.logo) {
      merchantData.logo = getFileUrl(merchantData.logo);
    }
    return merchantData;
  },
  async getOne(query) {
    const merchant = await MerchantModel.findOne({ where: query });
    if (!merchant) return null;
    const merchantData = merchant.toJSON ? merchant.toJSON() : merchant;
    if (merchantData.logo) {
      merchantData.logo = getFileUrl(merchantData.logo);
    }
    return merchantData;
  },
});
