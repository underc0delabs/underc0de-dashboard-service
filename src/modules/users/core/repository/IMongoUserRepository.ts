import IUser from "../entities/IUser.js";

export interface IUserRepository {
    save: (user:IUser) => Promise<IUser>,
    edit: (user:IUser, id:string) => Promise<any>,
    remove:(id:string) => Promise<any>,
    get: (query:any) => Promise<any>,
    getOne: (query:any, includePassword?: boolean) => Promise<any>,
    getOneByEmailIgnoreCase: (email: string, includePassword?: boolean) => Promise<any>,
    getOneByMercadopagoEmailIgnoreCase: (email: string) => Promise<any>,
    getOneByUsernameIgnoreCase: (username: string, includePassword?: boolean) => Promise<any>,
    getOneByUsernameAccentFoldIgnoreCase: (
        username: string,
        includePassword?: boolean
    ) => Promise<any>,
    getById: (id:string) => Promise<any>,
    listUsersWithBirthdays: () => Promise<Array<{
        id: number;
        username: string;
        name: string;
        lastname: string | null;
        displayName: string;
        phone: string | null;
        birthday: string;
        country: string | null;
    }>>,
}