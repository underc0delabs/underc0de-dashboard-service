import { IUserRepository } from "../repository/IMongoUserRepository";

export interface ISaveFcmTokenAction {
  execute: (body: { fcmToken: string; userId: string }) => Promise<any>;
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
          user.fcmToken = body.fcmToken;
          await UserRepository.save(user);
          resolve(user);
        } catch (error) {
          reject(error);
        }
      });
    },
  };
};
