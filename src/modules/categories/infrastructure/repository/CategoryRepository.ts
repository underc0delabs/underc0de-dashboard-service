import ICategory from "../../core/entities/ICategory.js";
import { ICategoryRepository } from "../../core/repository/ICategoryRepository.js";
import CategoryModel from "../models/CategoryModel.js";

const validFields = ["id", "name", "status", "sortOrder", "createdAt", "updatedAt"];

export const CategoryRepository = (): ICategoryRepository => ({
  async save(category) {
    const created = await CategoryModel.create(category as never);
    return created.toJSON() as ICategory;
  },
  async edit(category, id) {
    return CategoryModel.update(category as never, { where: { id } });
  },
  async remove(id) {
    return CategoryModel.destroy({ where: { id } });
  },
  async get(query = {}) {
    const whereClause: Record<string, unknown> = {};
    Object.entries(query).forEach(([key, value]) => {
      if (
        validFields.includes(key) &&
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        whereClause[key] = value;
      }
    });

    const categories = await CategoryModel.findAll({
      where: whereClause,
      order: [
        ["sortOrder", "ASC"],
        ["name", "ASC"],
      ],
    });

    return {
      categories: categories.map((row) => row.toJSON() as ICategory),
    };
  },
  async getById(id) {
    const category = await CategoryModel.findByPk(id);
    return category ? (category.toJSON() as ICategory) : null;
  },
  async getOne(query) {
    const category = await CategoryModel.findOne({ where: query as never });
    return category ? (category.toJSON() as ICategory) : null;
  },
});
