import IPayment from "../entities/IPayment.js";

export interface IPaymentRepository {
    save: (payment: IPayment) => Promise<IPayment>,
    edit: (payment: IPayment, id: string) => Promise<any>,
    remove: (id: string) => Promise<any>,
    get: (query: any) => Promise<any>,
    getOne: (query: any) => Promise<any>,
    getById: (id: string) => Promise<any>,
}

