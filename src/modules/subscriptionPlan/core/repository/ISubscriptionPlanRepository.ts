import ISubscriptionPlan from "../entities/ISubscriptionPlan.js";

export interface ISubscriptionPlanRepository {
    save: (subscriptionPlan: ISubscriptionPlan) => Promise<ISubscriptionPlan>,
    edit: (subscriptionPlan: ISubscriptionPlan, id: string) => Promise<any>,
    remove: (id: string) => Promise<any>,
    get: (query: any) => Promise<any>,
    getOne: (query: any) => Promise<any>,
    getById: (id: string) => Promise<any>,
}

