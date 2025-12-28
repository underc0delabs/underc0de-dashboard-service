import { IUserRepository } from "../repository/IMongoUserRepository";
import { UserNotExistException } from "../exceptions/UserNotExistException";

export interface IGetUserByUsernameAction {
  execute: (username: string) => Promise<any>;
}

export const GetUserByUsernameAction = (
  UserRepository: IUserRepository
): IGetUserByUsernameAction => {
  return {
    execute(username) {
      return new Promise(async (resolve, reject) => {
        try {
          const user = await UserRepository.getOne({ username: username });
          if (!user) throw new UserNotExistException();
          resolve({
            id: user.id,
            username: user.username,
            name: user.name,
            lastname: user.lastname,
            phone: user.phone,
            email: user.email,
            idNumber: user.idNumber,
            userType: user.userType,
            birthday: user.birthday,
            vip: user.vip,
            suscription: user.suscription,
            status: user.status,
            fcmToken: user.fcmToken,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            avatar: user.avatar,
          });
        } catch (error) {
          reject(error);
        }
      });
    },
  };
};
