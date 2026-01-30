import IAdminUser from "../../core/entities/IAdminUser.js";

export interface IAdminUserRepository {
    save: (user:IAdminUser) => Promise<IAdminUser>,
    edit: (user:IAdminUser, id:string) => Promise<any>,
    remove:(id:string) => Promise<any>,
    get: (query:any) => Promise<any>,
    getOne: (query:any, includePassword?: boolean) => Promise<any>,
    getById: (id:string) => Promise<any>,
}