import fs from 'fs';
import path from 'path';

export interface IFileStorageService {
  saveFile: (file: Express.Multer.File, subfolder?: string) => Promise<string>;
  deleteFile: (filePath: string) => Promise<void>;
}

export const FileStorageService = (): IFileStorageService => {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

  const ensureDirectoryExists = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  };

  const generateUniqueFileName = (originalName: string): string => {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(originalName);
    const baseName = path.basename(originalName, fileExtension).replace(/[^a-zA-Z0-9]/g, '_');
    return `${baseName}_${timestamp}_${random}${fileExtension}`;
  };

  return {
    async saveFile(file: Express.Multer.File, subfolder = 'logos'): Promise<string> {
      try {
        const targetDir = path.join(uploadsDir, subfolder);
        ensureDirectoryExists(targetDir);

        const fileName = generateUniqueFileName(file.originalname);
        const filePath = path.join(targetDir, fileName);

        fs.writeFileSync(filePath, file.buffer);

        const relativePath = `/uploads/${subfolder}/${fileName}`;
        return relativePath;
      } catch (error) {
        throw new Error(`Error al guardar el archivo: ${error}`);
      }
    },

    async deleteFile(filePath: string): Promise<void> {
      try {
        const fullPath = path.join(process.cwd(), 'public', filePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (error) {
        console.error(`Error al eliminar el archivo ${filePath}:`, error);
      }
    },
  };
};

