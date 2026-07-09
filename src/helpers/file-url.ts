import configs from "../configs.js";

const getAssetBaseUrl = (): string => {
  const uri = (configs.api.uri || "http://localhost:3002").replace(/\/$/, "");
  const prefix = (configs.api.prefix || "/api/v1").replace(/\/$/, "");
  if (uri.endsWith(prefix)) {
    return uri.slice(0, -prefix.length).replace(/\/$/, "") || uri;
  }
  return uri.replace(/\/api\/v1\/?$/, "");
};

export const normalizeUploadPath = (
  filePath: string | null | undefined,
): string | null => {
  if (!filePath) {
    return null;
  }

  const raw = String(filePath).trim();
  if (!raw) {
    return null;
  }

  const uploadsIndex = raw.indexOf("/uploads/");
  if (uploadsIndex >= 0) {
    return raw.slice(uploadsIndex);
  }

  if (raw.startsWith("uploads/")) {
    return `/${raw}`;
  }

  return raw.startsWith("/") ? raw : `/${raw}`;
};

export const getFileUrl = (filePath: string | null | undefined): string | null => {
  const uploadPath = normalizeUploadPath(filePath);
  if (!uploadPath) {
    return null;
  }

  const baseUrl = getAssetBaseUrl();
  return `${baseUrl}${uploadPath}`;
};

