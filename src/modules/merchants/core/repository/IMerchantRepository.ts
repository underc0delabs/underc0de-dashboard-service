import IMerchant from "../entities/IMerchant.js";

export interface IMerchantRepository {
    save: (merchant: IMerchant) => Promise<IMerchant>,
    edit: (merchant: IMerchant, id: string) => Promise<any>,
    remove: (id: string) => Promise<any>,
    get: (query: any) => Promise<any>,
    getOne: (query: any) => Promise<any>,
    getById: (id: string) => Promise<any>,
}

