import jwt_token from "jsonwebtoken";
import configs from "../configs.js";

/**
 * Genera un JWT de acceso con payload { id }.
 * @param id - User id (string)
 * @param expiresInSeconds - Opcional. Si no se pasa, usa configs.access_token_expires_seconds (default 15 min)
 */
const generateJWT = async (
  id: string,
  expiresInSeconds?: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const payload = { id };
    const expiresIn =
      expiresInSeconds ??
      (configs as any).access_token_expires_seconds ??
      900;
    jwt_token.sign(
      payload,
      configs.secret_key as string,
      { expiresIn },
      (err: Error | null, token: string | undefined) => {
        if (err || !token) {
          reject("No se pudo generar token");
        } else {
          resolve(token);
        }
      }
    );
  });
};

export default generateJWT;
