import { IPaymentRepository } from "../../core/repository/IPaymentRepository.js";
import PaymentModel from "../models/PaymentModel.js";
import configs from "../../../../configs.js";
import IPayment from "../../core/entities/IPayment.js";

export const PaymentRepository = (): IPaymentRepository => ({
  async save(payment) {
    const newPayment = await PaymentModel.create(payment as any);
    return newPayment.toJSON() as IPayment;
  },
  async edit(payment, id) {
    return await PaymentModel.update(payment as any, { where: { id } });
  },
  async remove(id) {
    return await PaymentModel.destroy({ where: { id } });
  },
  async get(query) {
    const {
      page_count = configs.api.default_page_count,
      page_number = 0,
      ...rest
    } = query;
    
    // Sanitizar page_count y page_number para evitar NaN
    const pageCount = Number(page_count) || Number(configs.api.default_page_count) || 10;
    const pageNumber = Number(page_number) || 0;
    
    const total = await PaymentModel.count({ where: rest });
    const payments = await PaymentModel.findAll({
      where: rest,
      limit: pageCount,
      offset: pageNumber * pageCount,
      order: [['paidAt', 'DESC']]
    });
    const pagination = {
      total,
      page_number,
      page_count,
      records: payments.length,
    };
    return {
      payments,
      pagination,
    };
  },
  async getById(id) {
    return await PaymentModel.findByPk(id);
  },
  async getOne(query) {
    return await PaymentModel.findOne({ where: query });
  },
});

