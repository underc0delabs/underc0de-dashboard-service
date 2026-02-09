import IUser from "../entities/IUser.js";

export interface IUserRepository {
    save: (user:IUser) => Promise<IUser>,
    edit: (user:IUser, id:string) => Promise<any>,
    remove:(id:string) => Promise<any>,
    get: (query:any) => Promise<any>,
    getOne: (query:any, includePassword?: boolean) => Promise<any>,
    getOneByEmailIgnoreCase: (email: string) => Promise<any>,
    getOneByMercadopagoEmailIgnoreCase: (email: string) => Promise<any>,
    getById: (id:string) => Promise<any>,
}