import configs from "../configs.js";

const getAssetBaseUrl = (): string => {
  const uri = (configs.api.uri || "http://localhost:3002").replace(/\/$/, "");
  const prefix = (configs.api.prefix || "/api/v1").replace(/\/$/, "");
  if (uri.endsWith(prefix)) {
    return uri.slice(0, -prefix.length).replace(/\/$/, "") || uri;
  }
  return uri.replace(/\/api\/v1\/?$/, "");
};

const normalizeUploadUrl = (url: string): string =>
  url.replace(/\/api\/v1(\/uploads\/)/i, "$1");

export const getFileUrl = (filePath: string | null | undefined): string | null => {
  if (!filePath) {
    return null;
  }

  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return normalizeUploadUrl(filePath);
  }

  const baseUrl = getAssetBaseUrl();
  const cleanPath = filePath.startsWith("/") ? filePath : `/${filePath}`;

  return `${baseUrl}${cleanPath}`;
};

