import { IPaymentRepository } from "../../core/repository/IPaymentRepository";
import PaymentModel from "../models/PaymentModel";
import configs from "../../../../configs";
import IPayment from "../../core/entities/IPayment";

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
    const total = await PaymentModel.count(rest);
    const payments = await PaymentModel.findAll({
      where: rest,
      limit: Number(page_count),
      offset: Number(page_number),
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

