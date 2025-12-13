import configs from "../configs";

export const getFileUrl = (filePath: string | null | undefined): string | null => {
  if (!filePath) {
    return null;
  }

  // Si ya es una URL completa, retornarla tal cual
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }

  // Construir la URL completa usando la URI del servidor
  const baseUrl = configs.api.uri || 'http://localhost:3002';
  const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
  
  return `${baseUrl}${cleanPath}`;
};

