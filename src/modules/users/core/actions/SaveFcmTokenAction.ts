import { IUserRepository } from "../repository/IMongoUserRepository.js";

export interface ISaveFcmTokenAction {
  execute: (body: { token: string; userId: string }) => Promise<any>;
}

export const SaveFcmTokenAction = (
  UserRepository: IUserRepository
): ISaveFcmTokenAction => {
  return {
    execute: (body) => {
      return new Promise(async (resolve, reject) => {
        try {
          const user = await UserRepository.getById(body.userId);
          if (!user) {
            reject(new Error("User not found"));
          }
          user.fcmToken = body.token;
          await UserRepository.edit(user, user.id);
          resolve(user);
        } catch (error) {
          reject(error);
        }
      });
    },
  };
};
