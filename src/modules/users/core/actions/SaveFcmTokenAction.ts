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
            return;
          }
          /** Solo fcmToken: el objeto user de getById trae relaciones anidadas y rompe el UPDATE. */
          await UserRepository.edit(
            { fcmToken: body.token } as any,
            String(body.userId)
          );
          resolve({ ...user, fcmToken: body.token });
        } catch (error) {
          reject(error);
        }
      });
    },
  };
};
