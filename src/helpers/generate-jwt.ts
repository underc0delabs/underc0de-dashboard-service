import jwt_token from "jsonwebtoken";
import configs from "../configs.js"
const generateJWT = async (id: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const payload = { id };
    jwt_token.sign(
      payload,
      configs.secret_key as string,
      {},
      (err: Error | null, token: string | undefined) => {
        if (err || !token) {
          reject("No se pudo generar token");
        } else {
          resolve(token);
        }
      }
    ) as unknown as string; 
  });
};

export default generateJWT
