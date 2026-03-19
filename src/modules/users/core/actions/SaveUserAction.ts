import crypto from "crypto";
import IUser from "../entities/IUser.js";

const parseBirthday = (str: string): Date => {
  if (!str) return new Date();
  const [d, m, y] = str.split("/");
  if (d && m && y) {
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    return isNaN(date.getTime()) ? new Date() : date;
  }
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};
import { IUserRepository } from "../repository/IMongoUserRepository.js";
import { IHashService } from "../services/IHashService.js";

export interface ISaveUserAction {
  execute: (body: IUser, req?: any) => Promise<any>;
}

export const SaveUserAction = (
  UserRepository: IUserRepository,
  hashService: IHashService
): ISaveUserAction => {
  return {
    execute: (body, req) => {
      return new Promise(async (resolve, reject) => {
        try {
          const authId = req?.auth?.id;
          if (authId) {
            const payload: any = {
              name: body.name,
              lastname: body.lastname,
              phone: body.phone,
              email: body.email,
              idNumber: body.idNumber,
              birthday: body.birthday,
            };
            if (body.password) {
              payload.password = hashService.hash(body.password);
            }
            await UserRepository.edit(payload, authId);
            const updated = await UserRepository.getById(authId);
            resolve(updated);
            return;
          }
          const birthday =
            body.birthday instanceof Date
              ? body.birthday
              : typeof body.birthday === "string"
                ? parseBirthday(body.birthday)
                : new Date();
          const user: any = {
            username: body.username,
            name: body.name,
            lastname: body.lastname ?? "",
            phone: body.phone ?? "",
            email: body.email,
            idNumber: body.idNumber ?? "",
            userType: body.userType ?? 0,
            status: body.status ?? true,
            birthday,
            is_pro: body.vip ?? false,
            password: hashService.hash(body.password || crypto.randomBytes(32).toString("hex")),
          };
          const result = await UserRepository.save(user);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    },
  };
};
