import { IUserRepository } from "../repository/IMongoUserRepository.js";

export type UserBirthdayEntry = {
  id: number;
  username: string;
  name: string;
  lastname: string | null;
  displayName: string;
  phone: string | null;
  birthday: string;
  country: string | null;
};

export interface IGetUsersBirthdaysAction {
  execute: () => Promise<UserBirthdayEntry[]>;
}

export const GetUsersBirthdaysAction = (
  UserRepository: IUserRepository,
): IGetUsersBirthdaysAction => ({
  async execute() {
    return UserRepository.listUsersWithBirthdays();
  },
});
