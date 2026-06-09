import { IUserRepository } from "../repository/IMongoUserRepository.js";
import { UserNotExistException } from "../exceptions/UserNotExistException.js";
import { IFileStorageService } from "../../../merchants/infrastructure/services/FileStorageService.js";

export interface IUploadAvatarAction {
  execute: (id: string, file?: Express.Multer.File) => Promise<{ avatar: string }>;
}

export const UploadAvatarAction = (
  UserRepository: IUserRepository,
  FileStorageService: IFileStorageService,
): IUploadAvatarAction => {
  return {
    execute(id, file) {
      return new Promise(async (resolve, reject) => {
        try {
          if (!file) {
            reject(new Error("No se recibió ninguna imagen"));
            return;
          }

          const user = await UserRepository.getById(id);
          if (!user) throw new UserNotExistException();

          const oldAvatar = (user as { avatar?: string | null }).avatar ?? null;
          const avatarPath = await FileStorageService.saveFile(file, "avatars");

          if (oldAvatar) {
            await FileStorageService.deleteFile(oldAvatar);
          }

          await UserRepository.edit({ avatar: avatarPath } as never, id);
          resolve({ avatar: avatarPath });
        } catch (error) {
          reject(error);
        }
      });
    },
  };
};
