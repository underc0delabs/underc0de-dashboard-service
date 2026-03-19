import crypto from "crypto";
import IUser from "../entities/IUser.js";
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
          const user = {
            ...body,
            userType: body.userType ?? 0,
            status: body.status ?? true,
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
