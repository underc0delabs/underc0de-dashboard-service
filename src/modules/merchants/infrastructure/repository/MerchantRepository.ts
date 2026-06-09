import { IMerchantRepository } from "../../core/repository/IMerchantRepository.js";
import MerchantModel from "../models/MerchantModel.js";
import CategoryModel from "../../../categories/infrastructure/models/CategoryModel.js";
import configs from "../../../../configs.js";
import IMerchant from "../../core/entities/IMerchant.js";
import { getFileUrl } from "../../../../helpers/file-url.js";

const enrichMerchant = (merchant: Record<string, unknown>) => {
  const categoryRef = merchant.businessCategory as
    | { id?: string; name?: string }
    | null
    | undefined;
  if (categoryRef?.name) {
    merchant.categoryName = categoryRef.name;
  } else {
    merchant.categoryName = null;
  }
  delete merchant.businessCategory;
  if (merchant.logo) {
    merchant.logo = getFileUrl(String(merchant.logo));
  }
  return merchant as unknown as IMerchant;
};

export const MerchantRepository = (): IMerchantRepository => ({
  async save(merchant) {
    const newMerchant = await MerchantModel.create(merchant as any);
    const saved = await MerchantModel.findByPk(newMerchant.get("id") as string, {
      include: [
        {
          model: CategoryModel,
          as: "businessCategory",
          attributes: ["id", "name"],
          required: false,
        },
      ],
    });
    if (!saved) {
      const merchantData = newMerchant.toJSON() as any;
      if (merchantData.logo) {
        merchantData.logo = getFileUrl(merchantData.logo);
      }
      return merchantData as IMerchant;
    }
    return enrichMerchant(saved.toJSON() as Record<string, unknown>);
  },
  async edit(merchant, id) {
    return await MerchantModel.update(merchant as any, { where: { id } });
  },
  async remove(id) {
    return await MerchantModel.destroy({ where: { id } });
  },
  async get(query) {
    const {
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
      "usersProDisccount",
      "usersDisccount",
      "url",
      "detail",
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

    const merchants = await MerchantModel.findAll({
      where: whereClause,
      include: [
        {
          model: CategoryModel,
          as: "businessCategory",
          attributes: ["id", "name"],
          required: false,
        },
      ],
    });

    const merchantsWithUrls = merchants.map((merchant: any) =>
      enrichMerchant((merchant.toJSON ? merchant.toJSON() : merchant) as Record<string, unknown>),
    );
    
    return {
      merchants: merchantsWithUrls,
    };
  },
  async getById(id) {
    const merchant = await MerchantModel.findByPk(id, {
      include: [
        {
          model: CategoryModel,
          as: "businessCategory",
          attributes: ["id", "name"],
          required: false,
        },
      ],
    });
    if (!merchant) return null;
    return enrichMerchant(merchant.toJSON() as Record<string, unknown>);
  },
  async getOne(query) {
    const merchant = await MerchantModel.findOne({
      where: query,
      include: [
        {
          model: CategoryModel,
          as: "businessCategory",
          attributes: ["id", "name"],
          required: false,
        },
      ],
    });
    if (!merchant) return null;
    return enrichMerchant(merchant.toJSON() as Record<string, unknown>);
  },
});
